import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  customerName: { type: String, required: true },
  customizationDetails: { type: String, required: false },
  voiceRecording: { type: String, required: false }, // URL to audio file
  images: { type: [String], required: false }, // Array of image URLs
  expectedDeliveryDate: { type: Date, required: false },
  catalogId: { type: mongoose.Schema.Types.ObjectId, ref: "Catalog", required: false },
  
  // New fields
  karatage: { type: String, required: false },
  weight: { type: Number, required: false },
  colour: { type: String, required: false },
  name: { type: String, required: false },
  size: {
    type: { type: String, enum: ['plastic', 'metal'], required: false },
    value: { type: String, required: false }
  },
  stone: { type: Boolean, default: false },
  enamel: { type: Boolean, default: false },
  matte: { type: Boolean, default: false },
  rodium: { type: Boolean, default: false },
  
  status: { 
    type: String, 
    enum: ['confirmed', 'order_view_and_accepted', 'cad_completed', 'production_floor', 'finished', 'dispatched', 'cancelled'],
    default: 'confirmed'
  },
  salesmanId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
