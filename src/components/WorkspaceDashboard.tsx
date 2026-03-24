import React from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  Plus, 
  MoreHorizontal,
  ArrowUpRight,
  Activity,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

export default function WorkspaceDashboard({ workspace }: { workspace: any }) {
  const stats = [
    { label: 'Total Papers', value: workspace.papers.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Contributors', value: workspace.members.length, icon: Users, color: 'text-emerald-500' },
    { label: 'Research Notes', value: workspace.notes.length, icon: Activity, color: 'text-purple-500' },
    { label: 'Active Skills', value: workspace.skills.length, icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Project</span>
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{workspace.name}</h1>
          <p className="text-zinc-400 mt-2">{workspace.description}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Invite
          </button>
          <button className="bg-emerald-500 text-black px-6 py-2 rounded-xl font-semibold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <Calendar className="w-4 h-4" />
            Schedule Sync
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-zinc-800 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <button className="text-zinc-600 hover:text-zinc-400">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Project Timeline</h2>
            <button className="text-xs text-emerald-500 hover:underline font-medium">View Full History</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                  <div className="w-px flex-1 bg-zinc-800 my-2" />
                </div>
                <div className="flex-1 bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl group-hover:border-zinc-700 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">2 hours ago</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase">AI Summary</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-bold text-white">ScholarSphere AI</span> automatically summarized 3 new papers added to the knowledge base.
                  </p>
                  <button className="mt-3 text-xs flex items-center gap-1 text-emerald-500 hover:underline">
                    Read Summary <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team & Roles */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Research Team</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="space-y-6">
              {workspace.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-xs text-zinc-500">{member.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                    member.role === 'owner' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all">
              Manage Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
