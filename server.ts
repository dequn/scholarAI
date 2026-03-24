import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database (In-memory for this prototype)
  const db = {
    workspaces: [
      {
        id: "ws-1",
        name: "Quantum Computing Research",
        role: "owner",
        papers: [],
        notes: [],
        skills: ["paper-summarizer", "data-analyzer"]
      }
    ],
    papers: [],
    skills: [
      { id: "paper-summarizer", name: "Paper Summarizer", description: "Extracts key findings from PDFs" },
      { id: "data-analyzer", name: "Data Analyzer", description: "Generates Python code for data visualization" },
      { id: "web-crawler", name: "Web Crawler", description: "Downloads data from specific research portals" }
    ]
  };

  // API Routes
  app.get("/api/workspaces", (req, res) => {
    res.json(db.workspaces);
  });

  app.post("/api/workspaces", (req, res) => {
    const newWs = {
      id: `ws-${Date.now()}`,
      ...req.body,
      papers: [],
      notes: [],
      skills: []
    };
    db.workspaces.push(newWs);
    res.json(newWs);
  });

  app.get("/api/skills", (req, res) => {
    res.json(db.skills);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
