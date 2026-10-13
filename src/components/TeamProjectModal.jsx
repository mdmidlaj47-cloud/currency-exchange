import React, { useState } from 'react';
import { Users, GraduationCap, FileText, GitPullRequest, BookOpen, X, CheckCircle, ArrowDown, Award, ExternalLink } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'MUHAMMED MIDLAJ', roll: '43', role: 'Full Stack & API Gateway Integration' },
  { name: 'HAZIM ZAYAN K', roll: '31', role: 'Frontend Architecture & State Management' },
  { name: 'GHAZZAL AHAMMED V', roll: '28', role: 'UI/UX Design & Multi-Converter Module' },
  { name: 'FARHAN SHAIKH', roll: '17', role: 'Financial Data Feeds & Trend Analysis' },
  { name: 'MUHAMMED RASAL K K', roll: '48', role: 'Bank Fee Transparency & Math Logic' },
  { name: 'FATHIMA DILNA K P', roll: '19', role: 'System Testing, Verification & Docs' }
];

const WORKFLOW_STEPS = [
  { step: '1', title: 'User Input', desc: 'User inputs base currency, target currency, and conversion amount.' },
  { step: '2', title: 'API Gateway Routing', desc: 'Application routes request via resilient client API Gateway.' },
  { step: '3', title: 'External Financial Data Feeds', desc: 'Securely queries live market data providers (ExchangeRate-API).' },
  { step: '4', title: 'Parse & Cache Engine', desc: 'Live exchange rates are verified, parsed, and cached locally.' },
  { step: '5', title: 'Instant Calculation & Output', desc: 'System calculates high-precision conversion results & trend graphs.' }
];

export default function TeamProjectModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'workflow' | 'references'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  GROUP 5 PROJECT
                </span>
                <span className="text-xs text-slate-400">Academic Presentation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                CURRENCY EXCHANGE APPLICATION
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800/80 bg-slate-900/50 flex gap-2">
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'team'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Team Members (Group 5)
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'workflow'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="w-4 h-4" /> System Workflow (Slide 8)
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'references'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> References & Objectives
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Official project team members and assigned modules for the Currency Exchange Platform:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TEAM_MEMBERS.map((member, index) => (
                  <div
                    key={member.roll}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between transition-all hover:border-brand-500/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-brand-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm tracking-wide">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono font-bold text-xs shrink-0">
                      Roll #{member.roll}
                    </div>
                  </div>
                ))}
              </div>

              {/* Technologies Highlight Card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Technologies Used (Slide 10)
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                    ⚛️ React.js (Vite)
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                    🎨 Tailwind CSS
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                    ⚡ Live Financial Feeds (ExchangeRate-API)
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                    🌐 GitHub Pages Deployment
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                    💻 VS Code Development
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                End-to-end data flow based on Slide 8: System Workflow Diagram
              </div>

              <div className="space-y-3">
                {WORKFLOW_STEPS.map((s, idx) => (
                  <div key={s.step} className="relative">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                        {s.step}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{s.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                    </div>

                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div className="flex justify-center my-1 text-slate-600">
                        <ArrowDown className="w-4 h-4 animate-bounce" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REFERENCES & OBJECTIVES */}
          {activeTab === 'references' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-400" />
                  Key Project Objectives (Slide 5)
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <li>Deliver real-time, highly accurate multi-currency conversion rates via reliable financial APIs.</li>
                  <li>Enable seamless, instant conversion calculations across major fiat and digital currencies.</li>
                  <li>Provide interactive trend graphs and historical exchange rate data for smart financial planning.</li>
                  <li>Build a responsive, highly secure, and optimized web application ready for production hosting.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Academic References (Slide 12)
                </h4>
                <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 font-mono">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-brand-400 mb-1">[1] IJEMR Journal</div>
                    M. Smith, J. Doe, A. Johnson, D. Silva, and D. Cooray, "The Currency Exchange System," International Journal of Engineering and Management Research, vol. 12, no. 5, pp. 135-149, Oct. 2022. doi: 10.31033/ijemr.12.5.17.
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-blue-400 mb-1">[2] Conference Paper</div>
                    R. Kumar, S. Patel, V. Sharma, and S. Mahajan, "Modern Currency Exchange and Tracking Application," Conference Paper, Chandigarh University, Nov. 2023.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
