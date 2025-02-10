// db.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  age: Number,
  pincode: String,
  aadharNo: String,
  password: String,
  vaccinationStatus: { type: String, default: 'none' }, 
  registeredSlots: [{ dose: String, date: Date }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});


// Slot Schema
const slotSchema = new mongoose.Schema({
  date: Date,
  time: String,
  availableDoses: { type: Number, default: 10 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});




const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Slot = mongoose.model('Slot', slotSchema);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB Atlas');
  } catch (error:any) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export { User, Admin, Slot, connectToDatabase };
