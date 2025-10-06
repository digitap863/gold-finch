import { connect } from "@/db.Config/db.Config";
import Notification from "@/models/notification";

// Notification system is designed specifically for salesmen
// to receive order status updates and important information

interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  userType: 'salesman';
  orderId?: string;
  orderCode?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await connect();
    
    const notification = new Notification(params);
    await notification.save();
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Helper to create order status change notifications for salesmen
export async function createOrderStatusNotification(
  orderId: string,
  orderCode: string,
  salesmanId: string,
  oldStatus: string,
  newStatus: string,
  customerName?: string,
  cancelReason?: string
) {
  const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
    'confirmed': {
      title: 'Order Confirmed',
      message: `Your order ${orderCode}${customerName ? ` for ${customerName}` : ''} has been confirmed and is being processed.`,
      type: 'success'
    },
    'order_view_and_accepted': {
      title: 'Order Accepted',
      message: `Order ${orderCode}${customerName ? ` for ${customerName}` : ''} has been reviewed and accepted by the production team.`,
      type: 'success'
    },
    'cad_completed': {
      title: 'CAD Design Completed',
      message: `CAD design for order ${orderCode}${customerName ? ` (${customerName})` : ''} has been completed and approved.`,
      type: 'success'
    },
    'production_floor': {
      title: 'Production Started',
      message: `Order ${orderCode}${customerName ? ` for ${customerName}` : ''} is now in production. Manufacturing has begun.`,
      type: 'info'
    },
    'finished': {
      title: 'Production Completed',
      message: `Great news! Order ${orderCode}${customerName ? ` for ${customerName}` : ''} has been completed and is ready for dispatch.`,
      type: 'success'
    },
    'dispatched': {
      title: 'Order Dispatched',
      message: `Order ${orderCode}${customerName ? ` for ${customerName}` : ''} has been dispatched and is on its way to delivery.`,
      type: 'success'
    },
    'cancelled': {
      title: 'Order Cancelled',
      message: `Order ${orderCode}${customerName ? ` for ${customerName}` : ''} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ' Please contact support for more details.'}`,
      type: 'error'
    }
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return null;

  return await createNotification({
    title: statusInfo.title,
    message: statusInfo.message,
    type: statusInfo.type,
    userId: salesmanId,
    userType: 'salesman',
    orderId,
    orderCode,
    metadata: {
      oldStatus,
      newStatus,
      customerName,
      ...(cancelReason && { cancelReason })
    }
  });
}
