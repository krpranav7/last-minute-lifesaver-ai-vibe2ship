import React, { useState, useEffect } from "react";
import { Terminal, Bot, Sparkles, CheckCircle, CircleDot } from "lucide-react";
import { motion } from "motion/react";

interface AgentTerminalProps {
  isLoading: boolean;
}

const STEPS = [
  "Initializing LifeSaver Core Agent...",
  "Parsing calendar boundaries & fixed constraints...",
  "Consulting Gemini reasoning models (gemini-3.5-flash)...",
  "Calculating hourly cognitive peak focus index...",
  "Formatting bite-sized deep-work roadmap intervals...",
  "Generating proactive micro-nudges..."
];

export default function AgentTerminal({ isLoading }: AgentTerminalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setLogs([]);
      setCurrentStep(0);
      return;
    }

    setLogs([STEPS[0]]);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < STEPS.length) {
          setLogs((l) => [...l, STEPS[next]]);
          return next;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div id="agentTerminal" className="bg-slate-950 text-slate-300 rounded-3xl p-6 font-mono text-xs border border-slate-800 shadow-xl max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-400">Agent Reasoning Trace</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
          <div className="w-2.5 h-2.5 bg-amber-500/80 rounded-full" />
          <div className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
        </div>
      </div>

      <div className="space-y-3 min-h-[160px] flex flex-col justify-end">
        {logs.map((log, idx) => {
          const isLast = idx === logs.length - 1;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2"
            >
              {isLast && currentStep < STEPS.length - 1 ? (
                <CircleDot className="w-3.5 h-3.5 text-blue-400 animate-pulse mt-0.5 shrink-0" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              )}
              <span className={isLast ? "text-blue-200 font-bold" : "text-slate-400"}>
                {log}
              </span>
            </motion.div>
          );
        })}

        {currentStep < STEPS.length - 1 && (
          <div className="flex items-center gap-1.5 text-slate-500 italic mt-2 animate-pulse">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="text-[10px] ml-1">Computing best schedule intervals...</span>
          </div>
        )}
      </div>
    </div>
  );
}
