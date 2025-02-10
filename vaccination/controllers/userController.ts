import { Request, Response } from 'express';
import { User } from '../models/user';
import { Slot } from '../models/slot';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
export class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, phoneNumber, age, pincode, aadharNo, password } = req.body;
      
      const existingUser = await User.findOne({
        $or: [{ phoneNumber }, { aadharNo }]
      });
      
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        name,
        phoneNumber,
        age,
        pincode,
        aadharNo,
        password: hashedPassword,
        vaccinationStatus: 'none',
        registeredSlots: []
      });
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async registerSlot(req: any, res: any): Promise<void> {
    try {
      const { slotId, dose } = req.body;
      const userId = (req as any).user._id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Validate dose eligibility
      if (dose === 'secondDose' && user.vaccinationStatus !== 'firstDose') {
        res.status(400).json({ message: 'First dose not completed' });
        return;
      }

      const slot = await Slot.findById(slotId);
      if (!slot) {
        res.status(404).json({ message: 'Slot not found' });
        return;
      }

      // Check if slot is in the future and has available doses
      const slotDateTime = moment(slot.date).format('YYYY-MM-DD') + ' ' + slot.startTime;
      if (moment(slotDateTime).isBefore(moment())) {
        res.status(400).json({ message: 'Cannot register for past slots' });
        return;
      }

      if (slot.availableDoses <= 0) {
        res.status(400).json({ message: 'No doses available in this slot' });
        return;
      }

      // Check for existing registration in this slot
      const existingRegistration = slot.registeredUsers.find(
        reg => reg.userId.toString() === userId
      );
      if (existingRegistration) {
        res.status(400).json({ message: 'Already registered for this slot' });
        return;
      }

      // Update slot and user
      slot.availableDoses -= 1;
      slot.registeredUsers.push({ userId, dose });
      await slot.save();

      user.registeredSlots.push({
        dose,
        date: slot.date,
        slotTime: slot.startTime
      });

      if (dose === 'firstDose') {
        user.vaccinationStatus = 'firstDose';
      } else if (dose === 'secondDose') {
        user.vaccinationStatus = 'fullyVaccinated';
      }

      await user.save();

      res.status(200).json({ message: 'Slot registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateSlot(req: any, res: any): Promise<void> {
    try {
      const { oldSlotId, newSlotId } = req.body;
      const userId = (req as any).user._id;

      const oldSlot = await Slot.findById(oldSlotId);
      const newSlot = await Slot.findById(newSlotId);
      const user = await User.findById(userId);

      if (!oldSlot || !newSlot || !user) {
        res.status(404).json({ message: 'Invalid slot or user' });
        return;
      }

      // Check if 24 hours before old slot
      const oldSlotDateTime = moment(oldSlot.date).format('YYYY-MM-DD') + ' ' + oldSlot.startTime;
      if (moment(oldSlotDateTime).subtract(24, 'hours').isBefore(moment())) {
        res.status(400).json({ message: 'Cannot modify slot within 24 hours' });
        return;
      }

      // Update slots
      oldSlot.availableDoses += 1;
      oldSlot.registeredUsers = oldSlot.registeredUsers.filter(
        reg => reg.userId.toString() !== userId
      );
      await oldSlot.save();

      newSlot.availableDoses -= 1;
      const dose = user.vaccinationStatus === 'none' ? 'firstDose' : 'secondDose';
      newSlot.registeredUsers.push({ userId, dose });
      await newSlot.save();

      // Update user's registered slots
      const slotIndex = user.registeredSlots.findIndex(
        slot => slot.date.toISOString() === oldSlot.date.toISOString() &&
               slot.slotTime === oldSlot.startTime
      );
      
      if (slotIndex !== -1) {
        user.registeredSlots[slotIndex] = {
          dose,
          date: newSlot.date,
          slotTime: newSlot.startTime
        };
        await user.save();
      }

      res.status(200).json({ message: 'Slot updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
  static async login(req: any, res: any): Promise<void> {
    try {
      const { phoneNumber, password } = req.body;

      // Validate input
      if (!phoneNumber || !password) {
        res.status(400).json({ message: 'Phone number and password are required' });
        return;
      }

      // Find user
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        res.status(401).json({ message: 'Invalid phone number or password' });
        return;
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(401).json({ message: 'Invalid phone number or password' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, phoneNumber: user.phoneNumber },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      // Send response
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          age: user.age,
          pincode: user.pincode,
          vaccinationStatus: user.vaccinationStatus
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getAvailableSlots(req: any, res: any): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get current date at midnight
      const currentDate = moment().startOf('day');

      // Build query based on vaccination status
      const query: any = {
        date: { $gte: currentDate.toDate() },
        availableDoses: { $gt: 0 }
      };

      // If user hasn't taken any dose, show all future slots
      // If user has taken first dose, only show slots after 28 days from first dose
      if (user.vaccinationStatus === 'firstDose' && user.registeredSlots.length > 0) {
        const firstDoseDate = moment(user.registeredSlots[0].date);
        const eligibleDate = firstDoseDate.add(28, 'days');
        query.date.$gte = eligibleDate.toDate();
      }

      // Get slots with population info
      const slots = await Slot.aggregate([
        { $match: query },
        {
          $project: {
            date: 1,
            startTime: 1,
            endTime: 1,
            availableDoses: 1,
            maxDoses: 1,
            registeredCount: { $size: '$registeredUsers' }
          }
        },
        { $sort: { date: 1, startTime: 1 } }
      ]);

      // Format the response
      const formattedSlots = slots.map(slot => ({
        ...slot,
        date: moment(slot.date).format('YYYY-MM-DD'),
        availablePercentage: ((slot.availableDoses / slot.maxDoses) * 100).toFixed(1)
      }));

      res.status(200).json({
        userStatus: {
          vaccinationStatus: user.vaccinationStatus,
          eligibleForDose: user.vaccinationStatus === 'none' ? 'firstDose' : 
                          user.vaccinationStatus === 'firstDose' ? 'secondDose' : 'completed'
        },
        slots: formattedSlots
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
