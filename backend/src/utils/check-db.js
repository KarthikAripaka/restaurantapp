require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const DeliveryBoy = require('../models/DeliveryBoy');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const restaurants = await Restaurant.find().select('+password');
    console.log('\n--- Restaurant Admins ---');
    for (const r of restaurants) {
      console.log(`ID: ${r._id}`);
      console.log(`Name: ${r.name}`);
      console.log(`Email: ${r.ownerEmail}`);
      console.log(`Is Active: ${r.isActive}`);
      // Check if password compares to 'Admin@1234'
      const matchesDefault = await r.comparePassword('Admin@1234');
      console.log(`Password matches 'Admin@1234': ${matchesDefault}`);
    }

    const riders = await DeliveryBoy.find().select('+password');
    console.log('\n--- Delivery Boys (Riders) ---');
    if (riders.length === 0) {
      console.log('No riders found in database!');
    } else {
      for (const rd of riders) {
        console.log(`ID: ${rd._id}`);
        console.log(`Name: ${rd.name}`);
        console.log(`Email: ${rd.email}`);
        console.log(`Is Active: ${rd.isActive}`);
        console.log(`Phone: ${rd.phone}`);
      }
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
};

check();
