export interface IUser {
    _id: string;
    name: string;
    phoneNumber: string;
    age: number;
    pincode: string;
    aadharNo: string;
    password: string;
    vaccinationStatus: 'none' | 'firstDose' | 'fullyVaccinated';
    registeredSlots: {
      dose: 'firstDose' | 'secondDose';
      date: Date;
      slotTime: string;
    }[];
  }
  
  export interface ISlot {
    _id: string;
    date: Date;
    startTime: string;
    endTime: string;
    availableDoses: number;
    maxDoses: number;
    registeredUsers: Array<{
      userId: string;
      dose: 'firstDose' | 'secondDose';
    }>;
  }
  
  export interface IAdmin {
    _id: string;
    username: string;
    password: string;
    role: 'admin';
  }
  