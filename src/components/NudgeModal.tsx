import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Bot, Sparkles, X } from "lucide-react";
import { ProactiveNudge } from "../types";

interface NudgeModalProps {
  nudge: ProactiveNudge | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (nudge: ProactiveNudge) => void;
}

export default function NudgeModal({ nudge, isOpen, onClose, onAccept }: NudgeModalProps) {
  if (!isOpen || !nudge) return null;

  const getIcon = () => {
    switch (nudge.type) {
      case 'focus':
        return <Sparkles className="w-6 h-6 text-indigo-600" />;
      case 'break':
        return <Bot className="w-6 h-6 text-emerald-600" />;
      case 'deadline':
        return <Bell className="w-6 h-6 text-rose-600" />;
      default:
        return <Bot className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBg = () => {
    switch (nudge.type) {
      case 'focus':
        return 'bg-indigo-50 border-indigo-100';
      case 'break':
        return 'bg-emerald-50 border-emerald-100';
      case 'deadline':
        return 'bg-rose-50 border-rose-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <AnimatePresence>
      <div id="nudgeModalOverlay" className="fixed inset-0 bg-slate-950/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
          id="nudgeModalBody"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden"
        >
          {/* Decorative ambient background element */}
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <button
            id="closeNudgeBtn"
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl border ${getBg()} flex items-center justify-center`}>
              {getIcon()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Proactive Nudge</span>
              <h3 className="font-extrabold text-lg text-slate-800 leading-tight">LifeSaver AI Recommendation</h3>
            </div>
          </div>

          <p className="text-slate-600 mb-6 text-sm md:text-base leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
            "{nudge.message}"
          </p>

          <div className="flex gap-3">
            <button
              id="nudgeAcceptBtn"
              onClick={() => onAccept(nudge)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 text-sm"
            >
              {nudge.actionLabel || "Accept"}
            </button>
            <button
              id="nudgeDeclineBtn"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 py-3 px-4 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
            >
              Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
