import { Request, Response } from 'express';
import { User } from '../models/user';
import { Slot } from '../models/slot';
import { Admin } from '../models/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AdminController {
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { age, pincode, vaccinationStatus } = req.query;
      const query: any = {};

      if (age) query.age = parseInt(age as string);
      if (pincode) query.pincode = pincode;
      if (vaccinationStatus) query.vaccinationStatus = vaccinationStatus;

      // Use aggregation for better performance with large datasets
      const users = await User.aggregate([
        { $match: query },
        {
          $project: {
            name: 1,
            age: 1,
            pincode: 1,
            vaccinationStatus: 1,
            registeredSlots: 1
          }
        }
      ]).hint({ age: 1, pincode: 1, vaccinationStatus: 1 });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getSlotRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { date, dose } = req.query;
      
      const pipeline = [
        {
          $match: {
            date: new Date(date as string),
            ...(dose && { 'registeredUsers.dose': dose })
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'registeredUsers.userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $project: {
            startTime: 1,
            endTime: 1,
            availableDoses: 1,
            registeredUsers: 1,
            userDetails: {
              name: 1,
              age: 1,
              pincode: 1
            }
          }
        }
      ];

      const slots = await Slot.aggregate(pipeline);
      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async login(req: any, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      // Find admin
      const admin = await Admin.findOne({ username });
      if (!admin) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { _id: admin._id, username: admin.username, role: 'admin' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '12h' }
      );

      // Send response
      res.status(200).json({
        message: 'Admin login successful',
        token,
        admin: {
          _id: admin._id,
          username: admin.username
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

