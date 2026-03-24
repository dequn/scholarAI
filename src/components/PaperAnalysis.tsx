import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table, 
  Search, 
  Settings2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Tag as TagIcon,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Paper } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface PaperAnalysisProps {
  papers: Paper[];
  onUpdatePaperTags: (id: string, tags: string[]) => void;
}

interface AnalysisResult {
  paperId: string;
  [key: string]: string | undefined;
}

// Updated extraction fields for research papers
const DEFAULT_FIELDS = [
  { id: 'insights', label: 'Insights', description: 'Key insights extracted from the paper' },
  { id: 'tldr', label: 'TL;DR', description: 'Too long; didn\'t read summary' },
  { id: 'summary', label: 'Summary', description: 'General summary of the paper' },
  { id: 'research_question', label: 'Research Question', description: 'The primary research question addressed' },
  { id: 'methodology', label: 'Methodology', description: 'Research methodology used' },
  { id: 'key_findings', label: 'Key Findings', description: 'Most important findings' },
  { id: 'primary_outcomes', label: 'Primary Outcomes', description: 'Main outcomes of the study' },
  { id: 'limitations', label: 'Limitations', description: 'Study limitations and constraints' },
  { id: 'interventions', label: 'Interventions', description: 'Interventions or treatments applied' },
  { id: 'conclusion', label: 'Conclusion', description: 'Final conclusions of the research' },
  { id: 'research_gaps', label: 'Research Gaps', description: 'Identified gaps in current research' },
  { id: 'funding_source', label: 'Funding Source', description: 'Sponsors and funding entities' },
  { id: 'introduction_summary', label: 'Introduction Summary', description: 'Summary of the introduction section' },
  { id: 'discussion_summary', label: 'Discussion Summary', description: 'Summary of the discussion section' },
  { id: 'hypotheses_tested', label: 'Hypotheses Tested', description: 'List of hypotheses investigated' },
  { id: 'future_research', label: 'Future Research', description: 'Suggested areas for future study' },
  { id: 'dependent_variables', label: 'Dependent Variables', description: 'Variables measured in the study' },
  { id: 'independent_variables', label: 'Independent Variables', description: 'Variables manipulated in the study' },
  { id: 'study_design', label: 'Study Design', description: 'The formal design of the study' },
  { id: 'objectives', label: 'Objectives', description: 'Specific goals and objectives' },
];

export default function PaperAnalysis({ papers, onUpdatePaperTags }: PaperAnalysisProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [activeFields, setActiveFields] = useState<string[]>(DEFAULT_FIELDS.map(f => f.id));
  const [tagInput, setTagInput] = useState<{ id: string, value: string } | null>(null);

  const filteredPapers = papers.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const togglePaperSelection = (id: string) => {
    setSelectedPapers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedPapers.length === filteredPapers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(filteredPapers.map(p => p.id));
    }
  };

  const handleAnalyze = async () => {
    if (selectedPapers.length === 0) return;
    setIsAnalyzing(true);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
      for (const paperId of selectedPapers) {
        const paper = papers.find(p => p.id === paperId);
        if (!paper) continue;

        const prompt = `Analyze the following research paper and extract these fields: ${activeFields.join(', ')}.
        
        Paper Title: ${paper.title}
        Abstract/Content: ${paper.abstract || "No abstract available."}
        
        Provide the output in JSON format with the fields as keys.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: activeFields.reduce((acc, field) => ({
                ...acc,
                [field]: { type: Type.STRING }
              }), {})
            }
          }
        });

        const result = JSON.parse(response.text);
        setAnalysisResults(prev => ({
          ...prev,
          [paperId]: { paperId, ...result }
        }));
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    const paper = papers.find(p => p.id === id);
    if (!paper) return;
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const currentTags = paper.tags || [];
    if (!currentTags.includes(formattedTag)) {
      onUpdatePaperTags(id, [...currentTags, formattedTag]);
    }
    setTagInput(null);
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const paper = papers.find(p => p.id === id);
    if (!paper) return;
    onUpdatePaperTags(id, (paper.tags || []).filter(t => t !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="p-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Paper Analysis</h2>
            <p className="text-zinc-400 text-sm">Extract key insights and compare research papers side-by-side.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2.5 rounded-xl border transition-all ${
                showConfig ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={selectedPapers.length === 0 || isAnalyzing}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-emerald-500/10"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : `Analyze ${selectedPapers.length} Papers`}
            </button>
          </div>
        </div>

        {/* Config Panel */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl max-w-7xl mx-auto w-full">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-emerald-500" />
                  Extraction Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DEFAULT_FIELDS.map(field => (
                    <label 
                      key={field.id}
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                        activeFields.includes(field.id)
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-white'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{field.label}</span>
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={activeFields.includes(field.id)}
                          onChange={() => {
                            setActiveFields(prev => 
                              prev.includes(field.id) 
                                ? prev.filter(f => f !== field.id) 
                                : [...prev, field.id]
                            );
                          }}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          activeFields.includes(field.id) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'
                        }`}>
                          {activeFields.includes(field.id) && <CheckCircle2 className="w-3 h-3 text-black" />}
                        </div>
                      </div>
                      <span className="text-[10px] opacity-60">{field.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Selection Info */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search papers by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {selectedPapers.length} Selected
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <button 
              onClick={toggleAllSelection}
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              {selectedPapers.length === filteredPapers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox"
                      checked={selectedPapers.length === filteredPapers.length && filteredPapers.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
                    />
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest min-w-[250px]">Paper</th>
                  {activeFields.map(fieldId => (
                    <th key={fieldId} className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest min-w-[200px]">
                      {DEFAULT_FIELDS.find(f => f.id === fieldId)?.label}
                    </th>
                  ))}
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest min-w-[150px]">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map(paper => (
                  <tr key={paper.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox"
                        checked={selectedPapers.includes(paper.id)}
                        onChange={() => togglePaperSelection(paper.id)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-1">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white mb-0.5 line-clamp-2">{paper.title}</div>
                          <div className="text-[10px] text-zinc-500 font-medium">{paper.authors.join(', ')} • {paper.year}</div>
                        </div>
                      </div>
                    </td>
                    
                    {activeFields.map(fieldId => (
                      <td key={fieldId} className="p-4">
                        {analysisResults[paper.id] ? (
                          <div className="text-xs text-zinc-300 leading-relaxed line-clamp-4">
                            {analysisResults[paper.id][fieldId] || <span className="text-zinc-600 italic">Not found</span>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600 italic">
                            <Sparkles className="w-3 h-3 opacity-30" />
                            Pending analysis
                          </div>
                        )}
                      </td>
                    ))}

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {paper.tags?.map(tag => (
                          <span 
                            key={tag} 
                            className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md text-[10px] group/tag"
                          >
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(paper.id, tag)}
                              className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition-all"
                            >
                              <Plus className="w-2.5 h-2.5 rotate-45" />
                            </button>
                          </span>
                        ))}
                        {tagInput?.id === paper.id ? (
                          <input
                            autoFocus
                            type="text"
                            placeholder="Add tag..."
                            className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-0.5 text-[10px] text-white focus:outline-none w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTag(paper.id, tagInput.value);
                              if (e.key === 'Escape') setTagInput(null);
                            }}
                            onChange={(e) => setTagInput({ ...tagInput, value: e.target.value })}
                            onBlur={() => setTagInput(null)}
                          />
                        ) : (
                          <button 
                            onClick={() => setTagInput({ id: paper.id, value: '' })}
                            className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-zinc-700 text-zinc-600 hover:text-zinc-400 hover:border-zinc-500 rounded-md text-[10px] transition-all"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPapers.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-white font-medium mb-1">No papers found</h3>
                <p className="text-zinc-500 text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
