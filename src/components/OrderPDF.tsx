import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 120,
    color: '#666666',
  },
  value: {
    fontSize: 12,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E5E7EB',
    padding: 4,
    borderRadius: 4,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    backgroundColor: '#FEF3C7',
    padding: 4,
    borderRadius: 4,
    marginBottom: 5,
  },
  priorityText: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 11,
    lineHeight: 1.5,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
});

interface OrderDetail {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  expectedDeliveryDate?: string;
  catalogId?: {
    _id: string;
    title: string;
    style: string;
    images: string[];
    files: string[];
    size: string;
    weight: number;
    description?: string;
    font?: {
      _id: string;
      name: string;
      files: string[];
    };
  };
  salesmanId?: {
    _id: string;
    name?: string;
    email?: string;
    mobile?: string;
    shopName?: string;
    shopAddress?: string;
    shopMobile?: string;
  };
}

interface OrderPDFProps {
  order: OrderDetail;
}

const OrderPDF: React.FC<OrderPDFProps> = ({ order }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order Details</Text>
          <Text style={styles.subtitle}>{order.orderCode}</Text>
          <View style={styles.row}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
            </View>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{order.priority}</Text>
            </View>
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Product Name:</Text>
            <Text style={styles.value}>{order.productName}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
          
          {order.expectedDeliveryDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Expected Delivery:</Text>
              <Text style={styles.value}>{formatDate(order.expectedDeliveryDate)}</Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={styles.label}>Salesman:</Text>
            <Text style={styles.value}>
              {order.salesmanId?.name || order.salesmanId?.email || order.salesmanId?.mobile || '-'}
            </Text>
          </View>

          {order.salesmanId?.shopName && (
            <View style={styles.row}>
              <Text style={styles.label}>Shop Name:</Text>
              <Text style={styles.value}>{order.salesmanId.shopName}</Text>
            </View>
          )}

          {order.salesmanId?.shopMobile && (
            <View style={styles.row}>
              <Text style={styles.label}>Shop Mobile:</Text>
              <Text style={styles.value}>{order.salesmanId.shopMobile}</Text>
            </View>
          )}

          {order.salesmanId?.shopAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Shop Address:</Text>
              <Text style={styles.value}>{order.salesmanId.shopAddress}</Text>
            </View>
          )}
        </View>

        {/* Customization Details */}
        {order.customizationDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization Details</Text>
            <Text style={styles.description}>{order.customizationDetails}</Text>
          </View>
        )}

        {/* Media Information */}
        {(order.voiceRecording || (order.images && order.images.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media Files</Text>
            
            {order.voiceRecording && (
              <View style={styles.row}>
                <Text style={styles.label}>Voice Recording:</Text>
                <Text style={styles.value}>Available (see digital copy)</Text>
              </View>
            )}
            
            {order.images && order.images.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Images:</Text>
                <Text style={styles.value}>{order.images.length} image(s) attached</Text>
              </View>
            )}
          </View>
        )}

        {/* Catalog Details */}
        {order.catalogId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catalog Information</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Title:</Text>
              <Text style={styles.value}>{order.catalogId.title}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Style:</Text>
              <Text style={styles.value}>{order.catalogId.style}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Size:</Text>
              <Text style={styles.value}>{order.catalogId.size}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Weight:</Text>
              <Text style={styles.value}>{order.catalogId.weight}g</Text>
            </View>

            {order.catalogId.font && (
              <View style={styles.row}>
                <Text style={styles.label}>Font:</Text>
                <Text style={styles.value}>{order.catalogId.font.name}</Text>
              </View>
            )}
            
            {order.catalogId.description && (
              <View style={styles.section}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{order.catalogId.description}</Text>
              </View>
            )}

            {order.catalogId.images && order.catalogId.images.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Catalog Images:</Text>
                <Text style={styles.value}>{order.catalogId.images.length} image(s)</Text>
              </View>
            )}

            {order.catalogId.files && order.catalogId.files.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>3D Files:</Text>
                <Text style={styles.value}>{order.catalogId.files.length} file(s)</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()} • Order ID: {order._id}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderPDF;
