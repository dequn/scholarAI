import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Loader2,
  Search,
  BookOpen,
  FileText,
  Download,
  Zap,
  Trash2,
  AlertCircle,
  List,
  Database
} from 'lucide-react';
import { Workspace, Workflow, WorkflowStep } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';

interface WorkflowBuilderProps {
  workspace: Workspace;
  onUpdateWorkflow: (workflow: Workflow) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const StepIcon = ({ type }: { type: WorkflowStep['type'] }) => {
  switch (type) {
    case 'search': return <Search className="w-4 h-4" />;
    case 'summarize': return <FileText className="w-4 h-4" />;
    case 'analyze': return <BookOpen className="w-4 h-4" />;
    case 'export': return <Download className="w-4 h-4" />;
    default: return <Zap className="w-4 h-4" />;
  }
};

export default function WorkflowBuilder({ workspace, onUpdateWorkflow }: WorkflowBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Workflow Architect. Tell me what research task you'd like to automate, and I'll build a custom autonomous workflow for you." }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(workspace.workflows[0] || null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user wants to build an AI research workflow. 
        Current Workspace: ${workspace.name} (${workspace.description})
        User Request: ${userMessage}
        
        Respond as a helpful AI architect. If the user describes a task, propose a multi-step workflow.
        Format your response as a friendly explanation followed by a JSON block describing the workflow if applicable.
        JSON format: { "name": "...", "description": "...", "steps": [{ "name": "...", "type": "search|summarize|analyze|export", "config": {} }] }`,
        config: {
          systemInstruction: "You are an expert AI workflow designer for academic research. You help users automate repetitive tasks like literature reviews, data extraction, and paper summaries. Always provide a JSON block for any valid workflow request."
        }
      });

      const text = response.text;
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);

      // Try to extract JSON for a new workflow
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const workflowData = JSON.parse(jsonMatch[0]);
          const newWorkflow: Workflow = {
            id: `wf-${Date.now()}`,
            name: workflowData.name,
            description: workflowData.description,
            status: 'idle',
            createdAt: new Date().toISOString(),
            steps: workflowData.steps.map((s: any, i: number) => ({
              id: `s-${i}`,
              ...s,
              status: 'pending'
            }))
          };
          setActiveWorkflow(newWorkflow);
          onUpdateWorkflow(newWorkflow);
        } catch (e) {
          console.error("Failed to parse workflow JSON", e);
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while designing your workflow. Please try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const executeStep = async (step: WorkflowStep): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    switch (step.type) {
      case 'search':
        const searchResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Perform a research search for: ${step.config.query || step.name}`,
          config: { tools: [{ googleSearch: {} }] }
        });
        return searchResponse.text || "No results found.";
        
      case 'summarize':
        const summarizeResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Summarize the following research context: ${workspace.description}. Focus on: ${step.config.focus || 'general overview'}.`,
        });
        return summarizeResponse.text || "Summary failed.";
        
      default:
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `Successfully completed ${step.name}. Task processed autonomously.`;
    }
  };

  const runWorkflow = async () => {
    if (!activeWorkflow || isRunning) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);
    
    const updatedWorkflow = { ...activeWorkflow, status: 'running' as const };
    const updatedSteps = [...updatedWorkflow.steps];
    
    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStepIndex(i);
      updatedSteps[i].status = 'running';
      const currentWorkflow = { ...updatedWorkflow, steps: [...updatedSteps] };
      setActiveWorkflow(currentWorkflow);
      onUpdateWorkflow(currentWorkflow);
      
      try {
        const output = await executeStep(updatedSteps[i]);
        updatedSteps[i].status = 'completed';
        updatedSteps[i].output = output;
      } catch (error) {
        console.error(`Step ${i} failed:`, error);
        updatedSteps[i].status = 'failed';
        updatedSteps[i].output = `Error: ${error instanceof Error ? error.message : String(error)}`;
        const failedWorkflow = { ...updatedWorkflow, steps: [...updatedSteps], status: 'failed' as const };
        setActiveWorkflow(failedWorkflow);
        onUpdateWorkflow(failedWorkflow);
        setIsRunning(false);
        return;
      }
      
      const intermediateWorkflow = { ...updatedWorkflow, steps: [...updatedSteps] };
      setActiveWorkflow(intermediateWorkflow);
      onUpdateWorkflow(intermediateWorkflow);
    }
    
    const finalWorkflow = { ...updatedWorkflow, steps: [...updatedSteps], status: 'completed' as const };
    setActiveWorkflow(finalWorkflow);
    onUpdateWorkflow(finalWorkflow);
    setIsRunning(false);
    setCurrentStepIndex(-1);
  };

  const resetWorkflow = () => {
    if (!activeWorkflow) return;
    const resetSteps = activeWorkflow.steps.map(s => ({ ...s, status: 'pending' as const, output: undefined }));
    const resetWorkflow = { ...activeWorkflow, steps: resetSteps, status: 'idle' as const };
    setActiveWorkflow(resetWorkflow);
    onUpdateWorkflow(resetWorkflow);
    setCurrentStepIndex(-1);
    setIsRunning(false);
  };

  return (
    <div className="h-full flex bg-zinc-950 overflow-hidden">
      {/* Left: Chat & Selector Interface */}
      <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950/50 backdrop-blur-xl">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            Workflow Architect
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Chat to design autonomous research agents.</p>
        </div>

        {/* Workflow Selector */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <List className="w-3 h-3" /> Your Workflows
            </span>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {workspace.workflows.map(wf => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(wf)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                  activeWorkflow?.id === wf.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{wf.name}</span>
                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeWorkflow?.id === wf.id ? 'opacity-100' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' ? 'bg-zinc-900 text-zinc-300' : 'bg-emerald-500 text-black font-medium'
              }`}>
                <div className="markdown-body">
                  <Markdown>{msg.content.split('```')[0]}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-zinc-900 p-3 rounded-2xl text-zinc-500 text-sm italic">
                Architecting your workflow...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-zinc-800">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., 'Build a workflow to find papers on QEC and summarize them'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isGenerating || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Workflow Canvas */}
      <div className="flex-1 flex flex-col relative">
        {activeWorkflow ? (
          <>
            <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activeWorkflow.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    activeWorkflow.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' :
                    activeWorkflow.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {activeWorkflow.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm max-w-2xl">{activeWorkflow.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={resetWorkflow}
                  className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                  title="Reset Workflow"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={runWorkflow}
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    isRunning 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/10'
                  }`}
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Running...' : 'Execute Workflow'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12">
              <div className="max-w-3xl mx-auto space-y-8 relative">
                {/* Connection Line */}
                <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-zinc-800 -z-10" />

                {activeWorkflow.steps.map((step, index) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex gap-6 p-6 rounded-2xl border transition-all ${
                      step.status === 'running' ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5' :
                      step.status === 'completed' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-950 border-zinc-900'
                    }`}
                  >
                    {/* Step Status Indicator */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                      step.status === 'running' ? 'bg-emerald-500 text-black border-emerald-400' :
                      step.status === 'completed' ? 'bg-zinc-800 text-emerald-500 border-zinc-700' : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                    }`}>
                      {step.status === 'running' ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                       step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon type={step.type} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold ${step.status === 'running' ? 'text-emerald-500' : 'text-white'}`}>
                          {step.name}
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{step.type}</span>
                      </div>
                      
                      {step.output ? (
                        <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed font-mono">
                          <div className="flex items-center gap-2 text-emerald-500/70 mb-2 font-sans font-bold uppercase tracking-tighter">
                            <Zap className="w-3 h-3" /> Output Log
                          </div>
                          {step.output}
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-sm">Waiting for previous steps to complete...</p>
                      )}

                      {step.status === 'running' && (
                        <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                <button className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all group">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-widest">Add Manual Step</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
              <Zap className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Active Workflow</h2>
            <p className="text-zinc-500 max-w-md">Use the AI Architect on the left to design a custom research workflow or select an existing one.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xl">
              {[
                { title: 'Literature Review', icon: Search, desc: 'Search, summarize, and extract.' },
                { title: 'Data Extraction', icon: Database, desc: 'Parse papers for specific metrics.' },
                { title: 'Trend Analysis', icon: Zap, desc: 'Identify emerging research topics.' },
                { title: 'Export Report', icon: FileText, desc: 'Generate a formatted summary.' }
              ].map((tpl, i) => (
                <button key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left hover:bg-zinc-900 hover:border-emerald-500/50 transition-all group">
                  <tpl.icon className="w-5 h-5 text-zinc-500 mb-3 group-hover:text-emerald-500 transition-colors" />
                  <h4 className="text-sm font-bold text-white mb-1">{tpl.title}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
