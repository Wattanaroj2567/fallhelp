export type FeedbackStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export interface Feedback {
  id: string;
  message: string;
  userName?: string; // Display name from mobile
  ticketNumber?: string; // REP-001, REP-002 for repair requests
  status: FeedbackStatus;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    profileImage: string | null;
  } | null;
}

export type FeedbackTypeFilter = "all" | "feedback" | "repair";

