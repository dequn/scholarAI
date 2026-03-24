import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import PaperSearch from './components/PaperSearch';
import KnowledgeBase from './components/KnowledgeBase';
import KnowledgeManagement from './components/KnowledgeManagement';
import PaperAnalysis from './components/PaperAnalysis';
import WorkspaceFiles from './components/WorkspaceFiles';
import WorkflowBuilder from './components/WorkflowBuilder';
import PaperGraph from './components/PaperGraph';
import SkillMarketplace from './components/SkillMarketplace';
import VersionControl from './components/VersionControl';
import { Workspace, Paper, Note, Doc, Workflow } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    // Initial workspace with sample data and folders
    const initialWorkspace: Workspace = {
      id: 'ws-1',
      name: 'Quantum Computing Research',
      description: 'Exploring topological quantum error correction and superconducting qubits.',
      role: 'owner',
      members: [
        { id: 'u-1', name: 'Dr. Sarah Chen', email: 'sarah.chen@research.edu', role: 'owner' },
        { id: 'u-2', name: 'James Wilson', email: 'j.wilson@lab.org', role: 'contributor' }
      ],
      papers: [
        {
          id: 'p-1',
          title: 'Topological Quantum Error Correction',
          authors: ['A. Kitaev'],
          year: 2003,
          abstract: 'We present a new approach to quantum error correction based on topological properties of many-body systems.',
          isAdded: true,
          citations: ['p-2', 'p-3'],
          citedBy: ['p-4', 'p-5'],
          tags: ['#high-value', '#foundational']
        },
        {
          id: 'p-2',
          title: 'Surface Codes for Fault-Tolerant Computing',
          authors: ['A. Fowler', 'M. Mariantoni'],
          year: 2012,
          abstract: 'Surface codes provide a practical path to large-scale quantum computation with high error thresholds.',
          isAdded: true,
          citations: ['p-3'],
          citedBy: ['p-1'],
          tags: ['#methodology']
        },
        {
          id: 'p-3',
          title: 'Quantum Error Correction for Beginners',
          authors: ['D. Gottesman'],
          year: 2009,
          abstract: 'A comprehensive introduction to the principles of quantum error correction and fault tolerance.',
          isAdded: true,
          citations: [],
          citedBy: ['p-1', 'p-2'],
          tags: ['#educational']
        },
        {
          id: 'p-4',
          title: 'Experimental Topological Quantum Computing',
          authors: ['C. Nayak', 'S. Das Sarma'],
          year: 2008,
          abstract: 'Review of experimental progress towards realizing topological qubits in solid-state systems.',
          isAdded: true,
          citations: ['p-1'],
          citedBy: [],
          tags: ['#experimental']
        },
        {
          id: 'p-5',
          title: 'Fault-Tolerant Quantum Computation with Anyons',
          authors: ['J. Preskill'],
          year: 1998,
          abstract: 'Exploring the use of anyons for robust quantum information processing.',
          isAdded: true,
          citations: [],
          citedBy: ['p-1'],
          tags: ['#theory']
        }
      ],
      notes: [
        {
          id: 'n-1',
          title: 'Initial Thoughts on Surface Codes',
          content: 'The error threshold seems promising, but the overhead is still significant.',
          createdAt: new Date().toISOString(),
          isAiGenerated: false
        }
      ],
      docs: [
        {
          id: 'd-1',
          title: 'Lab Report: Qubit Coherence Times',
          type: 'pdf',
          content: 'Measured T1 and T2 times for the latest superconducting qubit batch. Results show 15% improvement.',
          addedAt: new Date().toISOString()
        }
      ],
      skills: ['paper-summarizer', 'data-analyzer'],
      files: [
        {
          id: 'f-1',
          name: 'Data',
          type: 'folder',
          modifiedAt: new Date().toISOString(),
          fairStatus: { findable: true, accessible: true, interoperable: false, reusable: false },
          children: [
            {
              id: 'f-1-1',
              name: 'Raw_Readings_2024.csv',
              type: 'file',
              extension: 'csv',
              size: '1.2 MB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#raw-data']
            },
            {
              id: 'f-1-2',
              name: 'Processed_Data',
              type: 'folder',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              children: [
                {
                  id: 'f-1-2-1',
                  name: 'Cleaned_Qubits_v1.json',
                  type: 'file',
                  extension: 'json',
                  size: '450 KB',
                  modifiedAt: new Date().toISOString(),
                  fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true }
                }
              ]
            }
          ]
        },
        {
          id: 'f-2',
          name: 'Proposals',
          type: 'folder',
          modifiedAt: new Date().toISOString(),
          fairStatus: { findable: true, accessible: true, interoperable: false, reusable: true },
          children: [
            {
              id: 'f-2-1',
              name: 'NSF_Grant_Draft_v2.docx',
              type: 'file',
              extension: 'docx',
              size: '2.4 MB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: false, reusable: true }
            }
          ]
        },
        {
          id: 'f-3',
          name: 'Code',
          type: 'folder',
          modifiedAt: new Date().toISOString(),
          fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
          children: [
            {
              id: 'f-3-1',
              name: 'Simulation_Script.py',
              type: 'file',
              extension: 'py',
              size: '12 KB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#simulation', '#python']
            },
            {
              id: 'f-3-2',
              name: 'Analysis_Notebook.ipynb',
              type: 'file',
              extension: 'ipynb',
              size: '2.8 MB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true }
            }
          ]
        },
        {
          id: 'f-4',
          name: 'Notes',
          type: 'folder',
          modifiedAt: new Date().toISOString(),
          fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
          children: [
            {
              id: 'f-4-1',
              name: 'Research_Notes_Q1.txt',
              type: 'file',
              extension: 'txt',
              size: '15 KB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#added-to-kb']
            },
            {
              id: 'f-4-2',
              name: 'Meeting_Notes_Mar15.txt',
              type: 'file',
              extension: 'txt',
              size: '8 KB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#pending-kb']
            }
          ]
        },
        {
          id: 'f-5',
          name: 'Papers',
          type: 'folder',
          modifiedAt: new Date().toISOString(),
          fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
          children: [
            {
              id: 'f-5-1',
              name: 'Kitaev_2003_Topological.pdf',
              type: 'file',
              extension: 'pdf',
              size: '1.4 MB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#added-to-kb']
            },
            {
              id: 'f-5-2',
              name: 'Fowler_2012_Surface.pdf',
              type: 'file',
              extension: 'pdf',
              size: '2.1 MB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#added-to-kb']
            },
            {
              id: 'f-5-3',
              name: 'New_Quantum_Paper_Draft.pdf',
              type: 'file',
              extension: 'pdf',
              size: '850 KB',
              modifiedAt: new Date().toISOString(),
              fairStatus: { findable: true, accessible: true, interoperable: true, reusable: true },
              tags: ['#pending-kb']
            }
          ]
        }
      ],
      workflows: [
        {
          id: 'wf-1',
          name: 'Literature Review: Quantum Error Correction',
          description: 'Automatically search for new papers, summarize them, and extract key findings.',
          status: 'idle',
          createdAt: new Date().toISOString(),
          steps: [
            { id: 's-1', name: 'Search for "Topological QEC"', type: 'search', status: 'pending', config: { query: 'Topological QEC' } },
            { id: 's-2', name: 'Summarize Results', type: 'summarize', status: 'pending', config: { detail: 'high' } }
          ]
        }
      ]
    };

    setWorkspaces([initialWorkspace]);
    setActiveWorkspace(initialWorkspace);
  }, []);

  const handleAddPaper = (paper: Paper) => {
    if (!activeWorkspace) return;
    
    const newPaper = { ...paper, id: `p-${Date.now()}`, isAdded: true, citations: [], citedBy: [], tags: [] };
    const updatedWs = {
      ...activeWorkspace,
      papers: [...activeWorkspace.papers, newPaper]
    };
    
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleRemovePaper = (id: string) => {
    if (!activeWorkspace) return;
    const updatedWs = {
      ...activeWorkspace,
      papers: activeWorkspace.papers.filter(p => p.id !== id)
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleUpdatePaperTags = (id: string, tags: string[]) => {
    if (!activeWorkspace) return;
    const updatedWs = {
      ...activeWorkspace,
      papers: activeWorkspace.papers.map(p => p.id === id ? { ...p, tags } : p)
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleAddNote = (note: Partial<Note>) => {
    if (!activeWorkspace) return;
    const newNote: Note = {
      id: `n-${Date.now()}`,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      createdAt: new Date().toISOString(),
      isAiGenerated: !!note.isAiGenerated
    };
    const updatedWs = {
      ...activeWorkspace,
      notes: [newNote, ...activeWorkspace.notes]
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleRemoveNote = (id: string) => {
    if (!activeWorkspace) return;
    const updatedWs = {
      ...activeWorkspace,
      notes: activeWorkspace.notes.filter(n => n.id !== id)
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleAddDoc = (doc: Partial<Doc>) => {
    if (!activeWorkspace) return;
    const newDoc: Doc = {
      id: `d-${Date.now()}`,
      title: doc.title || 'Untitled Document',
      type: doc.type || 'pdf',
      content: doc.content || '',
      addedAt: new Date().toISOString()
    };
    const updatedWs = {
      ...activeWorkspace,
      docs: [newDoc, ...activeWorkspace.docs]
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleRemoveDoc = (id: string) => {
    if (!activeWorkspace) return;
    const updatedWs = {
      ...activeWorkspace,
      docs: activeWorkspace.docs.filter(d => d.id !== id)
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const handleUpdateWorkflow = (workflow: Workflow) => {
    if (!activeWorkspace) return;
    const exists = activeWorkspace.workflows.find(w => w.id === workflow.id);
    const updatedWorkflows = exists 
      ? activeWorkspace.workflows.map(w => w.id === workflow.id ? workflow : w)
      : [workflow, ...activeWorkspace.workflows];
    
    const updatedWs = {
      ...activeWorkspace,
      workflows: updatedWorkflows
    };
    setActiveWorkspace(updatedWs);
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWs.id ? updatedWs : ws));
  };

  const renderTab = () => {
    if (!activeWorkspace) return null;

    switch (activeTab) {
      case 'dashboard':
        return <WorkspaceDashboard workspace={activeWorkspace} />;
      case 'search':
        return <PaperSearch workspace={activeWorkspace} onAddPaper={handleAddPaper} />;
      case 'knowledge':
        return <KnowledgeBase workspace={activeWorkspace} />;
      case 'analysis':
        return <PaperAnalysis papers={activeWorkspace.papers} onUpdatePaperTags={handleUpdatePaperTags} />;
      case 'files':
        return <WorkspaceFiles workspace={activeWorkspace} />;
      case 'workflow':
        return <WorkflowBuilder workspace={activeWorkspace} onUpdateWorkflow={handleUpdateWorkflow} />;
      case 'management':
        return (
          <KnowledgeManagement 
            workspace={activeWorkspace} 
            onRemovePaper={handleRemovePaper}
            onUpdatePaperTags={handleUpdatePaperTags}
            onAddNote={handleAddNote}
            onRemoveNote={handleRemoveNote}
            onAddDoc={handleAddDoc}
            onRemoveDoc={handleRemoveDoc}
            onJumpToFile={() => setActiveTab('files')}
          />
        );
      case 'graph':
        return <PaperGraph papers={activeWorkspace.papers} onAddPaper={handleAddPaper} />;
      case 'skills':
        return <SkillMarketplace workspace={activeWorkspace} />;
      case 'history':
        return <VersionControl />;
      default:
        return <div className="p-8 text-zinc-500">Coming Soon: {activeTab}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
