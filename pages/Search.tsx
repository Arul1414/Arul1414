
import React, { useState, useEffect } from 'react';
import { api } from '../mockApi';
import { User } from '../types';
import { useAuth } from '../App';

const Search: React.FC = () => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestSentTo, setRequestSentTo] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<{userId: string, skill: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPeers();
  }, [user]);

  const loadPeers = async () => {
    setIsLoading(true);
    try {
      const users = await api.getUsers();
      // Filter out self and potentially invalid users
      setPeers(users.filter(u => u.id !== user?.id && u.name));
      
      // Load already sent requests to disable buttons
      if (user) {
        const reqs = await api.getRequests(user.id);
        const sent = reqs
          .filter(r => r.senderId === user.id)
          .map(r => `${r.receiverId}-${r.requestedSkill}`);
        setRequestSentTo(sent);
      }
    } catch (err) {
      console.error("Search failed to load peers", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (peerId: string, skill: string) => {
    if (!user) return;
    try {
      await api.sendRequest(user.id, peerId, skill);
      setRequestSentTo(prev => [...prev, `${peerId}-${skill}`]);
      setSelectedSkill(null);
    } catch (err) {
      alert("Failed to send request. Please try again.");
    }
  };

  const filteredPeers = peers.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.skillsOffered.some(s => s.toLowerCase().includes(term)) ||
      p.skillsRequired.some(s => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Discover Experts</h2>
          <p className="text-slate-500 text-lg">Connect with innovators like <span className="text-indigo-600 font-bold">Madahn</span> or <span className="text-violet-600 font-bold">Spidy</span> to accelerate your learning.</p>
        </div>
        <div className="relative w-full md:w-[400px]">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Search skills, names, or goals..."
            className="w-full pl-14 pr-6 py-5 rounded-3xl border-none bg-white text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-xl shadow-slate-200/50 text-lg placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-slate-400 font-medium">Scanning the network...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPeers.map(peer => (
            <div key={peer.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <img src={peer.avatar} className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{peer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400 text-[10px]">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star-half-alt"></i>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{peer.averageRating} Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Expertise</div>
                    <div className="flex flex-wrap gap-2">
                      {peer.skillsOffered.length > 0 ? (
                        peer.skillsOffered.map(skill => (
                          <button 
                            key={skill}
                            onClick={() => setSelectedSkill({ userId: peer.id, skill })}
                            disabled={requestSentTo.includes(`${peer.id}-${skill}`)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                              requestSentTo.includes(`${peer.id}-${skill}`) 
                              ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm'
                            }`}
                          >
                            {skill} {requestSentTo.includes(`${peer.id}-${skill}`) ? '✓' : '+'}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300 italic font-medium">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Seeking</div>
                    <div className="flex flex-wrap gap-2">
                      {peer.skillsRequired.length > 0 ? (
                        peer.skillsRequired.map(skill => (
                          <span key={skill} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold border border-slate-100">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300 italic font-medium">Open to anything</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (peer.skillsOffered.length > 0) {
                        setSelectedSkill({ userId: peer.id, skill: peer.skillsOffered[0] });
                      }
                    }}
                    className="text-indigo-600 text-sm font-bold hover:text-indigo-800 transition-colors"
                  >
                    View Profile
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer">
                    <i className="fas fa-arrow-right text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPeers.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-4xl">
                <i className="fas fa-search"></i>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">No matching experts found</p>
              <p className="text-slate-400">Try searching for "React", "Python", or names like "Madhavan".</p>
              <button onClick={() => setSearchTerm('')} className="mt-6 text-indigo-600 font-bold hover:underline">Clear Search Filter</button>
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl transform animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-2xl shadow-indigo-200 rotate-6">
              <i className="fas fa-bolt"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tight">Initiate Handshake?</h3>
            <p className="text-slate-500 text-center mb-10 text-lg leading-relaxed">
              Request to learn <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">{selectedSkill.skill}</span> from {peers.find(p => p.id === selectedSkill.userId)?.name}.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleSendRequest(selectedSkill.userId, selectedSkill.skill)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95"
              >
                Send Request
              </button>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-5 rounded-2xl transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
