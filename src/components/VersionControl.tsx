import React from 'react';
import { History, GitBranch, GitCommit, ShieldCheck, Database, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function VersionControl() {
  const versions = [
    { id: 'v1.2.4', date: '2026-03-19 10:30', author: 'Dr. Sarah Chen', message: 'Updated knowledge base with new quantum error correction papers.', type: 'update' },
    { id: 'v1.2.3', date: '2026-03-18 15:45', author: 'AI Agent', message: 'Auto-summarized experimental data from Lab Portal.', type: 'auto' },
    { id: 'v1.2.2', date: '2026-03-17 09:12', author: 'James Wilson', message: 'Initial workspace setup and member invitation.', type: 'setup' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 border border-zinc-800">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Version Management</h1>
            <p className="text-zinc-400">FAIR-compliant research data and document versioning.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {versions.map((v, idx) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all flex gap-6"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div className="w-px flex-1 bg-zinc-800 my-2" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-emerald-500 font-mono tracking-tighter">{v.id}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{v.date}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{v.message}</h3>
                <p className="text-xs text-zinc-500">Committed by <span className="text-zinc-300">{v.author}</span></p>
                <div className="mt-4 flex gap-2">
                  <button className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors uppercase font-bold tracking-widest">Restore</button>
                  <button className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors uppercase font-bold tracking-widest">Compare</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              FAIR Compliance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center text-xs font-bold">F</div>
                <span className="text-xs text-zinc-300">Findable: Metadata indexed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center text-xs font-bold">A</div>
                <span className="text-xs text-zinc-300">Accessible: Open protocols</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center text-xs font-bold">I</div>
                <span className="text-xs text-zinc-300">Interoperable: JSON-LD export</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center text-xs font-bold">R</div>
                <span className="text-xs text-zinc-300">Reusable: Provenance tracked</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Data Mirrors
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">Your research data is automatically mirrored to secure global nodes for redundancy.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>US-EAST-1</span>
                <span className="text-emerald-500">Syncing...</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>EU-WEST-2</span>
                <span className="text-emerald-500">Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
