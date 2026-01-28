
import { User, SkillRequest, Session, RequestStatus, Resource, ChatMessage, Feedback } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    skillsOffered: ['React', 'TypeScript', 'Node.js'],
    skillsRequired: ['Graphic Design', 'Spanish'],
    averageRating: 4.8,
    avatar: 'https://picsum.photos/seed/alice/200'
  },
  {
    id: 'u4',
    name: 'Madahn',
    email: 'madahn@skillx.com',
    skillsOffered: ['Python', 'Machine Learning', 'Data Science'],
    skillsRequired: ['React', 'UI Design'],
    averageRating: 4.9,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=madahn'
  },
  {
    id: 'u5',
    name: 'Spidy',
    email: 'spidy@skillx.com',
    skillsOffered: ['Ethical Hacking', 'Cybersecurity', 'Network Security'],
    skillsRequired: ['Python', 'Cloud Computing'],
    averageRating: 4.7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spidy'
  },
  {
    id: 'u6',
    name: 'Madhavan',
    email: 'madhavan@skillx.com',
    skillsOffered: ['AWS', 'Cloud Architecture', 'Java Spring Boot'],
    skillsRequired: ['Machine Learning', 'DevOps'],
    averageRating: 4.8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=madhavan'
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    skillsOffered: ['Graphic Design', 'UI/UX', 'Figma'],
    skillsRequired: ['React', 'Python'],
    averageRating: 4.5,
    avatar: 'https://picsum.photos/seed/bob/200'
  }
];

class MockBackend {
  private users: User[];
  private requests: SkillRequest[];
  private sessions: Session[];
  private resources: Resource[];
  private messages: ChatMessage[];
  private feedback: Feedback[];

  constructor() {
    // Check if we need to force reset to include new users
    const version = "1.1";
    const storedVersion = localStorage.getItem('sx_db_version');
    
    if (storedVersion !== version) {
      localStorage.clear();
      localStorage.setItem('sx_db_version', version);
      this.users = INITIAL_USERS;
    } else {
      const storedUsers = localStorage.getItem('sx_users');
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    }
    
    this.requests = JSON.parse(localStorage.getItem('sx_requests') || '[]');
    this.sessions = JSON.parse(localStorage.getItem('sx_sessions') || '[]');
    this.resources = JSON.parse(localStorage.getItem('sx_resources') || '[]');
    this.messages = JSON.parse(localStorage.getItem('sx_messages') || '[]');
    this.feedback = JSON.parse(localStorage.getItem('sx_feedback') || '[]');
    
    this.persist();
  }

  private persist() {
    localStorage.setItem('sx_users', JSON.stringify(this.users));
    localStorage.setItem('sx_requests', JSON.stringify(this.requests));
    localStorage.setItem('sx_sessions', JSON.stringify(this.sessions));
    localStorage.setItem('sx_resources', JSON.stringify(this.resources));
    localStorage.setItem('sx_messages', JSON.stringify(this.messages));
    localStorage.setItem('sx_feedback', JSON.stringify(this.feedback));
  }

  async login(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async register(name: string, email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    const existing = this.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) return existing;

    const newUser: User = {
      id: generateId(),
      name,
      email: normalizedEmail,
      skillsOffered: [],
      skillsRequired: [],
      averageRating: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    };
    this.users.push(newUser);
    this.persist();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async updateUserSkills(userId: string, offered: string[], required: string[]): Promise<User | null> {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], skillsOffered: offered, skillsRequired: required };
    this.persist();
    return this.users[idx];
  }

  async sendRequest(senderId: string, receiverId: string, skill: string): Promise<SkillRequest> {
    const newReq: SkillRequest = {
      id: generateId(),
      senderId,
      receiverId,
      status: RequestStatus.PENDING,
      requestedSkill: skill,
      timestamp: Date.now()
    };
    this.requests.push(newReq);
    this.persist();
    return newReq;
  }

  async getRequests(userId: string): Promise<SkillRequest[]> {
    return this.requests.filter(r => r.senderId === userId || r.receiverId === userId);
  }

  async updateRequestStatus(requestId: string, status: RequestStatus): Promise<SkillRequest | null> {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return null;
    req.status = status;

    if (status === RequestStatus.ACCEPTED) {
      const passkey = `SKX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newSession: Session = {
        id: generateId(),
        userAId: req.senderId,
        userBId: req.receiverId,
        sharedPasskey: passkey,
        status: 'active',
        verifiedUsers: [],
        createdAt: Date.now()
      };
      this.sessions.push(newSession);
    }
    this.persist();
    return req;
  }

  async getSessions(userId: string): Promise<Session[]> {
    return this.sessions.filter(s => s.userAId === userId || s.userBId === userId);
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  async verifyPasskey(sessionId: string, userId: string, passkey: string): Promise<boolean> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session && session.sharedPasskey === passkey) {
      if (!session.verifiedUsers.includes(userId)) {
        session.verifiedUsers.push(userId);
        this.persist();
      }
      return true;
    }
    return false;
  }

  async sendMessage(sessionId: string, senderId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: generateId(), sessionId, senderId, text, timestamp: Date.now() };
    this.messages.push(msg);
    this.persist();
    return msg;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messages.filter(m => m.sessionId === sessionId);
  }

  async addResource(sessionId: string, title: string, link: string, sharedById: string): Promise<Resource> {
    const res: Resource = { id: generateId(), sessionId, title, link, sharedById };
    this.resources.push(res);
    this.persist();
    return res;
  }

  async getResources(sessionId: string): Promise<Resource[]> {
    return this.resources.filter(r => r.sessionId === sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'inactive';
      this.persist();
    }
  }

  async submitFeedback(feedback: Omit<Feedback, 'id'>): Promise<Feedback> {
    const newFeedback: Feedback = { ...feedback, id: generateId() };
    this.feedback.push(newFeedback);
    this.persist();
    return newFeedback;
  }
}

export const api = new MockBackend();
