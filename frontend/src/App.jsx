import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [trainingModules, setTrainingModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestDropdown, setShowRequestDropdown] = useState(false);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [moduleStats, setModuleStats] = useState(null);

  useEffect(() => {
    const loadTrainingModules = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/employees`);
        const employees = await response.json();
        
        const roles = [...new Set(employees.map(emp => emp.role))];
        
        const modules = roles.map((role, idx) => {
          const roleEmployees = employees.filter(emp => emp.role === role);
          return {
            id: `module_${idx + 1}`,
            role: role,
            department: roleEmployees[0]?.department || 'Engineering',
            employeeCount: roleEmployees.length,
            employeeIds: roleEmployees.map(e => e.id),
            status: idx === 0 ? 'assigned' : 'available',
            assignedBy: idx === 0 ? 'Sarah Johnson' : null,
            assignedDate: idx === 0 ? new Date().toISOString() : null
          };
        });
        
        setTrainingModules(modules);
        if (modules.length > 0) {
          setSelectedModule(modules[0]);
        }
      } catch (error) {
        console.error('Error loading training modules:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrainingModules();
  }, []);

  // Load stats for assigned module
  useEffect(() => {
    const loadModuleStats = async () => {
      const assignedModule = trainingModules.find(m => m.status === 'assigned');
      if (!assignedModule || !assignedModule.employeeIds) return;

      try {
        // Fetch data for all employees in this role
        const [emailsRes, chatsRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/emails`),
          fetch(`${API_BASE}/chats`),
          fetch(`${API_BASE}/documents`)
        ]);

        const allEmails = await emailsRes.json();
        const allChats = await chatsRes.json();
        const allDocs = await docsRes.json();

        // Filter by employee IDs in this role
        const roleEmails = allEmails.filter(e => 
          assignedModule.employeeIds.includes(e.sender_id) || 
          e.recipient_ids?.some(id => assignedModule.employeeIds.includes(id))
        );
        const roleChats = allChats.filter(c => 
          assignedModule.employeeIds.includes(c.participant_id)
        );
        const roleDocs = allDocs.filter(d => 
          assignedModule.employeeIds.includes(d.author_id)
        );

        setModuleStats({
          emails: roleEmails.length,
          slackMessages: roleChats.length,
          documents: roleDocs.length,
          employees: assignedModule.employeeCount,
          totalDataPoints: roleEmails.length + roleChats.length + roleDocs.length
        });
      } catch (error) {
        console.error('Error loading module stats:', error);
      }
    };

    if (trainingModules.length > 0) {
      loadModuleStats();
    }
  }, [trainingModules]);

  // Cycle through roles with animation
  useEffect(() => {
    if (trainingModules.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % trainingModules.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [trainingModules.length]);

  const handleRequest = (action) => {
    console.log(`Request action: ${action}`);
    setShowRequestDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white" style={{ fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-sm">LOADING TRAINING MODULES...</p>
        </div>
      </div>
    );
  }

  const assignedModule = trainingModules.find(m => m.status === 'assigned');
  const availableModules = trainingModules.filter(m => m.status === 'available');
  const currentRole = trainingModules[currentRoleIndex] || assignedModule;

  return (
    <div className="min-h-screen bg-black text-white relative" style={{ fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace' }}>
      {/* Grid Background Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="flex min-h-screen relative z-10">
        {/* Left Section - Hero */}
        <div className="w-full lg:w-1/2 bg-black/50 backdrop-blur-sm flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-16 lg:py-24">
            <div className="mb-8">
              <div className="inline-block bg-gray-900/80 border border-gray-700/50 text-white px-4 py-2 rounded-lg text-xs font-mono tracking-wider mb-6 backdrop-blur-sm">
                NEW ASSIGNMENT • TRAINING MODULE AVAILABLE
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                Training module assigned for{' '}
                <span 
                  className={`text-emerald-400 inline-block transition-all duration-300 font-mono ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}
                >
                  {currentRole?.role || assignedModule?.role || 'your position'}
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 mb-4 leading-relaxed max-w-xl" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                A comprehensive training module synthesized from the collective knowledge of previous team members in this role.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                Every communication, document, and work pattern has been distilled into a structured learning experience designed to accelerate your onboarding.
              </p>

              {/* Start Button */}
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-mono text-sm tracking-wider transition-all flex items-center justify-center whitespace-nowrap shadow-lg shadow-emerald-500/20 font-bold">
                BEGIN TRAINING <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Invitation & Module Details */}
        <div className="w-full lg:w-1/2 bg-black/50 backdrop-blur-sm border-l border-gray-800/50 flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-12">
            {/* Invitation Section */}
            <div className="mb-10">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-mono">INVITATION</p>
              <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-xs text-gray-400 mb-2 font-mono">YOU WERE INVITED BY</p>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-2xl font-bold text-white font-mono tracking-wide">{assignedModule?.assignedBy || 'SARAH JOHNSON'}</p>
                  <span className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-xs font-mono">HR MANAGER</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-mono tracking-wider">NEW ASSIGNMENT</span>
                </div>
              </div>
            </div>


            {/* Synthesized Knowledge Highlight */}
            {assignedModule && (
              <div className="mb-10">
                <div className="bg-emerald-600/20 border-2 border-emerald-500/50 rounded-lg p-6 backdrop-blur-sm">
                  <p className="text-sm font-bold text-emerald-400 mb-2 font-mono tracking-wide leading-relaxed">
                    SYNTHESIZED FROM THE KNOWLEDGE OF{' '}
                    <span className="text-white text-base">{assignedModule.employeeCount} {assignedModule.employeeCount === 1 ? 'PREVIOUS TEAM MEMBER' : 'PREVIOUS TEAM MEMBERS'}</span>{' '}
                    WHO HELD THIS ROLE
                  </p>
                  <p className="text-xs text-gray-300 font-mono mt-2">This training module contains comprehensive knowledge extracted from previous employees in this role.</p>
                </div>
              </div>
            )}

            {/* Module Information - Removed the synthesized text from here */}
            {assignedModule && (
              <div className="mb-10">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">MODULE DETAILS</p>
                <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-wide">{assignedModule.role.toUpperCase()}</h3>
                  <p className="text-gray-300 text-xs mb-4 font-mono">{assignedModule.department.toUpperCase()}</p>
                  <div className="border-t border-gray-700/50 pt-4">
                    <p className="text-xs text-gray-400 mb-1 font-mono">ASSIGNED ON</p>
                    <p className="text-sm text-white font-mono">
                      {new Date(assignedModule.assignedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Training Module Stats */}
            {moduleStats && (
              <div className="mb-10">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">KNOWLEDGE SOURCES</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-6 h-6 bg-blue-600/30 border border-blue-500/30 rounded flex items-center justify-center mb-2">
                        <span className="text-xs">📧</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono mb-1">{moduleStats.emails.toLocaleString()}</span>
                      <p className="text-gray-400 text-[10px] font-mono leading-tight">EMAIL THREADS</p>
                    </div>
                  </div>
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-6 h-6 bg-purple-600/30 border border-purple-500/30 rounded flex items-center justify-center mb-2">
                        <span className="text-xs">💬</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono mb-1">{moduleStats.slackMessages.toLocaleString()}</span>
                      <p className="text-gray-400 text-[10px] font-mono leading-tight">SLACK MSGS</p>
                    </div>
                  </div>
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-6 h-6 bg-orange-600/30 border border-orange-500/30 rounded flex items-center justify-center mb-2">
                        <span className="text-xs">📄</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono mb-1">{moduleStats.documents.toLocaleString()}</span>
                      <p className="text-gray-400 text-[10px] font-mono leading-tight">DOCUMENTS</p>
                    </div>
                  </div>
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-6 h-6 bg-emerald-600/30 border border-emerald-500/30 rounded flex items-center justify-center mb-2">
                        <span className="text-xs">👥</span>
                      </div>
                      <span className="text-lg font-bold text-white font-mono mb-1">{moduleStats.employees.toLocaleString()}</span>
                      <p className="text-gray-400 text-[10px] font-mono leading-tight">CONTRIBUTORS</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-[10px] mb-1 font-mono">TOTAL KNOWLEDGE POINTS</p>
                      <p className="text-2xl font-bold text-white font-mono">{moduleStats.totalDataPoints.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-600/30 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🧠</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] mt-2 font-mono">PROCESSED AND STRUCTURED FOR LEARNING</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {assignedModule && (
              <div className="mb-10">
                <div className="flex gap-3">
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-mono text-sm tracking-wider transition-all shadow-lg shadow-emerald-500/20 font-bold">
                    START TRAINING
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowRequestDropdown(!showRequestDropdown)}
                      className="px-6 py-3 bg-white text-black rounded-lg font-mono text-sm tracking-wider hover:bg-gray-100 transition-all flex items-center space-x-2 font-bold"
                    >
                      <span>REQUEST</span>
                      <svg className={`w-4 h-4 transition-transform ${showRequestDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showRequestDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowRequestDropdown(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-2xl z-20 overflow-hidden backdrop-blur-sm">
                          <div className="py-2">
                            <button
                              onClick={() => handleRequest('outlook')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center space-x-3 text-white border-b border-gray-700/50"
                            >
                              <span className="text-sm">📧</span>
                              <div>
                                <p className="font-semibold text-white text-xs font-mono">SEND TO OUTLOOK</p>
                                <p className="text-xs text-gray-400 font-mono">Add to calendar</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('slack')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center space-x-3 text-white border-b border-gray-700/50"
                            >
                              <span className="text-sm">💬</span>
                              <div>
                                <p className="font-semibold text-white text-xs font-mono">SHARE ON SLACK</p>
                                <p className="text-xs text-gray-400 font-mono">Notify team</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('download')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center space-x-3 text-white border-b border-gray-700/50"
                            >
                              <span className="text-sm">📥</span>
                              <div>
                                <p className="font-semibold text-white text-xs font-mono">DOWNLOAD PDF</p>
                                <p className="text-xs text-gray-400 font-mono">Save offline</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('reminder')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center space-x-3 text-white border-b border-gray-700/50"
                            >
                              <span className="text-sm">⏰</span>
                              <div>
                                <p className="font-semibold text-white text-xs font-mono">SET REMINDER</p>
                                <p className="text-xs text-gray-400 font-mono">Get notified</p>
                              </div>
                            </button>
                            <div className="border-t border-gray-700/50 my-1"></div>
                            <button
                              onClick={() => handleRequest('decline')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center space-x-3 text-red-400"
                            >
                              <span className="text-sm">❌</span>
                              <div>
                                <p className="font-semibold text-red-400 text-xs font-mono">DECLINE ASSIGNMENT</p>
                                <p className="text-xs text-red-500 font-mono">Not applicable</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Modules Section */}
            {availableModules.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">AVAILABLE MODULES</p>
                <div className="space-y-3">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`p-4 rounded-lg cursor-pointer transition-all backdrop-blur-sm ${
                        selectedModule?.id === module.id
                          ? 'bg-gray-900/80 border-2 border-emerald-500'
                          : 'bg-gray-900/80 border-2 border-gray-700/50 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-sm mb-1 font-mono tracking-wide">{module.role.toUpperCase()}</p>
                          <p className="text-xs text-gray-400 font-mono">{module.department.toUpperCase()}</p>
                        </div>
                        <span className="text-lg">📖</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <p className="text-xs text-gray-500 font-mono">
                          {module.employeeCount} {module.employeeCount === 1 ? 'CONTRIBUTOR' : 'CONTRIBUTORS'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
