import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Clock,
  Briefcase,
  AlertCircle,
  Plus,
  Trash,
  Bot,
  Zap,
  Flame,
  Calendar,
  Send,
  Loader2,
  ChevronRight,
  Layout,
  HelpCircle,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CalendarEvent, PlannedTask, ProactiveNudge, SchedulePlan } from "./types";
import FocusTimer from "./components/FocusTimer";
import CalendarTimeline from "./components/CalendarTimeline";
import EnergyCurveChart from "./components/EnergyCurveChart";
import AgentTerminal from "./components/AgentTerminal";
import NudgeModal from "./components/NudgeModal";

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Product Design Sync", startTime: "10:30", endTime: "11:30" },
  { id: "2", title: "Hackathon Pitch Prep", startTime: "14:00", endTime: "15:00" },
  { id: "3", title: "Vibe2Ship Final Panel", startTime: "16:30", endTime: "17:30" }
];

export default function App() {
  const [taskInput, setTaskInput] = useState("Drafting my 10-page strategy report for Friday");
  const [fixedEvents, setFixedEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentPlan, setCurrentPlan] = useState<SchedulePlan | null>(null);
  const [activeTask, setActiveTask] = useState<PlannedTask | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [activeNudge, setActiveNudge] = useState<ProactiveNudge | null>(null);

  // New fixed event form states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("09:00");
  const [newEventEnd, setNewEventEnd] = useState("10:00");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuildPlan = async () => {
    if (!taskInput.trim()) {
      alert("Please specify a goal or task!");
      return;
    }

    setIsLoading(true);
    setCurrentPlan(null);
    setActiveTask(null);
    setErrorMsg(null);

    // Get current local time
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskInput,
          currentTime: currentTimeStr,
          fixedEvents: fixedEvents
        })
      });

      if (!res.ok) {
        throw new Error("Failed to compile strategy roadmap from server.");
      }

      const data: SchedulePlan = await res.json();
      
      // Delay to allow AgentTerminal reasoning logs to display elegantly
      setTimeout(() => {
        setCurrentPlan(data);
        setIsLoading(false);

        // Auto-select first focus task
        if (data.roadmap && data.roadmap.length > 0) {
          setActiveTask(data.roadmap[0]);
        }

        // Trigger a proactive nudge after 4 seconds for maximum interactive effect
        if (data.nudges && data.nudges.length > 0) {
          setTimeout(() => {
            setActiveNudge(data.nudges[0]);
            setShowNudge(true);
          }, 3500);
        }
      }, 9500); // matching steps duration in AgentTerminal

    } catch (err: any) {
      console.error(err);
      setErrorMsg("An error occurred while compiling your strategy. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSelectTask = (task: PlannedTask) => {
    setActiveTask(task);
  };

  const handleCompleteTask = (taskId: string) => {
    if (!currentPlan) return;
    
    const updatedRoadmap = currentPlan.roadmap.map((t) =>
      t.id === taskId ? { ...t, completed: true } : t
    );

    setCurrentPlan({
      ...currentPlan,
      roadmap: updatedRoadmap
    });

    // Auto-select next incomplete task if any
    const nextIncomplete = updatedRoadmap.find((t) => !t.completed);
    if (nextIncomplete) {
      setActiveTask(nextIncomplete);
    } else {
      setActiveTask(null);
    }
  };

  const handleAcceptNudge = (nudge: ProactiveNudge) => {
    setShowNudge(false);
    if (!currentPlan) return;

    // Find the focus task matching the nudge suggested type or grab the first incomplete task
    const suggested = currentPlan.roadmap.find((t) => !t.completed);
    if (suggested) {
      setActiveTask(suggested);
      // Smooth scroll to focus engine section
      const target = document.getElementById("focus-engine-card");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAddFixedEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: newEventTitle,
      startTime: newEventStart,
      endTime: newEventEnd,
      isUserAdded: true
    };

    setFixedEvents([...fixedEvents, newEvent].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setNewEventTitle("");
    setShowAddEvent(false);
  };

  const handleRemoveFixedEvent = (id: string) => {
    setFixedEvents(fixedEvents.filter((ev) => ev.id !== id));
  };

  return (
    <div className="bg-slate-50 text-slate-950 font-sans min-h-screen selection:bg-blue-500 selection:text-white">
      
      {/* Nudge Popover */}
      <NudgeModal
        nudge={activeNudge}
        isOpen={showNudge}
        onClose={() => setShowNudge(false)}
        onAccept={handleAcceptNudge}
      />

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="text-xl md:text-2xl font-black text-blue-600 flex items-center gap-2 select-none">
          <Zap className="w-6 h-6 text-blue-600 fill-blue-500" />
          <span>LifeSaver AI</span>
        </div>
        <div className="hidden md:flex gap-10 font-bold text-slate-500 text-sm">
          <a href="#problem" className="hover:text-blue-600 transition-colors">The Problem</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Agent Features</a>
          <a href="#workspace" className="hover:text-blue-600 transition-colors">Workspace</a>
        </div>
        <a
          href="#workspace"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-600 active:scale-95 transition-all text-xs"
        >
          Launch Workspace
        </a>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-blue-600 to-indigo-700 text-white pt-24 pb-36 px-6 text-center overflow-hidden">
        {/* Glow rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/20"
          >
            <Bot className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Proactive Schedule Sync Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.05] tracking-tight"
          >
            Stop Missing Deadlines. <br />
            <span className="text-blue-100 font-light italic">Take Guided Action.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed"
          >
            An autonomous agentic companion that actively parses your calendar constraints, maps peak focus capacity, and prompts timely work sprints using Gemini.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a
              href="#workspace"
              className="bg-white text-blue-700 font-black py-4 px-8 rounded-2xl shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base flex items-center justify-center gap-2"
            >
              Enter Workspace
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#problem"
              className="border border-white/40 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-sm md:text-base"
            >
              Why Proactive planning?
            </a>
          </motion.div>
        </div>
      </header>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-6 max-w-6xl mx-auto -mt-16 bg-white rounded-[3rem] shadow-xl relative z-10 border border-slate-100">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-blue-600 font-black text-xs uppercase tracking-wider block mb-2">The core challenge</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">The Passive Reminder Trap</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Traditional tools wait for your system clocks to trigger static alarms. We work ahead of time, organizing deep focus zones around your daily life's constraints.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all">
            <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-2">Decision Fatigue</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We eliminate scheduling inertia by designating exactly what deep work sprint to start next based on hourly energy curves.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all">
            <div className="bg-indigo-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-2">Compounding Urgency</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Complex deliverables like strategy write-ups are automatically chunked and slotted across empty schedule gaps.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all">
            <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-2">Proactive Nudges</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Timely, context-aware action triggers pop up to mobilize you, avoiding last-minute panic or missed blocks.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-blue-600 font-black text-xs uppercase tracking-wider block mb-2">Engine highlights</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">Designed For Real-Time Action</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Integrating advanced reasoning models to deliver high-fidelity structured roadmaps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Constraint-Based Slicing</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We schedule focused sprints dynamically within empty slots inside your existing schedule blocks—safeguarding meetings.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Gemini AI Formulation</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Utilizes structured schema specifications to generate precise times, phases, and direct action items with 100% data fidelity.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">Calming Breathe Loop</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our interactive Focus Timer incorporates a custom sinusoidal respiratory guide to keep you grounded during intensive sprints.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[2.5rem] p-8 border border-slate-700/40 relative shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-center">
            <div className="absolute right-0 top-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <h4 className="text-white font-extrabold text-xl mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              AI Reasoning Blueprint
            </h4>
            <div className="space-y-3 font-mono text-[11px] text-slate-400">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold">Input:</span> "Have a slides draft due by 6 PM"
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold">Constraints:</span> [10:30 Sync, 14:00 Pitch Prep]
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">Output:</span> Dynamic chunks scheduled 11:30 - 13:00, with proactive check-ins mapped at 13:50.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace App Section */}
      <section id="workspace" className="py-24 px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-blue-600 font-black text-xs uppercase tracking-wider block mb-2">Interactive Dashboard</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">Launch Your Agent Workspace</h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Add your calendar restrictions for today, insert your primary task objective, and hit Build AI Plan to watch the agent trace constraints.
            </p>
          </div>

          {/* Grid Panel for Controls */}
          <div className="grid lg:grid-cols-12 gap-8 items-start mb-8">
            
            {/* Left Hand Controls Side (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Daily Constraints Panel */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-slate-800 text-base">Schedule Restrictions</h3>
                  </div>
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-bold text-slate-500">
                    {fixedEvents.length} Active
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
                  These represent your immutable fixed meetings, lectures, or classes today. The AI will completely avoid scheduling focus zones here.
                </p>

                {/* Constraints List */}
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-1">
                  {fixedEvents.map((ev) => (
                    <div key={ev.id} className="flex justify-between items-center bg-slate-50/70 hover:bg-slate-50 p-3 rounded-2xl border border-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-700">{ev.title}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>
                      </div>
                      <button
                        id={`removeEventBtn-${ev.id}`}
                        onClick={() => handleRemoveFixedEvent(ev.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-all"
                        title="Delete restriction"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Event Form Toggle */}
                {!showAddEvent ? (
                  <button
                    id="openAddConstraintBtn"
                    onClick={() => setShowAddEvent(true)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Restriction Block
                  </button>
                ) : (
                  <form onSubmit={handleAddFixedEvent} className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Restriction Title</label>
                      <input
                        id="newConstraintTitle"
                        type="text"
                        placeholder="e.g., Biology Seminar"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Start Time</label>
                        <input
                          id="newConstraintStart"
                          type="time"
                          value={newEventStart}
                          onChange={(e) => setNewEventStart(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">End Time</label>
                        <input
                          id="newConstraintEnd"
                          type="time"
                          value={newEventEnd}
                          onChange={(e) => setNewEventEnd(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        id="saveConstraintBtn"
                        type="submit"
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all"
                      >
                        Save Block
                      </button>
                      <button
                        id="cancelConstraintBtn"
                        type="button"
                        onClick={() => setShowAddEvent(false)}
                        className="flex-1 py-2 bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Task Goal Input Area */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">Primary Goal Target</h3>
                </div>

                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">What are you delivering today?</label>
                <textarea
                  id="goalTextarea"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g. 'I need to write and proofread my 10-page slides deck before Friday'"
                  className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-slate-800 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none mb-4 text-xs font-semibold leading-relaxed"
                />

                <button
                  id="buildStrategyBtn"
                  onClick={handleBuildPlan}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-all active:scale-[0.98] shadow-lg shadow-blue-200 text-sm flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Strategy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Build AI Strategic Plan
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Hand Output Panel (7 Cols) */}
            <div className="lg:col-span-7 h-full">
              
              {/* Fallback Error message */}
              {errorMsg && (
                <div id="workspaceError" className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  {errorMsg}
                </div>
              )}

              {/* Loading States */}
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loadingTrace"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="py-12"
                  >
                    <AgentTerminal isLoading={isLoading} />
                  </motion.div>
                )}

                {/* Empty State / Standby Screen */}
                {!isLoading && !currentPlan && (
                  <motion.div
                    key="emptyWorkspace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-[2.5rem] border border-slate-200/60 p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm"
                  >
                    <div className="p-4 bg-slate-50 rounded-full border border-slate-100 mb-4 animate-bounce">
                      <Bot className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Focus Engine Standby</h3>
                    <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-sm font-medium leading-relaxed">
                      Enter your day's goal and schedule parameters on the left, then click Build AI Strategic Plan to construct a high-fidelity productivity timeline.
                    </p>
                    
                    {/* Demo trigger helper */}
                    <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl max-w-xs">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Quick trial demo</span>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        We've seeded a sample task and fixed calendar restraints for you. Just click the button to try out!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Results Workspace dashboard (Grid Layout) */}
                {!isLoading && currentPlan && (
                  <motion.div
                    key="planResults"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Top Focus Timer Module */}
                    <div id="focus-engine-card">
                      <FocusTimer
                        task={activeTask}
                        onComplete={handleCompleteTask}
                      />
                    </div>

                    {/* Timeline Module */}
                    <div>
                      <CalendarTimeline
                        fixedEvents={fixedEvents}
                        roadmap={currentPlan.roadmap}
                        activeTaskId={activeTask ? activeTask.id : null}
                        onSelectTask={handleSelectTask}
                        onAddEvent={() => setShowAddEvent(true)}
                        onRemoveEvent={handleRemoveFixedEvent}
                      />
                    </div>

                    {/* Split Bento Row: Insights & Cognitive curve */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Cognitive Energy Curve Chart */}
                      <EnergyCurveChart data={currentPlan.focusLevelCurve} />

                      {/* Strategic Insights */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            AI Strategy Insights
                          </h3>
                          <ul className="space-y-3">
                            {currentPlan.insights.map((insight, idx) => (
                              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-500 font-medium leading-relaxed">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-blue-600">
                          <span>Proactive Status: Syncing</span>
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-12 px-6 text-center text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="text-white font-extrabold text-base flex items-center justify-center gap-1.5">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500 animate-pulse" />
            <span>LifeSaver AI</span>
          </div>
          <p>Autonomous scheduling companion leveraging Gemini reasoning APIs.</p>
          <p className="opacity-60">&copy; 2026 LifeSaver AI | Built with care for Vibe2Ship Hackathon 2026</p>
        </div>
      </footer>

    </div>
  );
}
