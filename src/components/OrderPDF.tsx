import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';

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
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellLast: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellSpan: {
    flex: 2,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellNarrow: {
    flex: 0.5,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 10,
    textAlign: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    width: 180,
    height: 180,
    marginRight: 10,
    marginBottom: 10,
  },
  orderImage: {
    width: 180,
    height: 180,
    objectFit: 'cover',
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
            <Text style={styles.value}>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short", 
                day: "numeric"
              })}
            </Text>
          </View>
          
          {order.expectedDeliveryDate && (
            <View style={styles.row}>
              <Text style={styles.label}>DUE DATE:</Text>
              <Text style={styles.value}>
                {new Date(order.expectedDeliveryDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={styles.label}>Salesman:</Text>
            <Text style={styles.value}>
              {order.salesmanId?.name || order.salesmanId?.email || '-'}
            </Text>
          </View>

          {order.salesmanId?.mobile && (
            <View style={styles.row}>
              <Text style={styles.label}>Salesman Mobile:</Text>
              <Text style={styles.value}>{order.salesmanId.mobile}</Text>
            </View>
          )}

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

        {/* Product Specifications */}
        {(order.karatage || order.weight || order.colour || order.name || order.size || order.stone || order.enamel || order.matte || order.rodium) && (
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
                <Text style={styles.value}>
                  {[
                    order.stone && 'Stone',
                    order.enamel && 'Enamel',
                    order.matte && 'Matte',
                    order.rodium && 'Rodium'
                  ].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Customization Details */}
        {order.customizationDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization Details</Text>
            <Text style={styles.description}>{order.customizationDetails}</Text>
          </View>
        )}

        {/* Order Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Images</Text>
          {order.images && order.images.length > 0 ? (
            <View style={styles.imagesContainer}>
              {order.images.map((img, idx) => (
                <Image 
                  key={idx} 
                  src={img} 
                  style={{ width: 180, height: 180, marginRight: 10, marginBottom: 10 }} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>No images uploaded for this order</Text>
            </View>
          )}
        </View>

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

        {/* Footer for first page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()} • Order ID: {order.orderCode}
          </Text>
        </View>
      </Page>

      {/* Second Page - Production Tracking */}
      <Page size="A4" style={styles.page}>
        {/* Header for Production Tracking Page */}
        <View style={styles.header}>
          <Text style={styles.title}>Production Tracking</Text>
          <Text style={styles.subtitle}>{order.orderCode}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Product:</Text>
            <Text style={styles.value}>{order.productName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
        </View>

        {/* Production Tracking Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Workflow</Text>
          
          <View style={styles.table}>
            {/* Header Row 1: blank | Worker Name (spans 2 cols) | blank */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellNarrow}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}>WORKER NAME</Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            
            {/* Header Row 2: blank | Issue | Receipt | blank */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellNarrow}></Text>
              <Text style={styles.tableCell}>ISSUE</Text>
              <Text style={styles.tableCell}>RECEIPT</Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            
            {/* Data Rows (9 rows) */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>FILING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>VACUUM</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>FILING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>BUFFING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>FILING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>BUFFING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>SETTING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>SETTING</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellNarrow}>DETAILS</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCellLast}></Text>
            </View>
          </View>
        </View>

        {/* Footer for second page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()} • Order ID: {order.orderCode} • Page 2
          </Text>
        </View>
      </Page>
    </Document>
  );
};


export default OrderPDF;
