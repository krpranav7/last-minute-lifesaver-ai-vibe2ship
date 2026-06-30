import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Zap, Activity } from "lucide-react";

interface EnergyCurveChartProps {
  data: { time: string; value: number }[];
}

export default function EnergyCurveChart({ data }: EnergyCurveChartProps) {
  if (!data || data.length === 0) {
    return (
      <div id="emptyChart" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-center h-48">
        <p className="text-slate-400 text-sm font-medium">Generate a plan to see focus prediction levels</p>
      </div>
    );
  }

  // Find peak time
  const peakPoint = [...data].sort((a, b) => b.value - a.value)[0];

  return (
    <div id="energyChartContainer" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-100" />
            Cognitive Focus Curve
          </h3>
          <p className="text-xs text-slate-400">Predicted mental resource level based on schedule load</p>
        </div>
        {peakPoint && (
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Peak Mental Zone</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {peakPoint.time} ({peakPoint.value}% Focus)
            </span>
          </div>
        )}
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={600}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={600}
              tickCount={3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "16px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any) => [`${value}% Cognitive Focus`, "Focus"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFocus)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 font-medium">
        <Activity className="w-3.5 h-3.5 text-blue-500" />
        <span>Ideal focus windows are mapped to intervals above 70% capacity.</span>
      </div>
    </div>
  );
}
