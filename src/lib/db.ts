import Dexie, { Table } from 'dexie';
import { WorkShift, CenterHours } from '@/data/workingHours';

// Interfaces mapping to our local DB tables
export interface Provider {
  id: string; // The UUID from Supabase
  type: 'doctors' | 'centers';
  name: string;
  specialty: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  status: string;
  image?: string;
  shifts?: WorkShift[]; // For doctors
  center_hours?: CenterHours; // For centers
  updated_at?: string; // To track sync status
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  active: boolean;
  updated_at?: string;
}

export interface Message {
  id: string;
  name: string;
  contact?: string;
  content: string;
  status: string;
  date: string;
}

export interface Report {
  id: string;
  provider_id: string;
  provider_name: string;
  content: string;
  user_contact?: string;
  status: string;
  date: string;
}

export interface AppSetting {
  key: string;
  value: any;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  date: string;
}

export class AdenMedicalDB extends Dexie {
  // Table definitions
  providers!: Table<Provider>;
  ads!: Table<Ad>;
  messages!: Table<Message>;
  reports!: Table<Report>;
  settings!: Table<AppSetting>;
  notifications!: Table<Notification>;

  constructor() {
    super('AdenMedicalDB');
    
    // Define schema
    this.version(5).stores({
      providers: 'id, type, name, specialty, district, status, updated_at',
      ads: 'id, active, updated_at',
      messages: 'id, status, date',
      reports: 'id, status, date',
      settings: 'key',
      notifications: 'id, read, date'
    });
  }
}

// Export a singleton instance
export const db = new AdenMedicalDB();
