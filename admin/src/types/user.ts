export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  caregiverType?: "OWNER" | "MEMBER" | null; // Only for CAREGIVER role
}

export interface CaregiverAccess {
  accessLevel?: "OWNER" | "EDITOR" | "VIEWER";
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}
