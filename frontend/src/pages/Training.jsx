import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

function Training() {
  const navigate = useNavigate();
  const [trainingModules, setTrainingModules] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [trainingEmployees, setTrainingEmployees] = useState(() => {
    const saved = localStorage.getItem('trainingEmployees');
    return saved ? JSON.parse(saved) : [];
  });
  const [trainingProgress, setTrainingProgress] = useState(() => {
    const saved = localStorage.getItem('trainingProgress');
    return saved ? JSON.parse(saved) : {
      person1: { docs: 0, emails: 0, chats: 0, total: 0 },
      person2: { docs: 0, emails: 0, chats: 0, total: 0 }
    };
  });
  const [generatedModule, setGeneratedModule] = useState(() => {
    const saved = localStorage.getItem('generatedModule');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatbotMessages, setChatbotMessages] = useState([
    { id: 1, text: "Training module generation in progress...", type: 'system' }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [currentProgressMessage, setCurrentProgressMessage] = useState(() => {
    const saved = localStorage.getItem('currentProgressMessage');
    return saved || '';
  });

  const handleBeginTraining = useCallback(async () => {
    const assigned = trainingModules.find(m => m.status === 'assigned');
    if (!assigned || !assigned.employeeIds || assigned.employeeIds.length === 0) return;

    setLoadingEmployees(true);
    setTrainingEmployees([]);
    setTrainingProgress({ person1: { docs: 0, emails: 0, chats: 0, total: 0 }, person2: { docs: 0, emails: 0, chats: 0, total: 0 } });
    setCurrentProgressMessage('');

    try {
      const employees = [];
      for (let i = 0; i < assigned.employeeIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const employee = await fetch(`${API_BASE}/employees/${assigned.employeeIds[i]}`).then(res => res.json());
        employees.push(employee);
        setTrainingEmployees([...employees]);
      }

      setLoadingEmployees(false);
      
      const progressMessages = [
        'Connecting...',
        'Collecting data...',
        'Aggregating knowledge...',
        'Extracting patterns...',
        'Processing communications...',
        'Analyzing work patterns...',
        'Creating modules...',
        'Generating content...',
        'Finalizing structure...'
      ];
      
      let messageIndex = 0;
      const updateMessage = () => {
        setCurrentProgressMessage(progressMessages[messageIndex % progressMessages.length]);
        messageIndex++;
      };
      
      updateMessage();
      
      const person1Max = { docs: 47, emails: 312, chats: 189 };
      for (let i = 0; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        if (i % 15 === 0) updateMessage();
        setTrainingProgress(prev => ({
          ...prev,
          person1: {
            docs: Math.floor((person1Max.docs * i) / 100),
            emails: Math.floor((person1Max.emails * i) / 100),
            chats: Math.floor((person1Max.chats * i) / 100),
            total: Math.floor(((person1Max.docs + person1Max.emails + person1Max.chats) * i) / 100)
          }
        }));
      }

      const person2Max = { docs: 52, emails: 298, chats: 201 };
      for (let i = 0; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        if (i % 15 === 0) updateMessage();
        setTrainingProgress(prev => ({
          ...prev,
          person2: {
            docs: Math.floor((person2Max.docs * i) / 100),
            emails: Math.floor((person2Max.emails * i) / 100),
            chats: Math.floor((person2Max.chats * i) / 100),
            total: Math.floor(((person2Max.docs + person2Max.emails + person2Max.chats) * i) / 100)
          }
        }));
      }

      setCurrentProgressMessage('Finalizing structure...');
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentProgressMessage('Module generated!');
      setGeneratedModule({
        title: "Senior Software Engineer Training Module",
        syllabus: [
          "CI/CD Pipeline Management",
          "Incident Response Procedures",
          "AWS Infrastructure Scaling",
          "Code Review Best Practices",
          "On-call Rotation Protocols"
        ],
        pdfs: [
          "SOP_Deployment_Procedures.pdf",
          "Incident_Response_Playbook.pdf",
          "Infrastructure_Scaling_Guide.pdf"
        ],
        modules: 5,
        totalHours: 24
      });
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }, [trainingModules]);

  useEffect(() => {
    const loadTrainingModules = async () => {
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
            status: idx === 0 ? 'assigned' : 'available'
          };
        });
        setTrainingModules(modules);
      } catch (error) {
        console.error('Error loading training modules:', error);
      }
    };
    loadTrainingModules();
  }, []);

  useEffect(() => {
    if (trainingEmployees.length === 0 && trainingModules.length > 0 && !loadingEmployees) {
      const assigned = trainingModules.find(m => m.status === 'assigned');
      if (assigned && assigned.employeeIds && assigned.employeeIds.length > 0) {
        handleBeginTraining();
      }
    }
  }, [trainingModules, trainingEmployees.length, loadingEmployees, handleBeginTraining]);

  // Persist trainingEmployees to localStorage
  useEffect(() => {
    if (trainingEmployees.length > 0) {
      localStorage.setItem('trainingEmployees', JSON.stringify(trainingEmployees));
    }
  }, [trainingEmployees]);

  // Persist trainingProgress to localStorage
  useEffect(() => {
    if (trainingProgress.person1.total > 0 || trainingProgress.person2.total > 0) {
      localStorage.setItem('trainingProgress', JSON.stringify(trainingProgress));
    }
  }, [trainingProgress]);

  // Persist generatedModule to localStorage
  useEffect(() => {
    if (generatedModule) {
      localStorage.setItem('generatedModule', JSON.stringify(generatedModule));
    }
  }, [generatedModule]);

  // Persist currentProgressMessage to localStorage
  useEffect(() => {
    if (currentProgressMessage) {
      localStorage.setItem('currentProgressMessage', currentProgressMessage);
    }
  }, [currentProgressMessage]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" style={{ fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace' }}>
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

      <div className="min-h-screen relative z-10 flex flex-col">
        {/* Top Status Bar with Back Button */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800/50 relative z-30 bg-gray-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-900/80 border border-gray-700/50 rounded-lg px-4 py-2 backdrop-blur-sm hover:bg-gray-800/80 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-bold text-emerald-400 font-mono">BACK</span>
            </button>
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg px-4 py-2 backdrop-blur-sm">
              <p className="text-sm font-bold text-emerald-400 font-mono">
                {loadingEmployees ? 'LOADING' : ''} {trainingModules.find(m => m.status === 'assigned')?.employeeCount || 0} EMPLOYEES
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            TRAINING IN PROGRESS
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative pr-64">
          {/* Left Side - Person 1 */}
          <div className="flex flex-col items-start pl-6">
            <div className="w-72 space-y-3 pt-8">
              {/* Person 1 Compact Card */}
              {trainingEmployees[0] ? (
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-full px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-xs font-mono font-bold">P1</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">ANONYMIZED PERSON</span>
                </div>
              ) : loadingEmployees ? (
                <div className="bg-gray-800/40 border border-gray-700/30 rounded-full px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm animate-pulse">
                  <div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
                  <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
                </div>
              ) : null}

              {/* Skills Section - Small Tags */}
              {trainingEmployees[0] && trainingEmployees[0].skills && trainingEmployees[0].skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {trainingEmployees[0].skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-800/60 border border-gray-700/50 text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Training Simulation - Person 1 */}
              <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] text-gray-400 font-mono uppercase">Simulating</p>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">📄</span>
                      <span className="text-gray-400 font-mono">Docs</span>
                      {trainingProgress.person1.docs > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person1.docs}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">📧</span>
                      <span className="text-gray-400 font-mono">Emails</span>
                      {trainingProgress.person1.emails > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person1.emails}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">💬</span>
                      <span className="text-gray-400 font-mono">Slack</span>
                      {trainingProgress.person1.chats > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person1.chats}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] text-gray-400 font-mono uppercase">Parameters</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">EPOCH:</span>
                      <span className="text-emerald-400 ml-1">100</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">LR:</span>
                      <span className="text-emerald-400 ml-1">0.001</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">BATCH:</span>
                      <span className="text-emerald-400 ml-1">32</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">ACC:</span>
                      <span className="text-emerald-400 ml-1 animate-pulse">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Gap with Connection Line and Progress */}
          <div className="w-40 flex flex-col items-center justify-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 z-0">
              <svg width="100%" height="2" className="opacity-60">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line 
                  x1="0" 
                  y1="1" 
                  x2="100%" 
                  y2="1" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="2" 
                  strokeDasharray="6,3"
                >
                  <animate 
                    attributeName="stroke-dashoffset" 
                    values="0;9" 
                    dur="1s" 
                    repeatCount="indefinite" 
                  />
                </line>
                <circle cx="25%" cy="1" r="2" fill="#10b981" opacity="0.8">
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="50%" cy="1" r="2" fill="#10b981" opacity="0.8">
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="75%" cy="1" r="2" fill="#10b981" opacity="0.8">
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            
            {currentProgressMessage && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-gray-900/90 border border-emerald-500/30 rounded-lg px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] text-emerald-400 font-mono uppercase whitespace-nowrap">
                    {currentProgressMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Person 2 */}
          <div className="flex flex-col items-end pr-6">
            <div className="w-72 space-y-3 pt-8">
              {trainingEmployees[1] ? (
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-full px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-xs font-mono font-bold">P2</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">ANONYMIZED PERSON</span>
                </div>
              ) : loadingEmployees && trainingEmployees.length === 1 ? (
                <div className="bg-gray-800/40 border border-gray-700/30 rounded-full px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm animate-pulse">
                  <div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
                  <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
                </div>
              ) : null}

              {trainingEmployees[1] && trainingEmployees[1].skills && trainingEmployees[1].skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {trainingEmployees[1].skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-800/60 border border-gray-700/50 text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] text-gray-400 font-mono uppercase">Simulating</p>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">📄</span>
                      <span className="text-gray-400 font-mono">Docs</span>
                      {trainingProgress.person2.docs > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person2.docs}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">📧</span>
                      <span className="text-gray-400 font-mono">Emails</span>
                      {trainingProgress.person2.emails > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person2.emails}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono">💬</span>
                      <span className="text-gray-400 font-mono">Slack</span>
                      {trainingProgress.person2.chats > 0 && (
                        <span className="text-emerald-400 font-mono animate-pulse text-[8px]">●</span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">{trainingProgress.person2.chats}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] text-gray-400 font-mono uppercase">Parameters</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">EPOCH:</span>
                      <span className="text-emerald-400 ml-1">100</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">LR:</span>
                      <span className="text-emerald-400 ml-1">0.001</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">BATCH:</span>
                      <span className="text-emerald-400 ml-1">32</span>
                    </div>
                    <div className="bg-gray-800/50 rounded px-1.5 py-1 border border-emerald-500/20">
                      <span className="text-gray-400">ACC:</span>
                      <span className="text-emerald-400 ml-1 animate-pulse">91.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Assistant - Fixed Right Sidebar */}
        <div className="fixed top-0 right-0 h-full w-64 border-l border-gray-800/50 bg-gray-900/50 backdrop-blur-sm flex flex-col z-20" style={{ paddingTop: '65px' }}>
          <div className="p-3 border-b border-gray-700/50">
            <h4 className="text-xs font-bold text-emerald-400 font-mono">TRAINING ASSISTANT</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatbotMessages.map((msg) => (
              <div key={msg.id} className={`text-[10px] font-mono leading-relaxed ${msg.type === 'system' ? 'text-gray-400' : 'text-gray-300'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-700/50">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatbotInput.trim()) {
                    setChatbotMessages([...chatbotMessages, { id: Date.now(), text: chatbotInput, type: 'user' }]);
                    setChatbotInput('');
                  }
                }}
                placeholder="Ask..."
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={() => {
                  if (chatbotInput.trim()) {
                    setChatbotMessages([...chatbotMessages, { id: Date.now(), text: chatbotInput, type: 'user' }]);
                    setChatbotInput('');
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-[10px] font-mono"
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Training;

