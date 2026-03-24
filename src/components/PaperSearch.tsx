import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus, Book, ExternalLink, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/gemini';
import { Paper } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PaperSearch({ workspace, onAddPaper }: { workspace: any, onAddPaper: (paper: Paper) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<Paper>[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    const papers = await geminiService.semanticSearch(query);
    setResults(papers);
    setIsSearching(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Semantic Paper Search</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Discover relevant research across multiple platforms using AI-powered semantic matching.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, title, or abstract..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-black px-6 py-2 rounded-xl font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {results.map((paper, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {paper.year}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {paper.authors?.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                    {paper.abstract}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="text-xs flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Source
                    </button>
                    <button className="text-xs flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onAddPaper(paper as Paper)}
                  disabled={workspace.papers.some((p: any) => p.title === paper.title)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    workspace.papers.some((p: any) => p.title === paper.title)
                      ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  )}
                >
                  {workspace.papers.some((p: any) => p.title === paper.title) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to Base
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
