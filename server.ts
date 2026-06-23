import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

dotenv.config();

/**
 * Initialize the official @google/genai core client.
 * Using process.env.GEMINI_API_KEY, which is supplied by AI Studio UI.
 */
const apiKey = process.env.GEMINI_API_KEY;

// Check if credentials are present lazily
const getAiClient = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from the environment variables. Please configure secrets.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Create uploads folder if not exists
  const UPLOADS_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Set up static files for uploads before other middlewares
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Configure multer disk storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for local tests
    }
  });

  // Local JSON Database path
  const MOVIES_DB_PATH = path.join(UPLOADS_DIR, "movies.json");

  // Initial Seed Movies
  const INITIAL_MOVIES = [
    {
      id: "m-1",
      title: "Eko Midnight",
      director: "Kemi Adesua",
      synopsis: "A stylish, fast-paced crime thriller set in the underbelly of Lagos. A compromised inspector has 12 hours to locate a missing governor's driver before the cartels claim the streets.",
      genre: "Noir Thriller",
      releaseYear: 2026,
      duration: "1h 58m",
      priceNGN: 2500,
      posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
      trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-reflected-on-water-43330-large.mp4",
      published: true,
      rating: "18+"
    },
    {
      id: "m-2",
      title: "The Whispering Palms",
      director: "Tunde Alabi",
      synopsis: "A breathtaking indie romance set along the serene beaches of Badagry, tracing the deep-seated historical secrets that bind two star-crossed lovers from competing luxury resort families.",
      genre: "Romantic Drama",
      releaseYear: 2025,
      duration: "2h 05m",
      priceNGN: 1800,
      posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-gentle-ocean-waves-on-a-sandy-beach-23362-large.mp4",
      published: true,
      rating: "13+"
    },
    {
      id: "m-3",
      title: "Onyeka's Legacy",
      director: "Chidi Nwabueze",
      synopsis: "A powerful historical epic chronicling the resilient women of Southeastern Nigeria during the palm oil trade wars. Masterful cinematography, authentic traditional scores, and award-winning performances.",
      genre: "Historical Epic",
      releaseYear: 2026,
      duration: "2h 22m",
      priceNGN: 3500,
      posterUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1eae?auto=format&fit=crop&w=600&q=80",
      trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-the-forest-41131-large.mp4",
      published: true,
      rating: "16+"
    },
    {
      id: "m-4",
      title: "Lagos Runway",
      director: "Yinka Balogun",
      synopsis: "A high-fashion satire highlighting the cutthroat world of design, vanity, and high-society sabotage in modern Victoria Island. A witty look into Nigeria's ultra-wealthy creative ecosystem.",
      genre: "Comedy Drama",
      releaseYear: 2026,
      duration: "1h 45m",
      priceNGN: 1500,
      posterUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
      trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-fashionable-clothes-in-studio-34282-large.mp4",
      published: true,
      rating: "PG"
    },
    {
      id: "m-5",
      title: "Shadows of the Dunes",
      director: "Mustapha Musa",
      synopsis: "An elegant, slowly-unraveling Northern Nigerian mystery focusing on an archaeologist who discovers pre-colonial metalworks near Kano, triggering a clash with powerful land-developers.",
      genre: "Mystery",
      releaseYear: 2025,
      duration: "1h 50m",
      priceNGN: 2000,
      posterUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80",
      trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-desert-landscape-with-sand-dunes-under-sunlight-41221-large.mp4",
      published: false,
      rating: "PG-13"
    }
  ];

  function readUploadedMovies() {
    try {
      if (fs.existsSync(MOVIES_DB_PATH)) {
        const raw = fs.readFileSync(MOVIES_DB_PATH, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error reading movies DB:", err);
    }
    return [];
  }

  function saveUploadedMovies(movies: any[]) {
    try {
      fs.writeFileSync(MOVIES_DB_PATH, JSON.stringify(movies, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing movies DB:", err);
    }
  }

  // Log active routes
  console.log("CINNETemple Fullstack Server starting on port:", PORT);

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      apiKeyConfigured: !!apiKey,
      timestamp: new Date().toISOString()
    });
  });

  // Movies API routes
  app.get("/api/movies", (req, res) => {
    try {
      const movies = readUploadedMovies();
      res.json(movies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/movies/upload", upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "posterFile", maxCount: 1 }
  ]), (req, res) => {
    try {
      const { title, director, synopsis, genre, duration, rating, priceNGN } = req.body;
      if (!title || !director) {
        return res.status(400).json({ error: "Title and Director are required fields." });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const videoFile = files?.["videoFile"]?.[0];
      const posterFile = files?.["posterFile"]?.[0];

      let videoUrl = "";
      if (videoFile) {
        videoUrl = `/uploads/${videoFile.filename}`;
      }

      let posterUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80";
      if (posterFile) {
        posterUrl = `/uploads/${posterFile.filename}`;
      } else if (req.body.posterUrl) {
        posterUrl = req.body.posterUrl;
      }

      const newMovie = {
        id: "m-" + Math.random().toString(36).substring(2, 6),
        title,
        director,
        synopsis: synopsis || "",
        genre: genre || "Action Thriller",
        releaseYear: new Date().getFullYear(),
        duration: duration || "2h 00m",
        priceNGN: Number(priceNGN) || 2000,
        posterUrl,
        trailerUrl: videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-reflected-on-water-43330-large.mp4",
        videoUrl: videoUrl,
        published: true,
        rating: rating || "18+"
      };

      const movies = readUploadedMovies();
      movies.push(newMovie);
      saveUploadedMovies(movies);

      res.status(201).json(newMovie);
    } catch (error: any) {
      console.error("Error in upload movie route:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/movies/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updatedMovieData = req.body;
      const movies = readUploadedMovies();
      const index = movies.findIndex((m: any) => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Movie not found" });
      }

      movies[index] = { ...movies[index], ...updatedMovieData };
      saveUploadedMovies(movies);
      res.json(movies[index]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/movies/:id", (req, res) => {
    try {
      const { id } = req.params;
      const movies = readUploadedMovies();
      const filtered = movies.filter((m: any) => m.id !== id);
      saveUploadedMovies(filtered);
      res.json({ success: true, message: "Movie deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 1. Generate UGC Script using Gemini 3.5 Flash
  app.post("/api/generate-ugc-script", async (req, res) => {
    try {
      const { movieTitle, creatorName, stylePreset, promptNote } = req.body;
      const ai = getAiClient();

      const stylePrompts: Record<string, string> = {
        hyper_hype: "Extremely high energy, TikTok speedrunner, viral hooks, dynamic vocal gestures, lots of 'OMG guys' style.",
        emotional: "Heartfelt, dramatic, close-up, sincere story-centric Nollywood enthusiast sharing a deeply moving cinematic experience.",
        analytical_critic: "Professional film critic style, high-level vocabulary, comparing cinematic choices, soundscapes, lighting, and performance depth.",
        funny_relatable: "Humorous, street-smart Naija dialect jokes, laughing about relatable movie characters, highly interactive with audience comment simulation."
      };

      const styleGuide = stylePrompts[stylePreset] || stylePrompts.hyper_hype;

      const systemPrompt = `You are the viral marketing engine for CINNETemple, a premium pay-per-view African/Nollywood browser cinema.
Your task is to write a highly compelling, authentic UGC (User Generated Content) video script promoting a movie on CINNETemple.
Keep the script snappy, formatted clearly with:
- Visual Cues: e.g. [Visual: holding phone, smiling at camera]
- Dialogue: Written in a natural, spoken-word cadence (including casual Naija conversational slang if appropriate like 'chei', 'no cap', 'walahi', 'abeg' based on style).
- Call-to-Action: Directing viewers on how they can buy a single-view ticket from ₦500 and stream immediately — no monthly subscription fatigue!`;

      const promptText = `
User Film Title: "${movieTitle || "Nollywood Blockbuster"}"
UGC Creator Name: "${creatorName || "Nollywood Fan"}"
Style Vibe: ${styleGuide}
Extra Context: "${promptNote || "No monthly subscription trap, buy ticket watch once easily."}"

Please output a JSON structure with the following properties:
{
  "hook": "An attention grabbing 1-sentence opening hook",
  "scriptLines": [
    { "speaker": "Creator", "text": "Dialogue line...", "action": "Visual/gestural action guidance" }
  ],
  "estimatedDurationSec": 30,
  "suggestedVideoPrompt": "A highly detailed visual prompt for a video generator like Veo representing the vibe of the trailer/promo."
}
Make sure you respond ONLY with pure valid JSON. No markdown code wraps like \`\`\`json. Just the raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Error in generate-ugc-script:", error);
      res.status(500).json({ error: error.message || "Script generation failed" });
    }
  });

  // 2. Start Veo Video Generation (Post Pattern)
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, aspectRatio, resolution } = req.body;
      const ai = getAiClient();

      console.log(`[Veo API] Initiating generation. Prompt: "${prompt}" | Ratio: ${aspectRatio} | Res: ${resolution}`);

      // Using the user-specified model: "veo-3.1-fast-generate-preview"
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A wide cinematic atmospheric shot of a premium Lagos art-deco cinema sunset glow',
        config: {
          numberOfVideos: 1,
          resolution: resolution === '1080p' ? '1080p' : '720p',
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
        }
      });

      console.log(`[Veo API] Operation generated successfully:`, operation.name);

      res.json({
        operationName: operation.name,
        status: "queued"
      });
    } catch (error: any) {
      console.error("Error in generate-video:", error);
      res.status(500).json({ error: error.message || "Video generation failed to trigger" });
    }
  });

  // 3. Status Poll Endpoint
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      const ai = getAiClient();

      // Reconstruct operation from operationName
      const op = new GenerateVideosOperation();
      op.name = operationName;

      console.log(`[Veo API] Polling status for: ${operationName}`);
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: updated.done || false,
        error: updated.error || null,
        response: updated.response || null
      });
    } catch (error: any) {
      console.error("Error in video-status:", error);
      res.status(500).json({ error: error.message || "Failed to poll video status" });
    }
  });

  // 4. Download and Proxy Streaming Video Endpoint (supports GET with query parameter)
  app.get("/api/video-download", async (req, res) => {
    try {
      const operationName = req.query.operationName as string;
      if (!operationName) {
        return res.status(400).send("Parameter operationName is required");
      }

      console.log(`[Veo API] Initiating stream proxy for operation: ${operationName}`);
      const ai = getAiClient();

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).send("Video URI not available yet or operation failed.");
      }

      console.log(`[Veo API] Resolved Google storage URI: ${uri}. Fetching video with headers...`);

      // Fetch from google storage with api key header
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey || '' },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video stream from storage: ${videoRes.statusText}`);
      }

      const arrayBuffer = await videoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error: any) {
      console.error("Error in video-download:", error);
      res.status(500).send("Video download proxy failed: " + error.message);
    }
  });

  // Vite development vs production asset delivery
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
    console.log(`CINNETemple live on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
