const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'],
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    vehicleNumber: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    // Quick stats shown on admin's riders list
    totalDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One rider email is unique per restaurant (not globally, to keep things simple per-tenant)
deliveryBoySchema.index({ restaurantId: 1, email: 1 }, { unique: true });

deliveryBoySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

deliveryBoySchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

deliveryBoySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
