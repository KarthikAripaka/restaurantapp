const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['combo', 'coupon', 'promo', 'seasonal'],
      default: 'promo',
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat', 'free_delivery'],
      default: 'percent',
    },
    discountValue: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // cap for percent discounts
    code: { type: String, uppercase: true, trim: true }, // coupon code
    imageUrl: { type: String },
    cloudinaryId: { type: String },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    usageLimit: { type: Number }, // max total uses
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    applicableItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

offerSchema.index({ restaurantId: 1, isActive: 1 });

module.exports = mongoose.model('Offer', offerSchema);
