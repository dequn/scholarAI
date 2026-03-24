import React, { useState } from 'react';
import { 
  Book, 
  FileText, 
  StickyNote, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  User,
  MoreVertical,
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace, Paper, Note, Doc } from '../types';

interface KnowledgeManagementProps {
  workspace: Workspace;
  onRemovePaper: (id: string) => void;
  onUpdatePaperTags: (id: string, tags: string[]) => void;
  onAddNote: (note: Partial<Note>) => void;
  onRemoveNote: (id: string) => void;
  onAddDoc: (doc: Partial<Doc>) => void;
  onRemoveDoc: (id: string) => void;
  onJumpToFile: () => void;
}

export default function KnowledgeManagement({ 
  workspace, 
  onRemovePaper, 
  onUpdatePaperTags,
  onAddNote, 
  onRemoveNote, 
  onAddDoc, 
  onRemoveDoc,
  onJumpToFile
}: KnowledgeManagementProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'papers' | 'notes' | 'docs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBrowsingFiles, setIsBrowsingFiles] = useState(false);
  const [tagInput, setTagInput] = useState<{ id: string, value: string } | null>(null);
  
  const categories = [
    { id: 'all', label: 'All Sources', icon: Database },
    { id: 'papers', label: 'Papers', icon: Book, count: workspace.papers.length },
    { id: 'notes', label: 'Notes', icon: StickyNote, count: workspace.notes.length },
    { id: 'docs', label: 'Documents', icon: FileText, count: workspace.docs.length },
  ];

  const filteredItems = () => {
    let items: any[] = [];
    
    if (activeCategory === 'all' || activeCategory === 'papers') {
      items = [...items, ...workspace.papers.map(p => ({ ...p, itemType: 'paper' }))];
    }
    if (activeCategory === 'all' || activeCategory === 'notes') {
      items = [...items, ...workspace.notes.map(n => ({ ...n, itemType: 'note' }))];
    }
    if (activeCategory === 'all' || activeCategory === 'docs') {
      items = [...items, ...workspace.docs.map(d => ({ ...d, itemType: 'doc' }))];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.abstract && item.abstract.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    return items.sort((a, b) => {
      const dateA = a.year || new Date(a.createdAt || a.addedAt).getTime();
      const dateB = b.year || new Date(b.createdAt || b.addedAt).getTime();
      return dateB - dateA;
    });
  };

  const handleAddTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    const paper = workspace.papers.find(p => p.id === id);
    if (!paper) return;
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const currentTags = paper.tags || [];
    if (!currentTags.includes(formattedTag)) {
      onUpdatePaperTags(id, [...currentTags, formattedTag]);
    }
    setTagInput(null);
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const paper = workspace.papers.find(p => p.id === id);
    if (!paper) return;
    onUpdatePaperTags(id, (paper.tags || []).filter(t => t !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="p-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Knowledge Base Management</h2>
            <p className="text-zinc-400 text-sm">Manage, organize, and curate your research data sources.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsBrowsingFiles(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl transition-all text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Add from workspace files
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-zinc-800 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
                {cat.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                    activeCategory === cat.id ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sources or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems().map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all flex items-start gap-5"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    item.itemType === 'paper' ? 'bg-blue-500/10 text-blue-500' :
                    item.itemType === 'note' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {item.itemType === 'paper' ? <Book className="w-6 h-6" /> :
                     item.itemType === 'note' ? <StickyNote className="w-6 h-6" /> :
                     <FileText className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            item.itemType === 'paper' ? 'bg-blue-500/10 text-blue-500' :
                            item.itemType === 'note' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {item.itemType}
                          </span>
                          {item.isAiGenerated && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">
                              AI Generated
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={onJumpToFile}
                          className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Jump to Workspace File"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (item.itemType === 'paper') onRemovePaper(item.id);
                            if (item.itemType === 'note') onRemoveNote(item.id);
                            if (item.itemType === 'doc') onRemoveDoc(item.id);
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove from Knowledge Base"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                      {item.abstract || item.content || "No description available."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-medium">
                      {item.authors && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {item.authors.join(', ')}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.year || new Date(item.createdAt || item.addedAt).toLocaleDateString()}
                      </div>
                      {item.doi && (
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {item.doi}
                        </div>
                      )}
                      {item.type && (
                        <div className="flex items-center gap-1.5 uppercase">
                          <FileText className="w-3.5 h-3.5" />
                          {item.type}
                        </div>
                      )}
                    </div>

                    {/* Tags Section */}
                    {item.itemType === 'paper' && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.tags?.map((tag: string) => (
                          <span 
                            key={tag} 
                            className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md text-[10px] group/tag"
                          >
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(item.id, tag)}
                              className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition-all"
                            >
                              <Plus className="w-2.5 h-2.5 rotate-45" />
                            </button>
                          </span>
                        ))}
                        {tagInput?.id === item.id ? (
                          <input
                            autoFocus
                            type="text"
                            placeholder="Add tag..."
                            className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-0.5 text-[10px] text-white focus:outline-none w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTag(item.id, tagInput.value);
                              if (e.key === 'Escape') setTagInput(null);
                            }}
                            onChange={(e) => setTagInput({ ...tagInput, value: e.target.value })}
                            onBlur={() => setTagInput(null)}
                          />
                        ) : (
                          <button 
                            onClick={() => setTagInput({ id: item.id, value: '' })}
                            className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-zinc-700 text-zinc-600 hover:text-zinc-400 hover:border-zinc-500 rounded-md text-[10px] transition-all"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Add Tag
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredItems().length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mx-auto mb-4">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No sources found</h3>
                <p className="text-zinc-500 text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Browser Modal */}
      <AnimatePresence>
        {isBrowsingFiles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Add from Workspace</h3>
                  <p className="text-zinc-500 text-sm">Select a file to add to your knowledge base.</p>
                </div>
                <button 
                  onClick={() => setIsBrowsingFiles(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {workspace.files.map(file => (
                  <FilePickerRow 
                    key={file.id} 
                    file={file} 
                    onSelect={(f) => {
                      if (f.type === 'file') {
                        onAddDoc({
                          title: f.name,
                          content: `Imported from workspace: ${f.name}`,
                          type: (f.extension === 'pdf' ? 'pdf' : f.extension === 'docx' ? 'docx' : 'txt') as any
                        });
                        setIsBrowsingFiles(false);
                      }
                    }} 
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsBrowsingFiles(false)}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilePickerRow({ file, level = 0, onSelect }: { file: any, level?: number, onSelect: (file: any) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = file.type === 'folder';

  return (
    <div>
      <div 
        onClick={() => isFolder ? setIsExpanded(!isExpanded) : onSelect(file)}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
          isFolder ? 'hover:bg-zinc-800/50' : 'hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500'
        }`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        {isFolder ? (
          isExpanded ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="text-sm truncate">{file.name}</span>
        {file.tags?.includes('#added-to-kb') && (
          <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-bold">In KB</span>
        )}
      </div>
      {isFolder && isExpanded && file.children?.map((child: any) => (
        <FilePickerRow key={child.id} file={child} level={level + 1} onSelect={onSelect} />
      ))}
    </div>
  );
}
