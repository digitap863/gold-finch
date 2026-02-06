import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';

// Define compact styles for single-page PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 25,
    fontFamily: 'Helvetica',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
    backgroundColor: '#F3F4F6',
    padding: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 70,
    color: '#666666',
  },
  value: {
    fontSize: 8,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E5E7EB',
    padding: 3,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 7,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    backgroundColor: '#FEF3C7',
    padding: 3,
    borderRadius: 3,
    marginLeft: 5,
  },
  priorityText: {
    fontSize: 7,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 8,
    lineHeight: 1.3,
    backgroundColor: '#F9FAFB',
    padding: 4,
    borderRadius: 2,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 2,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  orderImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
    objectFit: 'cover',
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 16,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 7,
    textAlign: 'center',
  },
  tableCellLast: {
    flex: 1,
    padding: 3,
    fontSize: 7,
    textAlign: 'center',
  },
  tableCellNarrow: {
    flex: 0.6,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 7,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    borderTop: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: '#666666',
    textAlign: 'center',
  },
  featuresBadge: {
    fontSize: 7,
    backgroundColor: '#E5E7EB',
    padding: 2,
    borderRadius: 2,
    marginRight: 3,
    marginBottom: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 6,
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
  
  // New fields
  karatage?: string;
  weight?: number;
  colour?: string;
  name?: string;
  size?: {
    type: 'plastic' | 'metal';
    value: string;
  };
  stone?: boolean;
  enamel?: boolean;
  matte?: boolean;
  rodium?: boolean;
  
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
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Order: {order.orderCode}</Text>
            <Text style={styles.subtitle}>{order.productName}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
            </View>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{order.priority}</Text>
            </View>
          </View>
        </View>

        {/* Two Column Layout for Order Info & Specifications */}
        <View style={styles.twoColumnContainer}>
          {/* Left Column: Order Information */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              
              <View style={styles.row}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{order.customerName}</Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Model:</Text>
                <Text style={styles.value}>{order.catalogId?.style || '-'}</Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Order Date:</Text>
                <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
              </View>
              
              {order.expectedDeliveryDate && (
                <View style={styles.row}>
                  <Text style={styles.label}>Due Date:</Text>
                  <Text style={styles.value}>{formatDate(order.expectedDeliveryDate)}</Text>
                </View>
              )}
              
              <View style={styles.row}>
                <Text style={styles.label}>Salesman:</Text>
                <Text style={styles.value}>{order.salesmanId?.name || order.salesmanId?.email || '-'}</Text>
              </View>

              {order.salesmanId?.mobile && (
                <View style={styles.row}>
                  <Text style={styles.label}>Mobile:</Text>
                  <Text style={styles.value}>{order.salesmanId.mobile}</Text>
                </View>
              )}

              {order.salesmanId?.shopName && (
                <View style={styles.row}>
                  <Text style={styles.label}>Shop:</Text>
                  <Text style={styles.value}>{order.salesmanId.shopName}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Column: Product Specifications */}
          <View style={styles.column}>
            {(order.karatage || order.weight || order.colour || order.name || order.size) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Specifications</Text>
                
                {order.karatage && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Karatage:</Text>
                    <Text style={styles.value}>{order.karatage}</Text>
                  </View>
                )}
                
                {order.weight && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Weight:</Text>
                    <Text style={styles.value}>{order.weight}g</Text>
                  </View>
                )}
                
                {order.colour && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Colour:</Text>
                    <Text style={styles.value}>{order.colour}</Text>
                  </View>
                )}
                
                {order.name && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{order.name}</Text>
                  </View>
                )}
                
                {order.size && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Size:</Text>
                    <Text style={styles.value}>{order.size.type} - {order.size.value}</Text>
                  </View>
                )}

                {(order.stone || order.enamel || order.matte || order.rodium) && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Features:</Text>
                    <View style={styles.featuresContainer}>
                      {order.stone && <Text style={styles.featuresBadge}>Stone</Text>}
                      {order.enamel && <Text style={styles.featuresBadge}>Enamel</Text>}
                      {order.matte && <Text style={styles.featuresBadge}>Matte</Text>}
                      {order.rodium && <Text style={styles.featuresBadge}>Rodium</Text>}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Catalog Info */}
            {order.catalogId && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Catalog Info</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Title:</Text>
                  <Text style={styles.value}>{order.catalogId.title}</Text>
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
              </View>
            )}
          </View>
        </View>

        {/* Customization Details */}
        {order.customizationDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization Details</Text>
            <Text style={styles.description}>{order.customizationDetails}</Text>
          </View>
        )}

        {/* Order Images - Compact */}
        {order.images && order.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Images</Text>
            <View style={styles.imagesContainer}>
              {order.images.slice(0, 4).map((img, idx) => (
                <Image 
                  key={idx} 
                  src={img} 
                  style={styles.orderImage} 
                />
              ))}
              {order.images.length > 4 && (
                <Text style={{ fontSize: 8, color: '#666' }}>+{order.images.length - 4} more</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Production Tracking Table - Compact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Workflow</Text>
          
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellNarrow}>STAGE</Text>
              <Text style={styles.tableCell}>WORKER (ISSUE)</Text>
              <Text style={styles.tableCell}>WORKER (RECEIPT)</Text>
              <Text style={styles.tableCellLast}>NOTES</Text>
            </View>
            
            {/* Data Rows - Compact */}
            {['FILING', 'VACUUM', 'FILING', 'BUFFING', 'SETTING', 'BUFFING', 'DETAILS'].map((stage, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCellNarrow}>{stage}</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCellLast}></Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()} • Order ID: {order.orderCode} • Customer: {order.customerName}
          </Text>
        </View>
      </Page>
    </Document>
  );
};


export default OrderPDF;
