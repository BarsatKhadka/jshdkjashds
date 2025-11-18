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
      <div className="min-h-screen bg-black flex items-center justify-center text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading training modules...</p>
        </div>
      </div>
    );
  }

  const assignedModule = trainingModules.find(m => m.status === 'assigned');
  const availableModules = trainingModules.filter(m => m.status === 'available');
  const currentRole = trainingModules[currentRoleIndex] || assignedModule;

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="flex min-h-screen">
        {/* Left Section - Hero */}
        <div className="w-full lg:w-1/2 bg-black flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-16 lg:py-24">
            <div className="mb-8">
              <div className="inline-block bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                New Assignment • Training module available
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Training module assigned for{' '}
                <span 
                  className={`text-white inline-block transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}
                >
                  {currentRole?.role || assignedModule?.role || 'your position'}
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-4 leading-relaxed max-w-xl">
                A comprehensive training module synthesized from the collective knowledge of previous team members in this role.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
                Every communication, document, and work pattern has been distilled into a structured learning experience designed to accelerate your onboarding.
              </p>

              {/* Start Button */}
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center whitespace-nowrap">
                Begin training <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Invitation & Module Details */}
        <div className="w-full lg:w-1/2 bg-black border-l border-gray-900 flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-12">
            {/* Invitation Section */}
            <div className="mb-10">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Invitation</p>
              <div className="bg-gray-900 rounded-2xl p-8">
                <p className="text-sm text-gray-400 mb-2">You were invited by</p>
                <p className="text-3xl font-bold text-white mb-6">{assignedModule?.assignedBy || 'Sarah Johnson'}</p>
                <div className="flex items-center space-x-2 text-pink-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">New Assignment</span>
                </div>
              </div>
            </div>

            {/* Module Information */}
            {assignedModule && (
              <div className="mb-10">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Module Details</p>
                <div className="bg-gray-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{assignedModule.role}</h3>
                  <p className="text-gray-400 text-sm mb-6">{assignedModule.department}</p>
                  <div className="border-t border-gray-800 pt-6">
                    <p className="text-xs text-gray-500 mb-1">Assigned on</p>
                    <p className="text-sm text-gray-300 mb-6">
                      {new Date(assignedModule.assignedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Synthesized from the knowledge of <span className="font-semibold text-pink-500">{assignedModule.employeeCount} {assignedModule.employeeCount === 1 ? 'previous team member' : 'previous team members'}</span> who held this role.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Training Module Stats */}
            {moduleStats && (
              <div className="mb-10">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Knowledge Sources</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📧</span>
                      </div>
                      <span className="text-3xl font-bold text-white">{moduleStats.emails.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Email threads</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">💬</span>
                      </div>
                      <span className="text-3xl font-bold text-white">{moduleStats.slackMessages.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Slack messages</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📄</span>
                      </div>
                      <span className="text-3xl font-bold text-white">{moduleStats.documents.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Documents</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">👥</span>
                      </div>
                      <span className="text-3xl font-bold text-white">{moduleStats.employees.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Contributors</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-300 text-sm mb-1">Total knowledge points</p>
                      <p className="text-3xl font-bold text-white">{moduleStats.totalDataPoints.toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 bg-pink-600/20 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">🧠</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-3">Processed and structured for learning</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {assignedModule && (
              <div className="mb-10">
                <div className="flex gap-4">
                  <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors">
                    Start Training
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowRequestDropdown(!showRequestDropdown)}
                      className="px-6 py-4 bg-gray-900 border-2 border-gray-800 text-white rounded-xl font-semibold hover:border-gray-700 transition-all flex items-center space-x-2"
                    >
                      <span>Request</span>
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
                        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-20 overflow-hidden">
                          <div className="py-2">
                            <button
                              onClick={() => handleRequest('outlook')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-3 text-white border-b border-gray-800"
                            >
                              <span className="text-xl">📧</span>
                              <div>
                                <p className="font-semibold text-white">Send to Outlook</p>
                                <p className="text-xs text-gray-500">Add to calendar</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('slack')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-3 text-white border-b border-gray-800"
                            >
                              <span className="text-xl">💬</span>
                              <div>
                                <p className="font-semibold text-white">Share on Slack</p>
                                <p className="text-xs text-gray-500">Notify team</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('download')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-3 text-white border-b border-gray-800"
                            >
                              <span className="text-xl">📥</span>
                              <div>
                                <p className="font-semibold text-white">Download PDF</p>
                                <p className="text-xs text-gray-500">Save offline</p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleRequest('reminder')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-3 text-white border-b border-gray-800"
                            >
                              <span className="text-xl">⏰</span>
                              <div>
                                <p className="font-semibold text-white">Set Reminder</p>
                                <p className="text-xs text-gray-500">Get notified</p>
                              </div>
                            </button>
                            <div className="border-t border-gray-800 my-1"></div>
                            <button
                              onClick={() => handleRequest('decline')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center space-x-3 text-red-500"
                            >
                              <span className="text-xl">❌</span>
                              <div>
                                <p className="font-semibold">Decline Assignment</p>
                                <p className="text-xs text-red-600">Not applicable</p>
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
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Available Modules</p>
                <div className="space-y-3">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`p-5 rounded-xl cursor-pointer transition-all ${
                        selectedModule?.id === module.id
                          ? 'bg-gray-900 border-2 border-pink-500'
                          : 'bg-gray-900 border-2 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-base mb-1">{module.role}</p>
                          <p className="text-xs text-gray-500">{module.department}</p>
                        </div>
                        <span className="text-2xl">📖</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-xs text-gray-500">
                          {module.employeeCount} {module.employeeCount === 1 ? 'contributor' : 'contributors'}
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
