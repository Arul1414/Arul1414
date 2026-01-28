
export interface User {
  id: string;
  name: string;
  email: string;
  skillsOffered: string[];
  skillsRequired: string[];
  averageRating: number;
  avatar: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface SkillRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: RequestStatus;
  requestedSkill: string;
  timestamp: number;
}

export interface Session {
  id: string;
  userAId: string;
  userBId: string;
  sharedPasskey: string;
  status: 'active' | 'inactive';
  verifiedUsers: string[];
  createdAt: number;
}

export interface Resource {
  id: string;
  sessionId: string;
  title: string;
  link: string;
  sharedById: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Feedback {
  id: string;
  sessionId: string;
  fromId: string;
  toId: string;
  rating: number;
  comment: string;
}
