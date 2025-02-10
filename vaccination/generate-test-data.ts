
const mongoose = require('mongoose')
const bcrypt  = require('bcryptjs')
const moment = require('moment')
import {User} from './models/user'
import {Slot} from './models/slot'

interface GeneratorConfig {
  numberOfUsers: number;
  batchSize: number;
  startDate: string;
  endDate: string;
}

class TestDataGenerator {
  private static readonly AGE_RANGE = { min: 18, max: 90 };
  private static readonly PINCODES = [
    '110001', '110002', '110003', '400001', '400002', 
    '500001', '500002', '600001', '600002', '700001'
  ];
  private static readonly VACCINATION_STATUSES: Array<'none' | 'firstDose' | 'fullyVaccinated'> = [
    'none', 'firstDose', 'fullyVaccinated'
  ];

  static async generateTestData(config: GeneratorConfig): Promise<void> {
    console.time('Data Generation');
    
    try {
      await this.generateUsers(config);
      console.log('User generation completed');
      
      await this.generateSlots(config);
      console.log('Slot generation completed');
      
      console.timeEnd('Data Generation');
    } catch (error) {
      console.error('Error generating test data:', error);
    }
  }

  private static async generateUsers(config: GeneratorConfig): Promise<void> {
    const { numberOfUsers, batchSize } = config;
    const batches = Math.ceil(numberOfUsers / batchSize);
    
    console.log(`Generating ${numberOfUsers} users in ${batches} batches`);
    
    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, numberOfUsers - i * batchSize);
      const users = await this.createUserBatch(i * batchSize, currentBatchSize);
      
      try {
        await User.insertMany(users, { ordered: false });
        console.log(`Batch ${i + 1}/${batches} completed: ${currentBatchSize} users`);
      } catch (error) {
        console.error(`Error in batch ${i + 1}:`, error);
      }
    }
  }

  private static async createUserBatch(startIndex: number, batchSize: number): Promise<any[]> {
    const users:any = [];
    const hashedPassword = await bcrypt.hash('testPassword123', 10);
    
    for (let i = 0; i < batchSize; i++) {
      const userId = startIndex + i;
      const vaccinationStatus = this.VACCINATION_STATUSES[
        Math.floor(Math.random() * this.VACCINATION_STATUSES.length)
      ];
      
      users.push({
        name: `Test User ${userId}`,
        phoneNumber: `9${String(1000000000 + userId).padStart(10, '0')}`,
        age: Math.floor(Math.random() * (this.AGE_RANGE.max - this.AGE_RANGE.min + 1)) + this.AGE_RANGE.min,
        pincode: this.PINCODES[Math.floor(Math.random() * this.PINCODES.length)],
        aadharNo: String(100000000000 + userId).padStart(12, '0'),
        password: hashedPassword,
        vaccinationStatus,
        registeredSlots: this.generateRegisteredSlots(vaccinationStatus)
      });
    }
    
    return users;
  }

  private static generateRegisteredSlots(vaccinationStatus: string): any[] {
    const slots:any = [];
    const baseDate = moment('2024-11-01');
    
    if (vaccinationStatus === 'firstDose' || vaccinationStatus === 'fullyVaccinated') {
      slots.push({
        dose: 'firstDose',
        date: moment(baseDate).add(Math.floor(Math.random() * 30), 'days').toDate(),
        slotTime: `${10 + Math.floor(Math.random() * 7)}:${Math.random() < 0.5 ? '00' : '30'}`
      });
    }
    
    if (vaccinationStatus === 'fullyVaccinated') {
      slots.push({
        dose: 'secondDose',
        date: moment(baseDate).add(Math.floor(Math.random() * 30) + 30, 'days').toDate(),
        slotTime: `${10 + Math.floor(Math.random() * 7)}:${Math.random() < 0.5 ? '00' : '30'}`
      });
    }
    
    return slots;
  }

  private static async generateSlots(config: GeneratorConfig): Promise<void> {
    const { startDate, endDate } = config;
    const start = moment(startDate);
    const end = moment(endDate);
    
    for (let date = moment(start); date.isSameOrBefore(end); date.add(1, 'days')) {
      const slots:any = [];
      let currentTime = moment(date).hour(10).minute(0);
      const endTime = moment(date).hour(17).minute(0);
      
      while (currentTime.isBefore(endTime)) {
        const slotEndTime = moment(currentTime).add(30, 'minutes');
        
        slots.push({
          date: date.toDate(),
          startTime: currentTime.format('HH:mm'),
          endTime: slotEndTime.format('HH:mm'),
          availableDoses: 10,
          maxDoses: 10,
          registeredUsers: []
        });
        
        currentTime = moment(slotEndTime);
      }
      
      try {
        await Slot.insertMany(slots, { ordered: false });
        console.log(`Slots generated for ${date.format('YYYY-MM-DD')}`);
      } catch (error) {
        console.error(`Error generating slots for ${date.format('YYYY-MM-DD')}:`, error);
      }
    }
  }

  static async generatePerformanceTestQueries(): Promise<void> {
    console.log('\nGenerating performance test queries...');
    
    // Test 1: Filter by age
    console.time('Age Filter Query');
    const ageResults = await User.find({ age: { $gte: 60 } }).limit(100);
    console.timeEnd('Age Filter Query');
    console.log(`Found ${ageResults.length} users aged 60+`);
    
    // Test 2: Filter by pincode and vaccination status
    console.time('Pincode + Status Query');
    const combinedResults = await User.find({
      pincode: '110001',
      vaccinationStatus: 'firstDose'
    }).limit(100);
    console.timeEnd('Pincode + Status Query');
    console.log(`Found ${combinedResults.length} users with specified criteria`);
    
    // Test 3: Complex aggregation
    console.time('Aggregation Query');
    const aggregationResults = await User.aggregate([
      {
        $group: {
          _id: {
            pincode: '$pincode',
            status: '$vaccinationStatus'
          },
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    console.timeEnd('Aggregation Query');
    console.log('Aggregation results:', aggregationResults.slice(0, 5));
  }
}

// Usage example
async function runTestDataGenerator() {
  try {
    await mongoose.connect("mongodb+srv://siri:siri@vaccinecluster.xvmxl.mongodb.net/?retryWrites=true&w=majority&appName=VaccineCluster");
    console.log('Connected to MongoDB');
    
    const config: GeneratorConfig = {
      numberOfUsers: 1000000, // 1 million users
      batchSize: 5000,       // Insert 5000 users at a time
      startDate: '2024-11-01',
      endDate: '2024-11-30'
    };
    
    await TestDataGenerator.generateTestData(config);
    await TestDataGenerator.generatePerformanceTestQueries();
    
    console.log('Test data generation completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the generator
if (require.main === module) {
  runTestDataGenerator().catch(console.error);
}

export { TestDataGenerator, GeneratorConfig };