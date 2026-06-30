export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" 24h format
  isUserAdded?: boolean;
}

export interface PlannedTask {
  id: string;
  title: string;
  description: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  duration: number;  // in minutes
  completed: boolean;
  phase?: string;
}

export interface ProactiveNudge {
  id: string;
  message: string;
  suggestedTaskId?: string;
  actionLabel: string;
  type: 'focus' | 'break' | 'deadline' | 'preparation';
}

export interface SchedulePlan {
  roadmap: PlannedTask[];
  nudges: ProactiveNudge[];
  insights: string[];
  focusLevelCurve: { time: string; value: number }[]; // for recharts or visual graph
}
