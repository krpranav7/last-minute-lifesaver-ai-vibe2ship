import React from "react";
import { Clock, Briefcase, Sparkles, AlertCircle, Plus, Trash } from "lucide-react";
import { CalendarEvent, PlannedTask } from "../types";

interface CalendarTimelineProps {
  fixedEvents: CalendarEvent[];
  roadmap: PlannedTask[];
  activeTaskId: string | null;
  onSelectTask: (task: PlannedTask) => void;
  onAddEvent: () => void;
  onRemoveEvent: (id: string) => void;
}

export default function CalendarTimeline({
  fixedEvents,
  roadmap,
  activeTaskId,
  onSelectTask,
  onAddEvent,
  onRemoveEvent,
}: CalendarTimelineProps) {
  // Merge, sort, and display scheduled items chronologically
  const sortedItems = React.useMemo(() => {
    const list: Array<
      | { type: "event"; data: CalendarEvent; startNum: number }
      | { type: "task"; data: PlannedTask; startNum: number }
    > = [];

    fixedEvents.forEach((ev) => {
      const parts = ev.startTime.split(":");
      const startNum = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      list.push({ type: "event", data: ev, startNum });
    });

    roadmap.forEach((task) => {
      const parts = task.startTime.split(":");
      const startNum = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      list.push({ type: "task", data: task, startNum });
    });

    return list.sort((a, b) => a.startNum - b.startNum);
  }, [fixedEvents, roadmap]);

  return (
    <div id="calendarTimeline" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Today's Schedule Matrix</h3>
          <p className="text-xs text-slate-400">Fixed appointments & AI recommended work sprints</p>
        </div>
        <button
          id="addFixedEventBtn"
          onClick={onAddEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-full text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Constraint
        </button>
      </div>

      {sortedItems.length === 0 ? (
        <div id="emptySchedule" className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center">
          <Clock className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-400 text-sm font-medium">No appointments or tasks scheduled yet</p>
          <p className="text-xs text-slate-300 mt-1">Use the generator or add a constraints block above</p>
        </div>
      ) : (
        <div id="scheduleTimelineList" className="relative pl-6 border-l-2 border-slate-100 space-y-6">
          {sortedItems.map((item, index) => {
            if (item.type === "event") {
              const ev = item.data;
              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-slate-800 rounded-full border-4 border-white shadow-sm" />

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-slate-100/70">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-200/60 text-slate-600 mt-0.5">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Fixed Block</span>
                            <span className="inline-block px-1.5 py-0.5 bg-slate-200/50 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Constraint
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-700 mt-0.5">{ev.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {ev.startTime} - {ev.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`deleteEvent-${ev.id}`}
                        onClick={() => onRemoveEvent(ev.id)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Constraint"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              const task = item.data;
              const isSelected = activeTaskId === task.id;
              return (
                <div key={task.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${task.completed ? 'bg-emerald-500' : isSelected ? 'bg-blue-600 animate-pulse' : 'bg-blue-400'}`} />

                  <div
                    id={`taskBlock-${task.id}`}
                    onClick={() => onSelectTask(task)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border text-left ${
                      task.completed
                        ? "bg-emerald-50/50 border-emerald-100/50 opacity-80"
                        : isSelected
                        ? "bg-blue-50/80 border-blue-200/80 shadow-md shadow-blue-50"
                        : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${task.completed ? 'bg-emerald-100 text-emerald-600' : isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-500">Focus Session</span>
                            {task.completed ? (
                              <span className="inline-block px-1.5 py-0.5 bg-emerald-100 rounded text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                                Completed
                              </span>
                            ) : isSelected ? (
                              <span className="inline-block px-1.5 py-0.5 bg-blue-600 rounded text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
                                Focusing
                              </span>
                            ) : null}
                          </div>
                          <h4 className={`font-extrabold text-sm text-slate-800 mt-0.5 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed max-w-md">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {task.startTime} - {task.endTime} ({task.duration} min)
                            </span>
                          </div>
                        </div>
                      </div>

                      {!task.completed && !isSelected && (
                        <button
                          id={`startTask-${task.id}`}
                          className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap self-center"
                        >
                          Focus Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
