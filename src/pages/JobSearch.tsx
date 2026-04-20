import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  ExternalLink,
  Clock,
  Building,
  X,
} from "lucide-react";
import { api } from "../api/api";
import { useAuth } from "../contexts/AuthContext";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  posted: string;
  description: string;
  skills: string[];
  saved: boolean;
  source: "mock" | "api";
}

interface ApplyFormState {
  name: string;
  email: string;
  resumeUrl: string;
  resumeFile: File | null;
  coverLetter: string;
}

type JobTypeFilter = "All" | "Full-time" | "Contract";

type RoleCategoryFilter =
  | "All Roles"
  | "Frontend"
  | "Backend"
  | "Full Stack"
  | "Data"
  | "DevOps"
  | "AI/ML";

type PostedFilter = "Any Time" | "Last 24 Hours" | "Last 3 Days" | "Last 7 Days";

type WorkModeFilter = "All" | "Remote" | "On-site";

type SalaryFilter = "Any" | "₹0-5 LPA" | "₹5-10 LPA" | "₹10-20 LPA" | "₹20+ LPA";

type SortOption =
  | "Most Recent"
  | "Most Relevant"
  | "Salary: High to Low"
  | "Salary: Low to High";

const JOBS_PER_BATCH = 6;
const DEFAULT_QUERY = "react";
const DEFAULT_LOCATION = "india";
const APPLIED_JOBS_KEY = "appliedJobs";

const MOCK_JOBS: Job[] = [
  {
    id: "mock-1",
    title: "Senior Frontend Developer",
    company: "Nexora Labs",
    location: "Bangalore, India",
    type: "Full-time",
    remote: true,
    salary: "₹18-28 LPA",
    posted: "2 hours ago",
    description:
      "Build and scale modern React interfaces for enterprise products.",
    skills: ["React", "TypeScript", "Redux", "Jest"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-2",
    title: "Frontend Engineer",
    company: "PixelMint",
    location: "Pune, India",
    type: "Full-time",
    remote: false,
    salary: "₹12-18 LPA",
    posted: "5 hours ago",
    description:
      "Develop reusable components and responsive UI for SaaS dashboards.",
    skills: ["React", "JavaScript", "Tailwind", "Webpack"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-3",
    title: "UI Developer",
    company: "BlueOrbit Systems",
    location: "Chennai, India",
    type: "Full-time",
    remote: true,
    salary: "₹10-16 LPA",
    posted: "8 hours ago",
    description:
      "Collaborate with design to implement high-quality user journeys.",
    skills: ["HTML", "CSS", "React", "Accessibility"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-4",
    title: "Backend Developer (Node.js)",
    company: "CloudForge Tech",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: true,
    salary: "₹14-24 LPA",
    posted: "1 day ago",
    description: "Design scalable APIs and improve service performance.",
    skills: ["Node.js", "Express", "PostgreSQL", "Redis"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-5",
    title: "Backend Engineer",
    company: "AstraScale",
    location: "Noida, India",
    type: "Full-time",
    remote: false,
    salary: "₹13-21 LPA",
    posted: "1 day ago",
    description:
      "Implement robust backend services and distributed event flows.",
    skills: ["Java", "Spring Boot", "Kafka", "MySQL"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-6",
    title: "API Engineer",
    company: "Quantive Mobility",
    location: "Gurgaon, India",
    type: "Full-time",
    remote: true,
    salary: "₹11-19 LPA",
    posted: "2 days ago",
    description: "Build secure API layers for mobile-first applications.",
    skills: ["Node.js", "MongoDB", "JWT", "Docker"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-7",
    title: "Full Stack Developer",
    company: "CodeNest",
    location: "Mumbai, India",
    type: "Full-time",
    remote: true,
    salary: "₹15-25 LPA",
    posted: "3 hours ago",
    description:
      "Work across frontend and backend to ship customer-facing features.",
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-8",
    title: "Full Stack Engineer",
    company: "VertexPath",
    location: "Delhi, India",
    type: "Full-time",
    remote: false,
    salary: "₹16-26 LPA",
    posted: "7 hours ago",
    description: "Own feature development from architecture to deployment.",
    skills: ["Next.js", "NestJS", "PostgreSQL", "Docker"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-9",
    title: "MERN Stack Developer",
    company: "RapidNinja",
    location: "Ahmedabad, India",
    type: "Contract",
    remote: true,
    salary: "₹9-15 LPA",
    posted: "12 hours ago",
    description: "Deliver fast iterations for startup MVP and growth features.",
    skills: ["React", "Node.js", "Express", "MongoDB"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-10",
    title: "Data Scientist",
    company: "DataSpring AI",
    location: "Bangalore, India",
    type: "Full-time",
    remote: true,
    salary: "₹20-34 LPA",
    posted: "4 hours ago",
    description:
      "Create predictive models and insight dashboards for product analytics.",
    skills: ["Python", "Pandas", "Scikit-learn", "SQL"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-11",
    title: "Applied Data Scientist",
    company: "InsightLeaf",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: false,
    salary: "₹18-30 LPA",
    posted: "11 hours ago",
    description: "Build and optimize ML pipelines for large-scale data sets.",
    skills: ["Python", "PyTorch", "MLOps", "Airflow"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-12",
    title: "NLP Data Scientist",
    company: "LinguaStack",
    location: "Remote, India",
    type: "Full-time",
    remote: true,
    salary: "₹22-36 LPA",
    posted: "1 day ago",
    description:
      "Develop language intelligence features for enterprise chat products.",
    skills: ["Transformers", "Python", "NLP", "FastAPI"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-13",
    title: "DevOps Engineer",
    company: "InfraPilot",
    location: "Pune, India",
    type: "Full-time",
    remote: true,
    salary: "₹14-24 LPA",
    posted: "3 hours ago",
    description: "Automate CI/CD and improve cloud infrastructure reliability.",
    skills: ["AWS", "Terraform", "GitHub Actions", "Kubernetes"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-14",
    title: "Platform Engineer",
    company: "NimbusGrid",
    location: "Chennai, India",
    type: "Full-time",
    remote: false,
    salary: "₹17-27 LPA",
    posted: "10 hours ago",
    description: "Build internal platform tooling and observability stack.",
    skills: ["Kubernetes", "Prometheus", "Go", "Helm"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-15",
    title: "Site Reliability Engineer",
    company: "PulseCloud",
    location: "Bangalore, India",
    type: "Full-time",
    remote: true,
    salary: "₹19-32 LPA",
    posted: "1 day ago",
    description:
      "Increase uptime, incident response quality, and deployment safety.",
    skills: ["Linux", "SRE", "Grafana", "Python"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-16",
    title: "AI Engineer",
    company: "NeuronWorks",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: true,
    salary: "₹24-40 LPA",
    posted: "5 hours ago",
    description: "Build production AI systems and deploy LLM-powered features.",
    skills: ["Python", "LangChain", "LLMs", "Vector DB"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-17",
    title: "Generative AI Engineer",
    company: "PromptBridge",
    location: "Remote, India",
    type: "Full-time",
    remote: true,
    salary: "₹26-44 LPA",
    posted: "9 hours ago",
    description:
      "Design prompt pipelines and tool integrations for autonomous workflows.",
    skills: ["OpenAI", "RAG", "TypeScript", "FastAPI"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-18",
    title: "ML Engineer",
    company: "SynapseForge",
    location: "Mumbai, India",
    type: "Full-time",
    remote: false,
    salary: "₹21-35 LPA",
    posted: "2 days ago",
    description: "Productionize ML models and optimize inference performance.",
    skills: ["TensorFlow", "Python", "Docker", "GCP"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-19",
    title: "Frontend React Engineer",
    company: "WebArcade",
    location: "Kolkata, India",
    type: "Full-time",
    remote: true,
    salary: "₹11-17 LPA",
    posted: "6 hours ago",
    description: "Ship performant UI for consumer-grade web applications.",
    skills: ["React", "Vite", "TypeScript", "Cypress"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-20",
    title: "Backend Python Developer",
    company: "ByteHelix",
    location: "Jaipur, India",
    type: "Full-time",
    remote: false,
    salary: "₹10-16 LPA",
    posted: "14 hours ago",
    description:
      "Create APIs and data services for workflow automation products.",
    skills: ["Python", "Django", "PostgreSQL", "Celery"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-21",
    title: "Full Stack JavaScript Engineer",
    company: "StudioStack",
    location: "Bangalore, India",
    type: "Full-time",
    remote: true,
    salary: "₹13-22 LPA",
    posted: "1 day ago",
    description:
      "Implement full product features and optimize user engagement flows.",
    skills: ["React", "Node.js", "Prisma", "MySQL"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-22",
    title: "Data Scientist - Product",
    company: "MetricHunt",
    location: "Delhi, India",
    type: "Full-time",
    remote: true,
    salary: "₹17-29 LPA",
    posted: "2 days ago",
    description: "Drive experimentation and product intelligence initiatives.",
    skills: ["SQL", "Python", "A/B Testing", "Statistics"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-23",
    title: "DevOps Specialist",
    company: "ScaleMatrix",
    location: "Remote, India",
    type: "Contract",
    remote: true,
    salary: "₹12-20 LPA",
    posted: "16 hours ago",
    description: "Manage release pipelines and cloud cost optimization.",
    skills: ["Azure", "Terraform", "Docker", "Bash"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-24",
    title: "AI Platform Engineer",
    company: "CogniFrame",
    location: "Pune, India",
    type: "Full-time",
    remote: true,
    salary: "₹23-38 LPA",
    posted: "21 hours ago",
    description:
      "Develop internal AI platform capabilities and model orchestration.",
    skills: ["Python", "Kubernetes", "MLflow", "Kafka"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-25",
    title: "Frontend Developer (React + Next)",
    company: "LaunchPilot",
    location: "Chandigarh, India",
    type: "Full-time",
    remote: false,
    salary: "₹11-18 LPA",
    posted: "3 days ago",
    description: "Build web experiences for growth-focused marketing products.",
    skills: ["React", "Next.js", "Tailwind", "REST APIs"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-26",
    title: "Backend Engineer (Microservices)",
    company: "ServicePulse",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: true,
    salary: "₹16-27 LPA",
    posted: "2 days ago",
    description:
      "Design event-driven services and optimize database performance.",
    skills: ["Node.js", "Kafka", "PostgreSQL", "Redis"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-27",
    title: "Full Stack Product Engineer",
    company: "FlowOrbit",
    location: "Mumbai, India",
    type: "Full-time",
    remote: true,
    salary: "₹14-23 LPA",
    posted: "6 hours ago",
    description: "Own end-to-end feature delivery for B2B workflow products.",
    skills: ["React", "NestJS", "TypeScript", "AWS"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-28",
    title: "Data Scientist (Computer Vision)",
    company: "VisionMint",
    location: "Bangalore, India",
    type: "Full-time",
    remote: false,
    salary: "₹22-37 LPA",
    posted: "1 day ago",
    description:
      "Build vision models for industrial quality and automation use cases.",
    skills: ["PyTorch", "OpenCV", "Python", "MLOps"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-29",
    title: "DevOps Engineer - Kubernetes",
    company: "KubeAxis",
    location: "Noida, India",
    type: "Full-time",
    remote: true,
    salary: "₹18-30 LPA",
    posted: "12 hours ago",
    description:
      "Scale containerized workloads and enforce production reliability.",
    skills: ["Kubernetes", "Helm", "ArgoCD", "Linux"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-30",
    title: "AI Engineer - LLM Applications",
    company: "GenStack Labs",
    location: "Remote, India",
    type: "Full-time",
    remote: true,
    salary: "₹25-42 LPA",
    posted: "4 hours ago",
    description:
      "Deliver LLM apps using retrieval, tools, and robust guardrails.",
    skills: ["RAG", "LangGraph", "TypeScript", "Python"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-31",
    title: "Frontend Engineer (Design Systems)",
    company: "CraftUI",
    location: "Bangalore, India",
    type: "Full-time",
    remote: false,
    salary: "₹13-21 LPA",
    posted: "18 hours ago",
    description:
      "Create and evolve component libraries for multi-product teams.",
    skills: ["React", "Storybook", "TypeScript", "CSS"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-32",
    title: "Backend Golang Engineer",
    company: "CoreMesh",
    location: "Pune, India",
    type: "Full-time",
    remote: true,
    salary: "₹17-29 LPA",
    posted: "2 days ago",
    description: "Develop high-throughput services for financial data systems.",
    skills: ["Go", "gRPC", "PostgreSQL", "Docker"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-33",
    title: "Full Stack Engineer - SaaS",
    company: "LedgerLoop",
    location: "Chennai, India",
    type: "Full-time",
    remote: true,
    salary: "₹15-24 LPA",
    posted: "7 hours ago",
    description: "Build accounting SaaS modules across frontend and backend.",
    skills: ["React", "Node.js", "MySQL", "Redis"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-34",
    title: "Data Scientist - Recommender Systems",
    company: "RecoPilot",
    location: "Hyderabad, India",
    type: "Full-time",
    remote: true,
    salary: "₹20-33 LPA",
    posted: "15 hours ago",
    description: "Improve ranking quality and recommendation relevance.",
    skills: ["Python", "Spark", "SQL", "Machine Learning"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-35",
    title: "DevOps Cloud Engineer",
    company: "OrbitDeploy",
    location: "Gurgaon, India",
    type: "Full-time",
    remote: false,
    salary: "₹14-22 LPA",
    posted: "1 day ago",
    description: "Automate cloud provisioning and monitor production health.",
    skills: ["AWS", "Terraform", "CloudWatch", "Docker"],
    saved: false,
    source: "mock",
  },
  {
    id: "mock-36",
    title: "AI Engineer - Multimodal",
    company: "MetaSense AI",
    location: "Bangalore, India",
    type: "Full-time",
    remote: true,
    salary: "₹27-45 LPA",
    posted: "3 hours ago",
    description:
      "Build multimodal intelligence systems for enterprise assistants.",
    skills: ["Python", "Vision-Language Models", "MLOps", "Kubernetes"],
    saved: false,
    source: "mock",
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

const dedupeJobs = (items: Job[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${normalize(item.title)}|${normalize(item.company)}|${normalize(item.location)}|${item.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const filterMockJobs = (query: string, location: string): Job[] => {
  const normalizedQuery = normalize(query);
  const normalizedLocation = normalize(location);

  return MOCK_JOBS.filter((job) => {
    const matchesQuery =
      !normalizedQuery ||
      normalize(job.title).includes(normalizedQuery) ||
      normalize(job.company).includes(normalizedQuery) ||
      job.skills.some((skill) => normalize(skill).includes(normalizedQuery));

    const matchesLocation =
      !normalizedLocation ||
      normalize(job.location).includes(normalizedLocation) ||
      (normalizedLocation === "india" &&
        normalize(job.location).includes("india"));

    return matchesQuery && matchesLocation;
  });
};

const parsePostedTime = (posted: string): number => {
  const normalized = normalize(posted);
  const match = normalized.match(/(\d+)/);
  const amount = match ? Number(match[1]) : 9999;

  if (normalized.includes("hour")) {
    return amount;
  }

  if (normalized.includes("day")) {
    return amount * 24;
  }

  return 9999;
};

const parseSalaryRange = (salary: string): { min: number; max: number } | null => {
  const numbers = Array.from(salary.matchAll(/(\d+(?:\.\d+)?)/g)).map((match) => Number(match[1]));

  if (!numbers.length) {
    return null;
  }

  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0] };
  }

  return { min: numbers[0], max: numbers[1] };
};

const getSalaryScore = (salary: string): number => {
  const parsed = parseSalaryRange(salary);
  if (!parsed) {
    return 0;
  }
  return (parsed.min + parsed.max) / 2;
};

const matchesSalaryBand = (salary: string, selectedBand: SalaryFilter): boolean => {
  if (selectedBand === "Any") {
    return true;
  }

  const parsed = parseSalaryRange(salary);
  if (!parsed) {
    return false;
  }

  if (selectedBand === "₹0-5 LPA") {
    return parsed.min <= 5;
  }

  if (selectedBand === "₹5-10 LPA") {
    return parsed.max >= 5 && parsed.min <= 10;
  }

  if (selectedBand === "₹10-20 LPA") {
    return parsed.max >= 10 && parsed.min <= 20;
  }

  return parsed.max >= 20;
};

const getRoleCategory = (job: Job): Exclude<RoleCategoryFilter, "All Roles"> => {
  const title = normalize(job.title);
  const skills = job.skills.map((skill) => normalize(skill));
  const text = `${title} ${skills.join(" ")}`;

  if (/(devops|sre|platform|kubernetes|terraform|cloud)/.test(text)) {
    return "DevOps";
  }

  if (/(ai|ml|machine learning|llm|nlp|rag|transformer|pytorch|tensorflow)/.test(text)) {
    return "AI/ML";
  }

  if (/(data scientist|data|analytics|sql|pandas|statistics)/.test(text)) {
    return "Data";
  }

  if (/(full stack|mern|next\.js|nestjs)/.test(text)) {
    return "Full Stack";
  }

  if (/(backend|node|java|spring|django|api|microservices|golang|go\b)/.test(text)) {
    return "Backend";
  }

  return "Frontend";
};

const matchesPostedFilter = (posted: string, selected: PostedFilter): boolean => {
  if (selected === "Any Time") {
    return true;
  }

  const hours = parsePostedTime(posted);
  if (selected === "Last 24 Hours") {
    return hours <= 24;
  }

  if (selected === "Last 3 Days") {
    return hours <= 72;
  }

  return hours <= 168;
};

const matchesWorkMode = (job: Job, selected: WorkModeFilter): boolean => {
  if (selected === "All") {
    return true;
  }

  const isRemote = job.remote || normalize(job.location).includes("remote");
  return selected === "Remote" ? isRemote : !isRemote;
};

const getRelevanceScore = (job: Job, query: string): number => {
  const tokens = normalize(query)
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) {
    return 0;
  }

  const title = normalize(job.title);
  const company = normalize(job.company);
  const description = normalize(job.description);
  const skillPool = job.skills.map((skill) => normalize(skill));

  return tokens.reduce((score, token) => {
    let nextScore = score;
    if (title.includes(token)) {
      nextScore += 5;
    }
    if (company.includes(token)) {
      nextScore += 3;
    }
    if (description.includes(token)) {
      nextScore += 1;
    }
    if (skillPool.some((skill) => skill.includes(token))) {
      nextScore += 2;
    }
    return nextScore;
  }, 0);
};

const normalizeAppliedJobs = (data: unknown): string[] => {
  const toId = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      const candidate = record.jobId ?? record.id ?? record._id;
      return toId(candidate);
    }

    return null;
  };

  if (Array.isArray(data)) {
    return data.map(toId).filter((value): value is string => Boolean(value));
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const candidate = record.appliedJobs ?? record.jobs ?? record.data;
    if (Array.isArray(candidate)) {
      return candidate
        .map(toId)
        .filter((value): value is string => Boolean(value));
    }
  }

  return [];
};

const readAppliedJobs = (): string[] => {
  try {
    const stored = localStorage.getItem(APPLIED_JOBS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

interface ApplyModalProps {
  isOpen: boolean;
  job: Job | null;
  form: ApplyFormState;
  submitting: boolean;
  onClose: () => void;
  onChange: (field: keyof ApplyFormState, value: string | File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  job,
  form,
  submitting,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!isOpen || !job) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="w-full max-w-2xl rounded-xl border p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Apply for {job.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-200/30"
            type="button"
          >
            <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                className="w-full px-3 py-2"
                required
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className="w-full px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Resume URL
            </label>
            <input
              type="url"
              value={form.resumeUrl}
              onChange={(event) => onChange("resumeUrl", event.target.value)}
              placeholder="https://example.com/resume.pdf"
              className="w-full px-3 py-2"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Or Upload Resume
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                onChange("resumeFile", event.target.files?.[0] ?? null)
              }
              className="w-full px-3 py-2"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Cover Letter
            </label>
            <textarea
              value={form.coverLetter}
              onChange={(event) => onChange("coverLetter", event.target.value)}
              rows={5}
              className="w-full px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 tucf-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 tucf-btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DetailsModalProps {
  isOpen: boolean;
  job: Job | null;
  applied: boolean;
  onClose: () => void;
  onApply: (job: Job) => void | Promise<void>;
  applying: boolean;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  job,
  applied,
  onClose,
  onApply,
  applying,
}) => {
  if (!isOpen || !job) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="w-full max-w-3xl rounded-xl border p-6 shadow-2xl"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {job.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-200/30"
            type="button"
          >
            <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3
              className="mb-2 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Salary
            </h3>
            <p style={{ color: "var(--text-primary)" }}>{job.salary}</p>
          </div>

          <div>
            <h3
              className="mb-2 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>{job.description}</p>
          </div>

          <div>
            <h3
              className="mb-2 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={`${job.id}-${skill}`}
                  className="px-3 py-1 text-sm rounded-full"
                  style={{
                    background: "rgba(255,122,0,0.12)",
                    color: "var(--accent)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 tucf-btn-ghost"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="px-6 py-2 tucf-btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onApply(job)}
              disabled={applied || applying}
            >
              {applied ? "Applied" : applying ? "Applying..." : "Apply Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobSearch: React.FC = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [hasMoreMock, setHasMoreMock] = useState(true);
  const [apiPage, setApiPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<JobTypeFilter>("All");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<RoleCategoryFilter>("All Roles");
  const [postedFilter, setPostedFilter] = useState<PostedFilter>("Any Time");
  const [workModeFilter, setWorkModeFilter] = useState<WorkModeFilter>("All");
  const [salaryFilter, setSalaryFilter] = useState<SalaryFilter>("Any");
  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");
  const [hasMoreApi, setHasMoreApi] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyFormState>({
    name: user?.name || "",
    email: user?.email || "",
    resumeUrl: "",
    resumeFile: null,
    coverLetter: "",
  });

  const canLoadMore = hasMoreMock || hasMoreApi;

  const filteredJobs = useMemo(() => {
    const normalizedQuery = normalize(searchQuery);
    const normalizedLocation = normalize(location);

    const nextJobs = jobs.filter((job) => {
      const matchesKeyword =
        !normalizedQuery ||
        normalize(job.title).includes(normalizedQuery) ||
        normalize(job.company).includes(normalizedQuery) ||
        job.skills.some((skill) => normalize(skill).includes(normalizedQuery));

      const matchesLocation =
        !normalizedLocation || normalize(job.location).includes(normalizedLocation);

      const matchesType =
        jobTypeFilter === "All" || normalize(job.type) === normalize(jobTypeFilter);

      const matchesRole =
        roleCategoryFilter === "All Roles" || getRoleCategory(job) === roleCategoryFilter;

      const matchesPosted = matchesPostedFilter(job.posted, postedFilter);

      const matchesMode = matchesWorkMode(job, workModeFilter);

      const matchesSalary = matchesSalaryBand(job.salary, salaryFilter);

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesType &&
        matchesRole &&
        matchesPosted &&
        matchesMode &&
        matchesSalary
      );
    });

    const withIndex = nextJobs.map((job, index) => ({ job, index }));

    withIndex.sort((a, b) => {
      if (sortBy === "Salary: High to Low") {
        return getSalaryScore(b.job.salary) - getSalaryScore(a.job.salary);
      }

      if (sortBy === "Salary: Low to High") {
        return getSalaryScore(a.job.salary) - getSalaryScore(b.job.salary);
      }

      if (sortBy === "Most Relevant") {
        const scoreDiff =
          getRelevanceScore(b.job, searchQuery) - getRelevanceScore(a.job, searchQuery);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }
      }

      const postedDiff = parsePostedTime(a.job.posted) - parsePostedTime(b.job.posted);
      if (postedDiff !== 0) {
        return postedDiff;
      }

      return a.index - b.index;
    });

    return withIndex.map((entry) => entry.job);
  }, [
    jobs,
    searchQuery,
    location,
    jobTypeFilter,
    roleCategoryFilter,
    postedFilter,
    workModeFilter,
    salaryFilter,
    sortBy,
  ]);

  const totalShown = filteredJobs.length;

  const setInitialMockFeed = () => {
    const initial = MOCK_JOBS;
    setJobs(initial);
    setMockIndex(initial.length);
    setHasMoreMock(false);
    setApiPage(1);
    setHasMoreApi(true);
    setErrorMessage("");
  };

  const persistAppliedJobs = (nextAppliedJobs: string[]) => {
    localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(nextAppliedJobs));
    setAppliedJobs(nextAppliedJobs);
  };

  useEffect(() => {
    setInitialMockFeed();
  }, []);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await api.get("/jobs/applied");
        setAppliedJobs(normalizeAppliedJobs(response.data));
      } catch {
        setAppliedJobs([]);
      }
    };

    fetchAppliedJobs();
  }, []);

  const fetchApiJobs = async (
    query: string,
    selectedLocation: string,
    page: number,
  ): Promise<Job[]> => {
    const response = await api.get("/jobs/search", {
      params: {
        q: query || DEFAULT_QUERY,
        location: selectedLocation || DEFAULT_LOCATION,
        page,
      },
    });

    const payload = response.data as
      | Record<string, unknown>
      | Array<Record<string, unknown>>;

    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.jobs)
        ? (payload.jobs as Array<Record<string, unknown>>)
        : Array.isArray(payload.results)
          ? (payload.results as Array<Record<string, unknown>>)
          : Array.isArray(payload.data)
            ? (payload.data as Array<Record<string, unknown>>)
            : [];

    return list.map((raw, index) => {
      const title =
        typeof raw.title === "string"
          ? raw.title
          : typeof raw.role === "string"
            ? raw.role
            : "Software Engineer";
      const company =
        typeof raw.company === "string"
          ? raw.company
          : typeof raw.companyName === "string"
            ? raw.companyName
            : "Confidential";
      const jobLocation =
        typeof raw.location === "string" ? raw.location : "India";
      const skills = Array.isArray(raw.skills)
        ? raw.skills.filter(
            (skill): skill is string => typeof skill === "string",
          )
        : Array.isArray(raw.tags)
          ? raw.tags.filter(
              (skill): skill is string => typeof skill === "string",
            )
          : [];

      return {
        id: `api-${page}-${index}-${normalize(title)}-${normalize(company)}`,
        title,
        company,
        location: jobLocation,
        type:
          typeof raw.type === "string"
            ? raw.type
            : typeof raw.jobType === "string"
              ? raw.jobType
              : "Full-time",
        remote:
          typeof raw.remote === "boolean"
            ? raw.remote
            : normalize(jobLocation).includes("remote"),
        salary: typeof raw.salary === "string" ? raw.salary : "Competitive",
        posted: typeof raw.posted === "string" ? raw.posted : "Recently posted",
        description:
          typeof raw.description === "string"
            ? raw.description
            : "Exciting opportunity for experienced professionals.",
        skills: skills.length ? skills : ["Teamwork", "Problem Solving"],
        saved: false,
        source: "api" as const,
      };
    });
  };

  const mergeJobs = (existing: Job[], incoming: Job[]) =>
    dedupeJobs([...existing, ...incoming]);

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setErrorMessage("");
  };

  const handleLoadMore = async () => {
    if (loading) {
      return;
    }

    const currentMockPool = MOCK_JOBS;

    if (hasMoreMock) {
      const nextChunk = currentMockPool.slice(
        mockIndex,
        mockIndex + JOBS_PER_BATCH,
      );
      const nextIndex = mockIndex + nextChunk.length;
      setJobs((previous) => mergeJobs(previous, nextChunk));
      setMockIndex(nextIndex);
      setHasMoreMock(nextIndex < currentMockPool.length);

      if (nextChunk.length > 0) {
        return;
      }
    }

    if (!hasMoreApi) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const apiJobs = await fetchApiJobs(
        DEFAULT_QUERY,
        DEFAULT_LOCATION,
        apiPage,
      );
      if (!apiJobs.length) {
        setHasMoreApi(false);
        return;
      }

      setJobs((previous) => mergeJobs(previous, apiJobs));
      setApiPage((previous) => previous + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load more API jobs.",
      );
      setHasMoreApi(false);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (job: Job) => {
    setDetailsJob(job);
  };

  const closeDetailsModal = () => {
    setDetailsJob(null);
  };

  const toggleSave = (jobId: string) => {
    setJobs((previous) =>
      previous.map((job) =>
        job.id === jobId ? { ...job, saved: !job.saved } : job,
      ),
    );
  };

  const openApplyModal = (job: Job) => {
    if (appliedJobs.includes(job.id)) {
      return;
    }
    setSelectedJob(job);
    setApplyForm({
      name: user?.name || "User",
      email: user?.email || "",
      resumeUrl: "",
      resumeFile: null,
      coverLetter: "",
    });
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleApplyFormChange = (
    field: keyof ApplyFormState,
    value: string | File | null,
  ) => {
    setApplyForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleApplySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedJob) {
      return;
    }

    if (
      appliedJobs.includes(selectedJob.id) ||
      applyingJobId === selectedJob.id
    ) {
      closeApplyModal();
      return;
    }

    setApplyingJobId(selectedJob.id);

    try {
      await api.post("/jobs/apply", {
        jobId: selectedJob.id,
        title: selectedJob.title,
        company: selectedJob.company,
      });

      const nextAppliedJobs = Array.from(
        new Set([...appliedJobs, selectedJob.id]),
      );
      persistAppliedJobs(nextAppliedJobs);
      closeApplyModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply for this job.",
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  const isJobApplied = (jobId: string) => appliedJobs.includes(jobId);

  useEffect(() => {
    const currentScroll = window.scrollY;
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: currentScroll, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [
    searchQuery,
    location,
    jobTypeFilter,
    roleCategoryFilter,
    postedFilter,
    workModeFilter,
    salaryFilter,
    sortBy,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Job Search
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Find your dream job from top companies
          </p>
        </div>
      </div>

      <div className="tucf-card">
        <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearch}>
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full pl-10 pr-4 py-3"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            className="px-6 py-3 tucf-btn-ghost flex items-center space-x-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
          <button
            type="submit"
            className="px-8 py-3 tucf-btn-primary font-medium"
          >
            Search Jobs
          </button>
        </form>

        {showFilters && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Job Type
                </label>
                <select
                  className="w-full px-3 py-2"
                  value={jobTypeFilter}
                  onChange={(event) =>
                    setJobTypeFilter(event.target.value as JobTypeFilter)
                  }
                >
                  <option>All</option>
                  <option>Full-time</option>
                  <option>Contract</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Role Category
                </label>
                <select
                  className="w-full px-3 py-2"
                  value={roleCategoryFilter}
                  onChange={(event) =>
                    setRoleCategoryFilter(event.target.value as RoleCategoryFilter)
                  }
                >
                  <option>All Roles</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Full Stack</option>
                  <option>Data</option>
                  <option>DevOps</option>
                  <option>AI/ML</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Posted Within
                </label>
                <select
                  className="w-full px-3 py-2"
                  value={postedFilter}
                  onChange={(event) =>
                    setPostedFilter(event.target.value as PostedFilter)
                  }
                >
                  <option>Any Time</option>
                  <option>Last 24 Hours</option>
                  <option>Last 3 Days</option>
                  <option>Last 7 Days</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Work Mode
                </label>
                <select
                  className="w-full px-3 py-2"
                  value={workModeFilter}
                  onChange={(event) =>
                    setWorkModeFilter(event.target.value as WorkModeFilter)
                  }
                >
                  <option>All</option>
                  <option>Remote</option>
                  <option>On-site</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Salary Range
                </label>
                <select
                  className="w-full px-3 py-2"
                  value={salaryFilter}
                  onChange={(event) =>
                    setSalaryFilter(event.target.value as SalaryFilter)
                  }
                >
                  <option>Any</option>
                  <option>₹0-5 LPA</option>
                  <option>₹5-10 LPA</option>
                  <option>₹10-20 LPA</option>
                  <option>₹20+ LPA</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p style={{ color: "var(--text-secondary)" }}>
          Showing <span className="font-semibold">{totalShown}</span> jobs
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sort by:
          </span>
          <select
            className="px-3 py-1 text-sm"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
          >
            <option>Most Recent</option>
            <option>Most Relevant</option>
            <option>Salary: High to Low</option>
            <option>Salary: Low to High</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {filteredJobs.length === 0 && (
          <div className="tucf-card text-center py-10" style={{ color: "var(--text-secondary)" }}>
            No jobs match your filters.
          </div>
        )}

        {filteredJobs.map((job) => (
          <div key={job.id} className="tucf-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <h3
                    className="text-xl font-semibold cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {job.title}
                  </h3>
                  {job.remote && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        background: "rgba(255,122,0,0.15)",
                        color: "var(--accent)",
                      }}
                    >
                      Remote
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center space-x-4 mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span className="text-sm">{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{job.posted}</span>
                  </div>
                </div>

                <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill) => (
                    <span
                      key={`${job.id}-${skill}`}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        background: "rgba(255,122,0,0.12)",
                        color: "var(--accent)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {job.salary}
                    </span>
                    <span className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-6">
                <button
                  onClick={() => toggleSave(job.id)}
                  className={`p-2 rounded-lg transition-colors ${job.saved ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100" : "hover:bg-[rgba(255,122,0,0.1)]"}`}
                  style={
                    job.saved
                      ? {
                          color: "var(--accent)",
                          background: "rgba(255,122,0,0.1)",
                        }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <Bookmark
                    className={`h-5 w-5 ${job.saved ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className="flex justify-end space-x-3 mt-4 pt-4 border-t"
              style={{ borderTopColor: "var(--border)" }}
            >
              <button
                className="px-4 py-2 font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleViewDetails(job)}
              >
                View Details
              </button>
              <button
                className="px-6 py-2 tucf-btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => openApplyModal(job)}
                disabled={isJobApplied(job.id) || applyingJobId === job.id}
              >
                {isJobApplied(job.id)
                  ? "Applied"
                  : applyingJobId === job.id
                    ? "Applying..."
                    : "Apply Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-3">
        {loading && (
          <div
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading jobs...
          </div>
        )}

        <button
          className="px-8 py-3 tucf-btn-ghost font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLoadMore}
          disabled={loading || !canLoadMore}
        >
          {loading
            ? "Loading..."
            : canLoadMore
              ? "Load More Jobs"
              : "No more jobs"}
        </button>

        {!canLoadMore && !loading && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No more jobs available from the backend.
          </p>
        )}
      </div>

      <DetailsModal
        isOpen={Boolean(detailsJob)}
        job={detailsJob}
        applied={detailsJob ? isJobApplied(detailsJob.id) : false}
        onClose={closeDetailsModal}
        onApply={openApplyModal}
        applying={detailsJob ? applyingJobId === detailsJob.id : false}
      />

      <ApplyModal
        isOpen={isModalOpen}
        job={selectedJob}
        form={applyForm}
        submitting={selectedJob ? applyingJobId === selectedJob.id : false}
        onClose={closeApplyModal}
        onChange={handleApplyFormChange}
        onSubmit={handleApplySubmit}
      />
    </div>
  );
};

export default JobSearch;
