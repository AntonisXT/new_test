const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('MONGO_URI is not defined');
      } else {
        console.log('Skipping MongoDB connection in test environment');
        return;
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Μην κλείνεις τη διαδικασία όταν τρέχουν tests
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
