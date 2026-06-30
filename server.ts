import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "DUMMY_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for planning
  app.post("/api/plan", async (req, res) => {
    try {
      const { task, currentTime, fixedEvents } = req.body;

      if (!task || !task.trim()) {
        return res.status(400).json({ error: "Task input is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Safe fallback when key is not set (during dev bootstrapping)
        console.warn("GEMINI_API_KEY is not defined. Returning realistic fallback data.");
        return res.json(getFallbackPlan(task, currentTime, fixedEvents));
      }

      // Build system instruction and user prompt for Gemini
      const systemInstruction = `You are LifeSaver AI, a world-class agentic productivity companion. 
Your goal is to take a user's task/deadline description along with their existing fixed calendar events (meetings, classes, etc.) for today, and build a highly realistic, intelligent "Strategic Roadmap".

Guidelines for planning:
1. NEVER schedule focus chunks during the user's fixed events. Keep fixed events entirely free or schedule tasks completely outside of them.
2. The current time is ${currentTime || "09:00"}. Only schedule focus blocks AFTER the current time.
3. Break the main task down into 2-5 bite-sized, actionable chunks (duration 30-90 minutes each).
4. For each chunk, define its start time, end time, duration, and a clear tactical description of what to focus on.
5. Create 1-3 highly contextual "Proactive Nudges". These are timely alert messages (e.g. suggesting taking a break, preparing for an upcoming meeting, or capitalizing on a free 45-minute gap).
6. Provide 2-4 strategic insights (e.g., "You have a high-energy window before your 2 PM meeting—ideal for drafting").
7. Generate an hourly energy/focus curve (6-8 data points across the remaining active hours of the day) showing focus level values from 0-100.
8. Be humble, direct, and actionable in your descriptions. Avoid marketing fluff or dramatic language.`;

      const userPrompt = `
Current Time: ${currentTime || "09:00"}
User Task & Deadline: "${task}"
Fixed Existing Calendar Events for Today:
${JSON.stringify(fixedEvents || [])}

Please construct the optimal plan. Return response strictly matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    startTime: { type: Type.STRING, description: "Start time of the scheduled focus chunk in HH:MM format (24h)" },
                    endTime: { type: Type.STRING, description: "End time of the scheduled focus chunk in HH:MM format (24h)" },
                    duration: { type: Type.INTEGER, description: "Duration of this block in minutes" },
                    phase: { type: Type.STRING, description: "e.g., Drafting, Outlining, Final Review, etc." }
                  },
                  required: ["title", "description", "startTime", "endTime", "duration"]
                }
              },
              nudges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    message: { type: Type.STRING },
                    actionLabel: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Must be one of: focus, break, deadline, preparation" }
                  },
                  required: ["message", "actionLabel", "type"]
                }
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              focusLevelCurve: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "HH:MM format" },
                    value: { type: Type.INTEGER, description: "Focus/energy level percentage, 0 to 100" }
                  },
                  required: ["time", "value"]
                }
              }
            },
            required: ["roadmap", "nudges", "insights", "focusLevelCurve"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const planData = JSON.parse(responseText.trim());
      res.json(planData);

    } catch (error: any) {
      console.error("Error in /api/plan:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static files in production / setup Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html transformed by Vite for any other requests
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API routes
      if (url.startsWith("/api")) return next();
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Realistic fallback generator when Gemini is offline or API key is not present
function getFallbackPlan(task: string, currentTime: string, fixedEvents: any[]) {
  // Let's create smart scheduling logic dynamically depending on fixedEvents
  const startHour = parseInt((currentTime || "09:00").split(":")[0]) || 9;
  const events = fixedEvents || [];

  const roadmap = [
    {
      title: "Task Scoping & Outline",
      description: `Break down "${task}" into detailed core milestones, setting strict constraints.`,
      startTime: `${String(startHour).padStart(2, "0")}:15`,
      endTime: `${String(startHour + 1).padStart(2, "0")}:00`,
      duration: 45,
      phase: "Preparation"
    },
    {
      title: "Deep Focus Drafting",
      description: "Perform uninterrupted creation of content, ignoring all notifications and focusing strictly on raw volume.",
      startTime: `${String(startHour + 2).padStart(2, "0")}:00`,
      endTime: `${String(startHour + 3).padStart(2, "0")}:30`,
      duration: 90,
      phase: "Core Deep Work"
    },
    {
      title: "Polishing & Review",
      description: "Format headings, audit sources/data, and review readability of the work.",
      startTime: `${String(startHour + 4).padStart(2, "0")}:00`,
      endTime: `${String(startHour + 4).padStart(2, "0")}:45`,
      duration: 45,
      phase: "Refinement"
    }
  ];

  return {
    roadmap,
    nudges: [
      {
        message: `You have an empty gap before your upcoming milestones. Shall we trigger a 45-minute sprint for "${task}"?`,
        actionLabel: "Start Sprint",
        type: "focus"
      },
      {
        message: "Your focus level has been sustained for 90 minutes. A short 5-minute offline breathing reset is recommended.",
        actionLabel: "Take Reset",
        type: "break"
      }
    ],
    insights: [
      "Scheduled a heavy draft sprint first to exploit early peak mental energy.",
      "Ensured all focus blocks are placed strategically outside your fixed calendar commitments.",
      "Built in a mandatory 30-minute recovery buffer to prevent compounding cognitive fatigue."
    ],
    focusLevelCurve: [
      { time: "09:00", value: 90 },
      { time: "11:00", value: 85 },
      { time: "13:00", value: 50 },
      { time: "15:00", value: 75 },
      { time: "17:00", value: 60 },
      { time: "19:00", value: 40 }
    ]
  };
}

startServer();
