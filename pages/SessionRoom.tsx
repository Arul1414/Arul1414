
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../mockApi';
import { Session, ChatMessage, Resource, User } from '../types';

const SessionRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && user) {
      loadSession();
    }
  }, [id, user]);

  useEffect(() => {
    if (!isLocked) {
      scrollToBottom();
    }
  }, [messages, isLocked]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    const sess = await api.getSessionById(id!);
    if (sess) {
      setSession(sess);
      const otherId = sess.userAId === user!.id ? sess.userBId : sess.userAId;
      const all = await api.getUsers();
      setOtherUser(all.find(u => u.id === otherId) || null);
      
      if (sess.verifiedUsers.includes(user!.id)) {
        setIsLocked(false);
        loadData(sess.id);
      }
    } else {
      navigate('/dashboard');
    }
  };

  const loadData = async (sid: string) => {
    const [msgs, res] = await Promise.all([
      api.getMessages(sid),
      api.getResources(sid)
    ]);
    setMessages(msgs);
    setResources(res);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await api.verifyPasskey(id!, user!.id, passkeyInput);
    if (ok) {
      setIsLocked(false);
      loadData(id!);
    } else {
      setError('Invalid passkey. Please check with your peer.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = await api.sendMessage(id!, user!.id, newMessage);
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleAddResource = async () => {
    const title = prompt('Resource Title:');
    const link = prompt('Link/URL:');
    if (title && link) {
      const res = await api.addResource(id!, title, link, user!.id);
      setResources([...resources, res]);
    }
  };

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this collaboration session?')) {
      await api.endSession(id!);
      setShowFeedback(true);
    }
  };

  const submitFeedback = async () => {
    if (!session || !user || !otherUser) return;
    await api.submitFeedback({
      sessionId: session.id,
      fromId: user.id,
      toId: otherUser.id,
      rating,
      comment
    });
    navigate('/dashboard');
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 transform animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl rotate-3">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">Secure Entry</h2>
          <p className="text-slate-500 text-center mb-8 leading-relaxed">
            This session is encrypted. Enter the shared passkey generated during the handshake.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="SKX-XXXXX"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value.toUpperCase())}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 bg-slate-50'} focus:border-indigo-500 outline-none transition-all font-mono tracking-widest text-lg`}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-widest">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all"
            >
              Unlock Session
            </button>
          </form>

          <button onClick={() => navigate('/dashboard')} className="w-full mt-6 text-slate-400 text-sm hover:text-slate-600">
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar: Details & Resources */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col p-6 h-[400px] md:h-auto overflow-y-auto">
        <div className="mb-10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Collaborating with</div>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <img src={otherUser?.avatar} className="w-12 h-12 rounded-xl shadow-sm" />
            <div>
              <div className="font-bold text-slate-900">{otherUser?.name}</div>
              <div className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shared Resources</div>
            <button onClick={handleAddResource} className="text-indigo-600 text-xs font-bold hover:underline">Add +</button>
          </div>
          <div className="space-y-3">
            {resources.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No resources shared yet.</p>
            ) : (
              resources.map(res => (
                <a key={res.id} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                  <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className="fas fa-link text-xs"></i>
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{res.title}</div>
                    <div className="text-[10px] text-slate-400">By {res.sharedById === user?.id ? 'Me' : 'Peer'}</div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <button 
          onClick={handleEndSession}
          className="w-full py-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i> End Session
        </button>
      </div>

      {/* Main: Chat & Interactive Area */}
      <div className="flex-grow flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Encrypted Skill-Sync</span>
          </div>
          <div className="text-[10px] font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-500">KEY: {session?.sharedPasskey}</div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.senderId === user?.id 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[9px] mt-1 opacity-60 text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-200">
          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message or share a learning tip..."
              className="flex-grow px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
            />
            <button 
              type="submit"
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg transform transition active:scale-90"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">Great Work!</h2>
            <p className="text-slate-500 text-center mb-8">Session complete. Help us maintain the community quality by providing feedback for {otherUser?.name}.</p>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <label className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">Rate the Exchange</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-colors ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`}>
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-widest">Your Experience</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the learning experience?"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 min-h-[100px] outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <button 
                onClick={submitFeedback}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all"
              >
                Submit Feedback & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoom;
