import { Slot } from '../models/slot';
import moment from 'moment';

export class SlotService {
  static async initializeSlots(): Promise<void> {
    const startDate = moment('2024-11-01');
    const endDate = moment('2024-11-30');
    
    for (let date = startDate; date <= endDate; date.add(1, 'days')) {
      let currentTime = moment(date).hour(10).minute(0); // Start at 10 AM
      const endTime = moment(date).hour(17).minute(0);   // End at 5 PM
      
      while (currentTime < endTime) {
        const slotEndTime = moment(currentTime).add(30, 'minutes');
        
        await Slot.create({
          date: date.toDate(),
          startTime: currentTime.format('HH:mm'),
          endTime: slotEndTime.format('HH:mm'),
          availableDoses: 10,
          maxDoses: 10,
          registeredUsers: []
        });
        
        currentTime = slotEndTime;
      }
    }
  }
}
