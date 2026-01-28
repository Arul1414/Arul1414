
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { api } from '../mockApi';
import { User, SkillRequest, Session, RequestStatus } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { createSkillMentorChat } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<SkillRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [offeredStr, setOfferedStr] = useState('');
  const [requiredStr, setRequiredStr] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setOfferedStr(user.skillsOffered.join(', '));
      setRequiredStr(user.skillsRequired.join(', '));
      loadData();
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [reqs, sess, users] = await Promise.all([
        api.getRequests(user.id),
        api.getSessions(user.id),
        api.getUsers()
      ]);
      setRequests(reqs.sort((a,b) => b.timestamp - a.timestamp));
      setSessions(sess.sort((a,b) => b.createdAt - a.createdAt));
      setAllUsers(users);
    } catch (err) {
      console.error("Dashboard failed to sync data", err);
    }
  };

  const handleUpdateSkills = async () => {
    if (!user) return;
    setIsUpdating(true);
    const offered = offeredStr.split(',').map(s => s.trim()).filter(s => s !== '');
    const required = requiredStr.split(',').map(s => s.trim()).filter(s => s !== '');
    await api.updateUserSkills(user.id, offered, required);
    await refreshUser();
    setIsUpdating(false);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 3000);
  };

  const handleRequestAction = async (requestId: string, status: RequestStatus) => {
    await api.updateRequestStatus(requestId, status);
    await loadData();
    await refreshUser();
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !user) return;

    const userText = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiTyping(true);

    try {
      if (!chatRef.current) {
        chatRef.current = createSkillMentorChat(user.skillsOffered, user.skillsRequired);
      }
      
      const result = await chatRef.current.sendMessage({ message: userText });
      setChatMessages(prev => [...prev, { role: 'model', text: result.text || "Thinking..." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Offline. Please check your API key." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const getUserName = (id: string) => allUsers.find(u => u.id === id)?.name || 'User';

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Profile Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-5 mb-8">
              <img src={user.avatar} className="w-20 h-20 rounded-3xl shadow-xl border-4 border-slate-50 object-cover" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                <div className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full mt-2 w-fit">
                  <i className="fas fa-star mr-1.5 text-xs"></i> {user.averageRating.toFixed(1)} / 5.0
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">My Expertise</label>
                <textarea 
                  value={offeredStr}
                  onChange={(e) => setOfferedStr(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px] shadow-inner text-slate-900"
                  placeholder="e.g. React, Machine Learning, UI/UX"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Learning Goals</label>
                <textarea 
                  value={requiredStr}
                  onChange={(e) => setRequiredStr(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px] shadow-inner text-slate-900"
                  placeholder="e.g. Python, AWS, Networking"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={handleUpdateSkills}
                  disabled={isUpdating}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isUpdating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                  Update My Profile
                </button>
                {showSyncSuccess && (
                  <div className="absolute top-full left-0 right-0 mt-3 text-center text-xs text-green-600 font-bold animate-bounce">
                    ✓ Skills synchronized successfully
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Mentor */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[550px]">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-lg relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <div className="font-black text-sm tracking-tight">AI Skill Mentor</div>
                  <div className="text-[10px] text-indigo-100 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> Real-time
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-indigo-600 text-2xl rotate-3">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">Hi {user.name}! I'm your private tutor. Ask me to explain a concept or build a roadmap for your new skills.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-5 py-3 rounded-full rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleAiChat} className="p-5 bg-white border-t border-slate-100">
              <div className="relative group">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask your mentor..."
                  className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 font-medium"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-indigo-100">
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Activity Column */}
        <div className="lg:col-span-8 space-y-10">
          
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Handshake Requests</h3>
              <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 border border-indigo-100 uppercase tracking-widest">{requests.length} Total</span>
            </div>
            
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <i className="fas fa-users-slash text-2xl"></i>
                  </div>
                  <p className="text-slate-500 font-medium mb-6">No requests yet. Build your network!</p>
                  <Link to="/search" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all inline-block">Explore Experts</Link>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all border-l-8 border-l-indigo-500">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${req.senderId === user.id ? 'bg-blue-50 text-blue-500 shadow-inner' : 'bg-violet-50 text-violet-500 shadow-inner'}`}>
                        <i className={`fas ${req.senderId === user.id ? 'fa-arrow-up-right' : 'fa-arrow-down-left'}`}></i>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-lg">
                          {req.senderId === user.id ? `Sent to ${getUserName(req.receiverId)}` : `Received from ${getUserName(req.senderId)}`}
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Focus: <span className="text-indigo-600">{req.requestedSkill}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {req.status === RequestStatus.PENDING && req.receiverId === user.id ? (
                        <>
                          <button onClick={() => handleRequestAction(req.id, RequestStatus.ACCEPTED)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100">Accept</button>
                          <button onClick={() => handleRequestAction(req.id, RequestStatus.REJECTED)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black px-6 py-3 rounded-xl transition-all">Reject</button>
                        </>
                      ) : (
                        <div className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-sm ${
                          req.status === RequestStatus.ACCEPTED ? 'bg-green-50 text-green-600 border border-green-100' : 
                          req.status === RequestStatus.PENDING ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {req.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Learning Rooms</h3>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <i className="fas fa-shield-alt text-xs"></i>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {sessions.filter(s => s.status === 'active').length === 0 ? (
                <div className="sm:col-span-2 bg-white border-2 border-dashed border-slate-200 p-16 rounded-[2.5rem] text-center">
                  <p className="text-slate-400 font-bold text-lg">Secure rooms will appear here after a successful handshake.</p>
                </div>
              ) : (
                sessions.filter(s => s.status === 'active').map(sess => (
                  <div key={sess.id} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex -space-x-4">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sess.userAId}`} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 shadow-md" />
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sess.userBId}`} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 shadow-md" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">Locked Session</span>
                        <span className="text-[9px] text-slate-300 font-bold mt-1 uppercase">Passkey Req.</span>
                      </div>
                    </div>
                    
                    <h4 className="font-black text-slate-900 text-lg mb-2">
                      Trade with {getUserName(sess.userAId === user.id ? sess.userBId : sess.userAId)}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mb-10 leading-relaxed">Encrypted P2P connection established. Prepare your resources.</p>
                    
                    <div className="mt-auto">
                      <button 
                        onClick={() => navigate(`/session/${sess.id}`)}
                        className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        <i className="fas fa-lock-open text-[10px]"></i> Enter Secure Area
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
