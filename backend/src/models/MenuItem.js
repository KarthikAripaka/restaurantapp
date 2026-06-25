const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number }, // original price if on discount
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot', 'none'],
      default: 'none',
    },
    tags: [{ type: String, lowercase: true }], // e.g. ['spicy', 'new', 'popular']
    sortOrder: { type: Number, default: 0 },
    prepTimeMinutes: { type: Number, default: 20 },
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
