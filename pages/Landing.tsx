
import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 pt-20 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-5 bg-indigo-100 text-indigo-700 mb-6">
                <span>Phase 1: Now Live</span>
                <i className="fas fa-chevron-right ml-2 text-xs"></i>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                Exchange <span className="text-indigo-600">Skills</span>,<br />
                Elevate <span className="text-violet-600">Careers</span>.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                SkillX is a non-monetary platform where your knowledge is your currency. 
                Teach what you know, learn what you need. Secure, peer-to-peer, and community-driven.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg transform transition hover:-translate-y-1">
                  Start Exchanging Today
                </Link>
                <Link to="/search" className="bg-white border-2 border-slate-200 hover:border-indigo-600 text-slate-700 px-8 py-4 rounded-xl text-lg font-bold transition hover:-translate-y-1">
                  Browse Skills
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2"><i className="fas fa-check-circle text-indigo-500"></i> No Fees</div>
                <div className="flex items-center gap-2"><i className="fas fa-check-circle text-indigo-500"></i> Peer Verified</div>
                <div className="flex items-center gap-2"><i className="fas fa-check-circle text-indigo-500"></i> Secure Sessions</div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative">
                <img 
                  src="https://picsum.photos/id/1/800/600" 
                  alt="Skill Exchange" 
                  className="rounded-3xl shadow-2xl border-8 border-white"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-graduate text-xl"></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Active Learners</div>
                    <div className="text-2xl font-bold text-indigo-600">2.4k+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How SkillX Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to start your collaborative learning journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: 'fa-search', title: 'Find a Match', desc: 'Browse peers who offer the skill you want to learn and require what you know.', color: 'blue' },
              { icon: 'fa-handshake', title: 'Handshake Request', desc: 'Send a request. Once accepted, a secure session is automatically generated.', color: 'indigo' },
              { icon: 'fa-key', title: 'Secure Session', desc: 'Enter the shared passkey to unlock your learning environment and start collaborating.', color: 'violet' }
            ].map((f, i) => (
              <div key={i} className="text-center group">
                <div className={`w-16 h-16 bg-${f.color}-100 text-${f.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
