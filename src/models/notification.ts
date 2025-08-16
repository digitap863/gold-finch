import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  isRead: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userType: { 
    type: String, 
    required: true,
    enum: ['salesman'],
    default: 'salesman'
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
  orderCode: { type: String, required: false },
  metadata: { type: Object, default: {} }, // For additional data like old/new status
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
