export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CaregiverAccess {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

