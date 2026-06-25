require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const DeliveryBoy = require('../models/DeliveryBoy');

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let rider = await DeliveryBoy.findOne({ email: 'rider@dfcrestaurant.com' });
    if (!rider) {
      console.log('Rider not found, creating new one...');
      rider = new DeliveryBoy({
        name: 'Ravi Kumar',
        email: 'rider@dfcrestaurant.com',
        phone: '9876500000',
        password: 'Rider@1234',
        vehicleNumber: 'AP-16-TX-1234',
        isActive: true,
        restaurantId: new mongoose.Types.ObjectId('6a33615852c6e06d91feb950'),
      });
      await rider.save();
      console.log('Created rider@dfcrestaurant.com with password Rider@1234');
    } else {
      rider.password = 'Rider@1234';
      // Mark active
      rider.isActive = true;
      await rider.save();
      console.log('Reset password for rider@dfcrestaurant.com to Rider@1234');
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
};

reset();
