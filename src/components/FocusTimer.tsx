import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Brain, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlannedTask } from "../types";

interface FocusTimerProps {
  task: PlannedTask | null;
  onComplete: (taskId: string) => void;
}

export default function FocusTimer({ task, onComplete }: FocusTimerProps) {
  const initialDuration = task ? task.duration * 60 : 25 * 60; // default 25 min if no task
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathingText, setBreathingText] = useState("Inhale...");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if active task changes
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(task ? task.duration * 60 : 25 * 60);
  }, [task]);

  // Breathing loop animation text
  useEffect(() => {
    if (!isBreathingMode) return;
    let breathCount = 0;
    const interval = setInterval(() => {
      breathCount++;
      if (breathCount % 3 === 1) {
        setBreathingText("Inhale...");
      } else if (breathCount % 3 === 2) {
        setBreathingText("Hold...");
      } else {
        setBreathingText("Exhale...");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isBreathingMode]);

  // Timer countdown hook
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (task) {
        onComplete(task.id);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft, task, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(task ? task.duration * 60 : 25 * 60);
  };

  const forceComplete = () => {
    setIsActive(false);
    setTimeLeft(0);
    if (task) {
      onComplete(task.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const percentage = task ? (timeLeft / (task.duration * 60)) * 100 : (timeLeft / (25 * 60)) * 100;

  return (
    <div id="focusTimerContainer" className="bg-slate-900 text-white rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[480px]">
      
      {/* Dynamic star/glow accents */}
      <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-black tracking-wider text-slate-400 uppercase">Interactive Focus Engine</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-300">Peak Zone</span>
        </div>
      </div>

      {/* Timer Circle & Core display */}
      <div className="flex flex-col items-center justify-center py-6 z-10">
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
          
          {/* Svg countdown circle ring */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-800 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-blue-500 fill-none transition-all duration-300"
              strokeWidth="6"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * (100 - percentage)) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Breathing expanding circle guide inside */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                key="breathingRing"
                animate={isBreathingMode ? {
                  scale: [0.85, 1.15, 0.85],
                  opacity: [0.15, 0.45, 0.15]
                } : {
                  scale: [0.95, 1.02, 0.95],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: isBreathingMode ? 8 : 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-36 h-36 md:w-42 md:h-42 bg-blue-500 rounded-full"
              />
            )}
          </AnimatePresence>

          {/* Time display */}
          <div className="text-center z-20 flex flex-col items-center">
            {isBreathingMode ? (
              <motion.div
                key={breathingText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-base font-bold text-blue-300"
              >
                {breathingText}
              </motion.div>
            ) : (
              <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white select-none">
                {formatTime(timeLeft)}
              </span>
            )}
            <span className="text-xs text-slate-400 font-semibold mt-1">
              {isActive ? (isBreathingMode ? "Breathing Sync" : "Focusing...") : "Paused"}
            </span>
          </div>
        </div>

        {/* Currently running task brief */}
        <div className="text-center mt-4 px-4 max-w-sm">
          <h3 className="font-extrabold text-sm md:text-base text-slate-100 line-clamp-1">
            {task ? task.title : "Unscheduled Quick Sprint"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {task ? task.description : "Free session with automated breathing guide to boost task flow."}
          </p>
        </div>
      </div>

      {/* Controls panel */}
      <div className="space-y-4 z-10">
        <div className="flex justify-center items-center gap-4">
          <button
            id="resetTimerBtn"
            onClick={resetTimer}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/50 active:scale-90 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="playPauseBtn"
            onClick={toggleTimer}
            className={`p-4 md:p-5 rounded-full ${isActive ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'} text-white active:scale-95 transition-all shadow-xl shadow-blue-500/15`}
          >
            {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
          </button>

          <button
            id="forceCompleteBtn"
            onClick={forceComplete}
            disabled={timeLeft === 0}
            className="p-3 rounded-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Mark Completed"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Breathing toggle button */}
        <div className="flex justify-center">
          <button
            id="breathingSyncToggle"
            onClick={() => setIsBreathingMode(!isBreathingMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
              isBreathingMode
                ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
                : "bg-slate-800/40 text-slate-400 border-slate-700/40 hover:bg-slate-800"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            {isBreathingMode ? "Disable Breathing Sync" : "Enable Breathing Sync"}
          </button>
        </div>
      </div>
    </div>
  );
}
