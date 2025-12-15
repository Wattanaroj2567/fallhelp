import { CaregiverAccess } from './user';

export interface Elder {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  isActive: boolean;
  caregivers?: CaregiverAccess[];
}

