import React, { useState } from 'react';
import { 
  Cpu, 
  Download, 
  CheckCircle2, 
  Terminal, 
  Code, 
  FileSearch, 
  Globe, 
  BarChart3,
  Play,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/gemini';

const SKILLS = [
  { 
    id: 'paper-summarizer', 
    name: 'Paper Summarizer', 
    description: 'Extracts key findings, methodology, and results from research papers.',
    icon: FileSearch,
    category: 'Analysis'
  },
  { 
    id: 'data-analyzer', 
    name: 'Data Analyzer', 
    description: 'Generates Python code for statistical analysis and data visualization.',
    icon: BarChart3,
    category: 'Coding'
  },
  { 
    id: 'web-crawler', 
    name: 'Web Crawler', 
    description: 'Automated data gathering from specific research portals and journals.',
    icon: Globe,
    category: 'Data'
  },
  { 
    id: 'ppt-generator', 
    name: 'PPT Draftsman', 
    description: 'Creates structured presentation outlines from research notes.',
    icon: Terminal,
    category: 'Writing'
  }
];

export default function SkillMarketplace({ workspace }: { workspace: any }) {
  const [installedSkills, setInstalledSkills] = useState<string[]>(workspace.skills);
  const [activeSkill, setActiveSkill] = useState<any>(null);
  const [task, setTask] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleInstall = (id: string) => {
    if (installedSkills.includes(id)) return;
    setInstalledSkills([...installedSkills, id]);
  };

  const handleRunSkill = async () => {
    if (!task.trim()) return;
    setIsRunning(true);
    setOutput('');
    
    try {
      const code = await geminiService.generateCode(task);
      setOutput(code);
    } catch (error) {
      setOutput("# Error generating code. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Skill Marketplace</h1>
        <p className="text-zinc-400">Enhance your research workspace with AI-powered automation and analysis tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {SKILLS.map((skill, idx) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-zinc-800 text-emerald-500 group-hover:scale-110 transition-transform">
                <skill.icon className="w-6 h-6" />
              </div>
              {installedSkills.includes(skill.id) ? (
                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  Installed
                </div>
              ) : (
                <button
                  onClick={() => handleInstall(skill.id)}
                  className="bg-emerald-500 text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors"
                >
                  Install
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{skill.name}</h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{skill.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                {skill.category}
              </span>
              {installedSkills.includes(skill.id) && (
                <button 
                  onClick={() => setActiveSkill(skill)}
                  className="text-xs text-emerald-500 hover:underline font-bold flex items-center gap-1"
                >
                  Launch Skill <Play className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeSkill && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <activeSkill.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeSkill.name}</h2>
                </div>
                <button onClick={() => setActiveSkill(null)} className="text-zinc-500 hover:text-white">
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Task Description</label>
                    <textarea
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="Describe what you want the AI to do..."
                      className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={handleRunSkill}
                    disabled={isRunning || !task.trim()}
                    className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Execute Skill
                  </button>
                </div>

                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Output</div>
                  <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap h-full">
                    {output || (isRunning ? 'Generating...' : 'Waiting for execution...')}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
