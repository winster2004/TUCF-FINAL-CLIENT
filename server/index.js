import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import crypto from "crypto";
import { analyzeResumeAgainstJob } from "./modules/atsScorer.js";
import { parseResumeSections } from "./modules/ats/sectionParser.js";
import { generatePortfolioPage } from "./modules/portfolioGenerator.js";

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const resumeStore = new Map();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/ats/parse", upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Resume PDF is required." });
    }

    if (!file.mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Only PDF resumes are supported." });
    }

    const parsed = await pdfParse(file.buffer);
    const resumeText = parsed.text || "";
    const sections = parseResumeSections(resumeText);

    return res.json({
      resumeText,
      sections: Object.fromEntries(
        Object.entries(sections).map(([key, value]) => [
          key,
          {
            preview: value.lines.slice(0, 4),
            wordCount: value.wordCount,
          },
        ]),
      ),
      totals: {
        resumeWordCount: resumeText.trim()
          ? resumeText.trim().split(/\s+/).length
          : 0,
      },
    });
  } catch (error) {
    console.error("ATS resume parse failed:", error);
    return res.status(500).json({ error: "Failed to parse resume." });
  }
});

app.post("/api/ats/score", upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jobDescription;

    if (!file) {
      return res.status(400).json({ error: "Resume PDF is required." });
    }

    if (!file.mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Only PDF resumes are supported." });
    }

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }

    const parsed = await pdfParse(file.buffer);
    const resumeText = parsed.text || "";

    if (!resumeText.trim()) {
      return res
        .status(400)
        .json({ error: "Could not read text from the PDF resume." });
    }

    const analysis = await analyzeResumeAgainstJob(resumeText, jobDescription);
    return res.json(analysis);
  } catch (error) {
    console.error("ATS scoring failed:", error);
    return res.status(500).json({ error: "Failed to analyze resume." });
  }
});

app.post("/api/portfolio/resume", resumeUpload.single("resume"), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Resume PDF is required." });
    }

    if (!file.mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Only PDF resumes are supported." });
    }

    const id = crypto.randomUUID();
    const fileName = file.originalname || "resume.pdf";
    resumeStore.set(id, {
      fileName,
      mimeType: file.mimetype || "application/pdf",
      buffer: file.buffer,
      createdAt: Date.now(),
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json({
      resumeUrl: `${baseUrl}/api/portfolio/resume/${id}`,
      resumeFileName: fileName,
    });
  } catch (error) {
    console.error("Resume upload failed:", error);
    return res.status(500).json({ error: "Failed to upload resume." });
  }
});

app.get("/api/portfolio/resume/:id", (req, res) => {
  const record = resumeStore.get(req.params.id);
  if (!record) {
    return res.status(404).send("Resume not found.");
  }

  res.setHeader("Content-Type", record.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${record.fileName}"`,
  );
  return res.send(record.buffer);
});

app.post("/api/portfolio/generate", (req, res) => {
  try {
    const {
      fullName,
      title,
      tagline,
      bio,
      email,
      location,
      github,
      linkedin,
      resumeUrl,
      hireLink,
      profileImageUrl,
      resumeFileName,
      ctaPrimaryText,
      ctaSecondaryText,
      template,
      skills,
      projects,
      education,
      experience,
      theme,
    } = req.body;

    if (typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Professional title is required." });
    }

    const html = generatePortfolioPage({
      fullName,
      title,
      tagline: typeof tagline === "string" ? tagline : "",
      bio: typeof bio === "string" ? bio : "",
      email: typeof email === "string" ? email : "",
      location: typeof location === "string" ? location : "",
      github: typeof github === "string" ? github : "",
      linkedin: typeof linkedin === "string" ? linkedin : "",
      resumeUrl: typeof resumeUrl === "string" ? resumeUrl : "",
      hireLink: typeof hireLink === "string" ? hireLink : "",
      profileImageUrl:
        typeof profileImageUrl === "string" ? profileImageUrl : "",
      resumeFileName:
        typeof resumeFileName === "string" ? resumeFileName : "resume.pdf",
      ctaPrimaryText: typeof ctaPrimaryText === "string" ? ctaPrimaryText : "",
      ctaSecondaryText:
        typeof ctaSecondaryText === "string" ? ctaSecondaryText : "",
      template: typeof template === "string" ? template : "modern",
      skills: Array.isArray(skills) ? skills : [],
      projects: Array.isArray(projects) ? projects : [],
      education: Array.isArray(education) ? education : [],
      experience: Array.isArray(experience) ? experience : [],
      theme: typeof theme === "string" ? theme : "midnight",
    });

    const slug =
      fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "portfolio";

    return res.json({
      html,
      theme: typeof theme === "string" ? theme : "midnight",
      fileName: `${slug}-portfolio.html`,
    });
  } catch (error) {
    console.error("Portfolio generation failed:", error);
    return res.status(500).json({ error: "Failed to generate portfolio." });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
