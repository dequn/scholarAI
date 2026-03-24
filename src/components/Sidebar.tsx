import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Network, 
  Database, 
  Terminal, 
  Settings, 
  Plus, 
  ChevronRight, 
  Users, 
  History, 
  Share2, 
  LayoutDashboard,
  Cpu,
  FolderOpen,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  workspaces: any[];
  activeWorkspace: any;
  setActiveWorkspace: (ws: any) => void;
}

export default function Sidebar({ activeTab, setActiveTab, workspaces, activeWorkspace, setActiveWorkspace }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: Search, label: 'Paper Search' },
    { id: 'graph', icon: Network, label: 'Paper Graph' },
    { id: 'knowledge', icon: Database, label: 'Knowledge Base' },
    { id: 'analysis', icon: BookOpen, label: 'Paper Analysis' },
    { id: 'files', icon: FolderOpen, label: 'Workspace Files' },
    { id: 'workflow', icon: WorkflowIcon, label: 'AI Workflows' },
    { id: 'management', icon: Settings, label: 'KB Management' },
    { id: 'skills', icon: Cpu, label: 'Skill Marketplace' },
    { id: 'history', icon: History, label: 'Version Control' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      className="h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col text-zinc-400 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold">
            S
          </div>
          {isExpanded && <span className="font-semibold text-white tracking-tight">ScholarSphere</span>}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:text-white transition-colors"
        >
          <ChevronRight className={cn("w-5 h-5 transition-transform", !isExpanded && "rotate-180")} />
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 mb-8">
        <div className={cn("flex items-center gap-2 mb-2 px-2", !isExpanded && "justify-center")}>
          <Users className="w-4 h-4" />
          {isExpanded && <span className="text-xs font-medium uppercase tracking-wider opacity-50">Workspaces</span>}
        </div>
        <div className="space-y-1">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => setActiveWorkspace(ws)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                activeWorkspace?.id === ws.id ? "bg-zinc-800 text-white" : "hover:bg-zinc-900 hover:text-zinc-200",
                !isExpanded && "justify-center"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {isExpanded && <span className="text-sm font-medium truncate">{ws.name}</span>}
            </button>
          ))}
          <button className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900 transition-all text-emerald-500", !isExpanded && "justify-center")}>
            <Plus className="w-4 h-4" />
            {isExpanded && <span className="text-sm font-medium">New Project</span>}
          </button>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-1">
        <div className={cn("flex items-center gap-2 mb-2 px-2", !isExpanded && "justify-center")}>
          <Terminal className="w-4 h-4" />
          {isExpanded && <span className="text-xs font-medium uppercase tracking-wider opacity-50">Platform</span>}
        </div>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
              activeTab === item.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-zinc-900 hover:text-zinc-200",
              !isExpanded && "justify-center"
            )}
          >
            <item.icon className="w-5 h-5" />
            {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-nav"
                className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <button className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900 transition-all", !isExpanded && "justify-center")}>
          <Settings className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
}
