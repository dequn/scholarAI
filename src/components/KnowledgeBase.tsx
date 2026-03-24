import React, { useState, useRef, useEffect } from 'react';
import { Send, Book, FileText, ChevronRight, PlusCircle, Loader2, Info, Database, CheckSquare, Square, XCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/gemini';
import { Paper, Note } from '../types';

export default function KnowledgeBase({ workspace }: { workspace: any }) {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', content: string, citations?: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'kb' | 'open'>('kb');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const exampleQuestions = [
    {
      q: "What are the main error thresholds for surface codes?",
      a: "According to the research in your base, surface codes provide a high error threshold (around 1%) compared to other topological codes, making them a practical path for fault-tolerant quantum computing."
    },
    {
      q: "Summarize the methodology used in Kitaev's 2003 paper.",
      a: "Kitaev (2003) introduced a methodology based on the topological properties of many-body systems, specifically using anyons on a torus to create stable quantum memory that is naturally resistant to local perturbations."
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const toggleSource = (id: string) => {
    setSelectedSources(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSend = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const userMsg = typeof e === 'string' ? e : query;
    if (!userMsg.trim() || isLoading) return;

    setQuery('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      if (mode === 'kb') {
        let context = [...workspace.papers, ...workspace.notes, ...workspace.docs];
        if (selectedSources.length > 0) {
          context = context.filter(item => selectedSources.includes(item.id));
        }
        const result = await geminiService.answerFromKnowledgeBase(userMsg, context);
        setChat(prev => [...prev, { role: 'ai', content: result.answer, citations: result.citations }]);
      } else {
        const result = await geminiService.answerFromKnowledgeBase(userMsg, []);
        setChat(prev => [...prev, { role: 'ai', content: result.answer + "\n\n*Note: This answer is generated from general knowledge and may have lower confidence.*" }]);
      }
    } catch (error) {
      setChat(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">AI Research Notebook</h2>
              <p className="text-xs text-zinc-500">
                {selectedSources.length > 0 
                  ? `Answering using ${selectedSources.length} selected sources` 
                  : 'Knowledge-grounded reasoning engine'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedSources.length > 0 && (
              <button 
                onClick={() => setSelectedSources([])}
                className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 uppercase tracking-widest"
              >
                <XCircle className="w-3 h-3" /> Clear Selection
              </button>
            )}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setMode('kb')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'kb' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => setMode('open')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'open' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Open Search
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 mx-auto mb-6">
                  <Book className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ask your data anything</h3>
                <p className="text-zinc-400 text-sm">
                  Query your workspace's papers, documents, and notes. ScholarSphere will provide grounded answers with citations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="col-span-full mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" /> Example Queries & Answers
                  </span>
                </div>
                {exampleQuestions.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(ex.q)}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Question</span>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-500 transition-colors">{ex.q}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5">Answer</span>
                      <p className="text-xs text-zinc-500 line-clamp-2 italic">"{ex.a}"</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-6 ${
                msg.role === 'user' 
                  ? 'bg-emerald-500 text-black font-medium shadow-lg shadow-emerald-500/10' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 w-full mb-1">Citations</span>
                    {msg.citations.map((citeId, cidx) => {
                      const paper = workspace.papers.find((p: any) => p.id === citeId);
                      const note = workspace.notes.find((n: any) => n.id === citeId);
                      const doc = workspace.docs.find((d: any) => d.id === citeId);
                      return (
                        <button key={cidx} className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-[10px] text-zinc-300 transition-colors">
                          <FileText className="w-3 h-3" />
                          {paper?.title || note?.title || doc?.title || 'Source'}
                        </button>
                      );
                    })}
                  </div>
                )}
                {msg.role === 'ai' && (
                  <button className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
                    <PlusCircle className="w-3 h-3" />
                    Save to Notes
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-sm text-zinc-400">Analyzing knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'kb' ? "Ask about your research..." : "Ask an open question..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-black p-2 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest">
            <Info className="w-3 h-3" />
            Answers are grounded in your workspace data
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context Selection */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 hidden xl:block overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Sources</h3>
          <span className="text-[10px] text-zinc-600 font-bold">{selectedSources.length || 'All'} Active</span>
        </div>
        
        <div className="space-y-8">
          {/* Papers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Papers</span>
              <span className="text-xs text-zinc-500">{workspace.papers.length}</span>
            </div>
            <div className="space-y-2">
              {workspace.papers.map((p: any) => (
                <button 
                  key={p.id} 
                  onClick={() => toggleSource(p.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 ${
                    selectedSources.includes(p.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {selectedSources.includes(p.id) ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-medium line-clamp-2 mb-1 ${selectedSources.includes(p.id) ? 'text-white' : 'text-zinc-400'}`}>
                      {p.title}
                    </p>
                    <p className="text-[10px] text-zinc-600">{p.year}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Documents */}
          {workspace.docs && workspace.docs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">Documents</span>
                <span className="text-xs text-zinc-500">{workspace.docs.length}</span>
              </div>
              <div className="space-y-2">
                {workspace.docs.map((d: any) => (
                  <button 
                    key={d.id} 
                    onClick={() => toggleSource(d.id)}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 ${
                      selectedSources.includes(d.id) 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {selectedSources.includes(d.id) ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-medium line-clamp-2 mb-1 ${selectedSources.includes(d.id) ? 'text-white' : 'text-zinc-400'}`}>
                        {d.title}
                      </p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{d.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Notes</span>
              <span className="text-xs text-zinc-500">{workspace.notes.length}</span>
            </div>
            <div className="space-y-2">
              {workspace.notes.map((n: any) => (
                <button 
                  key={n.id} 
                  onClick={() => toggleSource(n.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 ${
                    selectedSources.includes(n.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {selectedSources.includes(n.id) ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-medium line-clamp-2 mb-1 ${selectedSources.includes(n.id) ? 'text-white' : 'text-zinc-400'}`}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-600">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
