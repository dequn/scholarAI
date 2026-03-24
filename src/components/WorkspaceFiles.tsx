import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Info, 
  Shield, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Plus,
  FileText,
  Database,
  Tag as TagIcon,
  Clock
} from 'lucide-react';
import { Workspace, WorkspaceFile } from '../types';

interface WorkspaceFilesProps {
  workspace: Workspace;
}

const FairIndicator = ({ label, status, icon: Icon }: { label: string, status: boolean, icon: any }) => (
  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
    status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'
  }`}>
    <Icon className="w-3 h-3" />
    {label}
    {status ? <CheckCircle2 className="w-2.5 h-2.5 ml-0.5" /> : <XCircle className="w-2.5 h-2.5 ml-0.5" />}
  </div>
);

const FileRow = ({ file, level = 0 }: { file: WorkspaceFile, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = file.type === 'folder';

  return (
    <div className="w-full">
      <div 
        className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
          isFolder ? 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50' : 'bg-zinc-950 border-transparent hover:bg-zinc-900/30 hover:border-zinc-800'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => isFolder && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 shrink-0">
          {isFolder && (
            <div className="text-zinc-600">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          )}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isFolder ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {isFolder ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-white truncate">{file.name}</span>
            {file.tags?.map(tag => (
              <span key={tag} className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(file.modifiedAt).toLocaleDateString()}
            </span>
            {file.size && (
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {file.size}
              </span>
            )}
            {file.extension && (
              <span className="uppercase font-bold text-zinc-600">{file.extension}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 mr-4">
            <FairIndicator label="F" status={file.fairStatus.findable} icon={Search} />
            <FairIndicator label="A" status={file.fairStatus.accessible} icon={Shield} />
            <FairIndicator label="I" status={file.fairStatus.interoperable} icon={RefreshCw} />
            <FairIndicator label="R" status={file.fairStatus.reusable} icon={Globe} />
          </div>
          <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFolder && isExpanded && file.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {file.children.map(child => (
                <FileRow key={child.id} file={child} level={level + 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function WorkspaceFiles({ workspace }: WorkspaceFilesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="p-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Workspace Files</h2>
            <p className="text-zinc-400 text-sm">Organize research data using FAIR principles (Findable, Accessible, Interoperable, Reusable).</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">FAIR Score</span>
                <span className="text-lg font-bold text-emerald-500">84%</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex gap-1">
                {['F', 'A', 'I', 'R'].map(l => (
                  <div key={l} className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-emerald-500/10">
              <Plus className="w-4 h-4" />
              New Resource
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search files, folders, or metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-all">
              <Info className="w-4 h-4" />
              FAIR Guidelines
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-4 space-y-2">
            {workspace.files.map(file => (
              <FileRow key={file.id} file={file} />
            ))}
            
            {workspace.files.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                  <Folder className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-white font-medium mb-1">No files in this workspace</h3>
                <p className="text-zinc-500 text-sm">Start by adding data, proposals, or research documents.</p>
              </div>
            )}
          </div>

          {/* FAIR Principles Legend */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Findable', desc: 'Metadata and identifiers make data easy to find for both humans and computers.', icon: Search, color: 'text-blue-500' },
              { title: 'Accessible', desc: 'Once found, users need to know how data can be accessed, possibly including authentication.', icon: Shield, color: 'text-emerald-500' },
              { title: 'Interoperable', desc: 'Data needs to integrate with other data and be compatible with applications or workflows.', icon: RefreshCw, color: 'text-amber-500' },
              { title: 'Reusable', desc: 'Data should be well-described so that they can be replicated and/or combined in different settings.', icon: Globe, color: 'text-purple-500' },
            ].map((p, i) => (
              <div key={i} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center mb-4 ${p.color}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{p.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
