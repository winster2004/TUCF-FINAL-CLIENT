import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FolderGit2,
  GraduationCap,
  Maximize2,
  Target,
  User,
  Wrench,
} from "lucide-react";
import "./ResumeBuilder.css";

type ResumeSection =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "export";

type PreviewMode = "desktop" | "tablet" | "mobile";

interface ExperienceItem {
  company: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string;
}

interface ProjectItem {
  title: string;
  githubUrl: string;
  techStack: string;
  dateRange: string;
  bullets: string;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  summary: string;
  skillsLanguages: string;
  skillsBackend: string;
  skillsDatabases: string;
  skillsTools: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  college: string;
  eduLocation: string;
  degree: string;
  eduStart: string;
  eduEnd: string;
  cgpa: string;
}

const sections: { id: ResumeSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: Target },
  { id: "skills", label: "Technical Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "export", label: "Export", icon: Download },
];

const initialData: ResumeData = {
  fullName: "Winster Mano",
  jobTitle: "Software Developer",
  phone: "+91 8610913767",
  email: "winster@example.com",
  linkedin: "https://linkedin.com/in/winstermano",
  github: "https://github.com/winstermano",
  location: "Chennai, TN, India",
  summary:
    "ATS-focused software developer with experience building backend systems, REST APIs, and full-stack applications using modern tools and clean engineering practices.",
  skillsLanguages: "Java 17+, SQL, JavaScript",
  skillsBackend: "Spring Boot, REST API, React.js",
  skillsDatabases: "MySQL, MongoDB",
  skillsTools: "Git, Postman, Maven, Docker",
  experience: [
    {
      company: "CareerPro",
      location: "Chennai",
      title: "Software Developer",
      startDate: "Jan 2025",
      endDate: "Present",
      bullets:
        "Built modular LMS features for ATS scoring and portfolio generation.\nDesigned API integrations and optimized frontend flows for student career tools.",
    },
  ],
  projects: [
    {
      title: "ATS Resume Score Checker",
      githubUrl: "https://github.com/winstermano/ats-checker",
      techStack: "React, Node.js, Express",
      dateRange: "Jan 2025 -- Mar 2025",
      bullets:
        "Implemented resume parsing, keyword scoring, and actionable suggestions.\nImproved user workflow with live preview and modular dashboard integration.",
    },
  ],
  college: "Meenakshi College of Engineering",
  eduLocation: "Chennai",
  degree: "Bachelor of Technology (B.Tech) in Information Technology",
  eduStart: "2022",
  eduEnd: "2026",
  cgpa: "7.5 / 10",
};

const escapeLatex = (value: string) =>
  value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");

const generateLatexFromState = (resumeState: ResumeData) => {
  const skillsBlock = [
    `\\textbf{Languages/Core:} ${escapeLatex(resumeState.skillsLanguages)} \\\\`,
    `\\textbf{Backend/Frameworks:} ${escapeLatex(resumeState.skillsBackend)} \\\\`,
    `\\textbf{Databases:} ${escapeLatex(resumeState.skillsDatabases)} \\\\`,
    `\\textbf{Tools/Practices:} ${escapeLatex(resumeState.skillsTools)}`,
  ].join("\n");

  const experienceBlock = resumeState.experience
    .map((item) => {
      const bullets = item.bullets
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `\\item ${escapeLatex(line)}`)
        .join("\n");

      return [
        `\\textbf{${escapeLatex(item.title)}}\\hfill ${escapeLatex(item.startDate)}--${escapeLatex(item.endDate)}\\`,
        `\\textit{${escapeLatex(item.company)}}`,
        `\\begin{itemize}`,
        bullets || "\\item",
        `\\end{itemize}`,
      ].join("\n");
    })
    .join("\n\n");

  const projectsBlock = resumeState.projects
    .map((item) => {
      const bullets = item.bullets
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `\\item ${escapeLatex(line)}`)
        .join("\n");

      return [
        `\\textbf{${escapeLatex(item.title)}}\\hfill ${escapeLatex(item.dateRange)}\\`,
        `\\textit{${escapeLatex(item.techStack)}}`,
        `\\begin{itemize}`,
        bullets || "\\item",
        `\\end{itemize}`,
      ].join("\n");
    })
    .join("\n\n");

  const educationBlock = [
    `\\textbf{${escapeLatex(resumeState.degree)}}\\hfill ${escapeLatex(resumeState.eduStart)}--${escapeLatex(resumeState.eduEnd)}\\`,
    `${escapeLatex(resumeState.college)}\\hfill\\textbf{CGPA: ${escapeLatex(resumeState.cgpa)}}`,
    `\\begin{itemize}`,
    `\\item Location: ${escapeLatex(resumeState.eduLocation)}`,
    `\\end{itemize}`,
  ].join("\n");

  return [
    `\\documentclass[a4paper,10pt]{article}`,
    `\\usepackage[left=0.5in,right=0.5in,top=0.4in,bottom=0.4in]{geometry}`,
    `\\usepackage{enumitem,titlesec,hyperref}`,
    `\\titleformat{\\section}{\\normalsize\\bfseries\\uppercase}{}{0em}{}[\\titlerule]`,
    `\\titlespacing{\\section}{0pt}{5pt}{3pt}`,
    `\\setlist[itemize]{noitemsep,topsep=0pt,leftmargin=1.2em,itemsep=1pt}`,
    `\\renewcommand{\\baselinestretch}{0.96}`,
    `\\begin{document}`,
    `\\begin{center}`,
    `{\\huge\\textbf{${escapeLatex(resumeState.fullName)}}}\\`,
    `\\vspace{1mm}`,
    `\\small ${escapeLatex(resumeState.phone)}\\,|\\,${escapeLatex(resumeState.email)}\\,|\\,${escapeLatex(resumeState.linkedin)}\\,|\\,${escapeLatex(resumeState.github)}`,
    `\\end{center}`,
    `\\section*{Summary}${escapeLatex(resumeState.summary)}`,
    `\\section*{Technical Skills}`,
    skillsBlock,
    `\\section*{Professional Experience}`,
    experienceBlock,
    `\\section*{Projects}`,
    projectsBlock,
    `\\section*{Education}`,
    educationBlock,
    `\\end{document}`,
  ].join("\n");
};

const generateResumeHTML = (state: ResumeData) => {
  const personalInfo = {
    name: state.fullName,
    phone: state.phone,
    email: state.email,
    linkedin: state.linkedin,
    github: state.github,
  };
  const summary = state.summary;
  const skills = [
    ...state.skillsLanguages.split(",").map((item) => ({ category: "Languages", name: item.trim() })),
    ...state.skillsBackend.split(",").map((item) => ({ category: "Backend", name: item.trim() })),
    ...state.skillsBackend
      .split(",")
      .map((item) => item.trim())
      .filter((item) => /react/i.test(item))
      .map((item) => ({ category: "Frontend", name: item })),
    ...state.skillsDatabases.split(",").map((item) => ({ category: "Core", name: item.trim() })),
    ...state.skillsTools.split(",").map((item) => ({ category: "Tools", name: item.trim() })),
  ].filter((item) => item.name);
  const experience = state.experience.map((item) => ({
    role: item.title,
    company: item.company,
    location: item.location,
    startDate: item.startDate,
    endDate: item.endDate,
    bullets: item.bullets.split("\n").map((line) => line.trim()).filter(Boolean),
  }));
  const projects = state.projects.map((item) => ({
    name: item.title,
    startDate: item.dateRange,
    endDate: "",
    techStack: item.techStack,
    bullets: item.bullets.split("\n").map((line) => line.trim()).filter(Boolean),
  }));
  const education = [
    {
      degree: state.degree,
      institution: state.college,
      startDate: state.eduStart,
      endDate: state.eduEnd,
      cgpa: state.cgpa,
      courses: state.eduLocation,
      activities: "",
    },
  ];

  const bulletList = (items: string[] = []) =>
    `<ul style="margin:2px 0 4px 1.3em;padding:0">${items
      .filter(Boolean)
      .map((bullet) => `<li style="font-size:10pt;margin-bottom:2px;line-height:1.4">${esc(bullet)}</li>`)
      .join("")}</ul>`;

  const esc = (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const expRows = (experience || [])
    .map(
      (e) => `
    <tr>
      <td style="font-weight:bold;font-size:10pt">${esc(e.role)}</td>
      <td style="text-align:right;font-size:10pt;white-space:nowrap">${esc(e.startDate)} – ${esc(e.endDate)}</td>
    </tr>
    <tr><td colspan="2" style="font-style:italic;font-size:10pt;padding-bottom:3px">${esc(e.company)}, ${esc(e.location)}</td></tr>
    <tr><td colspan="2">${bulletList(e.bullets)}</td></tr>
  `,
    )
    .join("");

  const projRows = (projects || [])
    .map(
      (p) => `
    <tr>
      <td style="font-weight:bold;font-size:10pt">${esc(p.name)}</td>
      <td style="text-align:right;font-size:10pt;white-space:nowrap">${esc(p.startDate)} – ${esc(p.endDate)}</td>
    </tr>
    <tr><td colspan="2" style="font-style:italic;font-size:10pt;padding-bottom:3px">${esc(p.techStack)}</td></tr>
    <tr><td colspan="2">${bulletList(p.bullets)}</td></tr>
  `,
    )
    .join("");

  const eduRows = (education || [])
    .map(
      (e) => `
    <tr>
      <td style="font-weight:bold;font-size:10pt">${esc(e.degree)}</td>
      <td style="text-align:right;font-size:10pt">${esc(e.startDate)} – ${esc(e.endDate)}</td>
    </tr>
    <tr>
      <td style="font-size:10pt">${esc(e.institution)}</td>
      <td style="text-align:right;font-weight:bold;font-size:10pt">CGPA: ${esc(e.cgpa)} / 10</td>
    </tr>
    <tr><td colspan="2">${bulletList([`Relevant Coursework: ${e.courses || ""}`, e.activities || ""].filter(Boolean))}</td></tr>
  `,
    )
    .join("");

  const skillsByCategory = () => {
    const cats: Record<string, string> = { Languages: "", Backend: "", Frontend: "", Core: "", Tools: "" };
    (skills || []).forEach((skill) => {
      const category = skill.category || "Tools";
      cats[category] = cats[category] ? `${cats[category]}, ${skill.name}` : skill.name;
    });
    return Object.entries(cats)
      .filter(([, value]) => value)
      .map(([key, value]) => `<div style="font-size:10pt;margin-bottom:2px"><b>${key}:</b> ${esc(value)}</div>`)
      .join("");
  };

  const section = (title: string, content: string) => `
    <div style="margin-top:8px">
      <div style="font-size:10.5pt;font-weight:bold;text-transform:uppercase;
        letter-spacing:0.3px;border-bottom:1px solid #000;
        padding-bottom:2px;margin-bottom:5px">${title}</div>
      ${content}
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      font-family:"Times New Roman",Times,serif;
      font-size:10.5pt;color:#000;background:#fff;
      padding:0.45in 0.55in;line-height:1.4;
    }
    table{width:100%;border-collapse:collapse}
    a{color:#00e;text-decoration:none}
  </style>
  </head><body>

  <div style="text-align:center;margin-bottom:8px">
    <div style="font-size:18pt;font-weight:bold;
      letter-spacing:2px;text-transform:uppercase;margin-bottom:3px">
      ${esc(personalInfo?.name || "")}
    </div>
    <div style="font-size:9pt;display:flex;justify-content:center;
      gap:10px;flex-wrap:wrap">
      <span>${esc(personalInfo?.phone || "")}</span>
      <a href="mailto:${esc(personalInfo?.email || "")}">${esc(personalInfo?.email || "")}</a>
      <a href="${esc(personalInfo?.linkedin || "")}">${esc((personalInfo?.linkedin || "").replace("https://", ""))}</a>
      <a href="${esc(personalInfo?.github || "")}">${esc((personalInfo?.github || "").replace("https://", ""))}</a>
    </div>
  </div>

  ${section("Summary", `<div style="font-size:10pt;text-align:justify">${esc(summary || "")}</div>`)}
  ${section("Technical Skills", skillsByCategory())}
  ${section("Professional Experience", `<table>${expRows}</table>`)}
  ${section("Projects", `<table>${projRows}</table>`)}
  ${section("Education", `<table>${eduRows}</table>`)}

  </body></html>`;
};

const ResumeBuilder: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ResumeSection>("personal");
  const [data, setData] = useState<ResumeData>(initialData);
  const [copyLatexStatus, setCopyLatexStatus] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const currentSectionIndex = sections.findIndex((section) => section.id === activeSection);

  const previewWidths: Record<PreviewMode, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const resumeHtml = useMemo(() => generateResumeHTML(data), [data]);
  const latexString = useMemo(() => generateLatexFromState(data), [data]);

  const updateField = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setData((previous) => ({
      ...previous,
      experience: previous.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setData((previous) => ({
      ...previous,
      projects: previous.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setData((previous) => ({
      ...previous,
      experience: [...previous.experience, { company: "", location: "", title: "", startDate: "", endDate: "", bullets: "" }],
    }));
  };

  const addProject = () => {
    setData((previous) => ({
      ...previous,
      projects: [...previous.projects, { title: "", githubUrl: "", techStack: "", dateRange: "", bullets: "" }],
    }));
  };

  const copyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latexString);
      setCopyLatexStatus("✓ Copied!");
    } catch {
      setCopyLatexStatus("Copy failed");
    } finally {
      window.setTimeout(() => setCopyLatexStatus(""), 2000);
    }
  };

  const downloadPdf = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=1400");

    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(resumeHtml);
    printWindow.document.close();

    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    if (printWindow.document.readyState === "complete") {
      triggerPrint();
    } else {
      printWindow.onload = triggerPrint;
    }
  };

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        setPreviewScale(containerWidth / 794);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [previewMode]);

  return (
    <div className="resume-builder-page">
      {isFullscreen ? (
        <div className="resume-builder-fullscreen-overlay" role="region" aria-label="Fullscreen resume preview">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              background: "#1e1412",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              zIndex: 10000,
            }}
          >
            ✕ Close
          </button>
          <div className="flex flex-1 items-start justify-center overflow-auto p-4 bg-gray-100">
            <div style={{ width: previewWidths[previewMode], border: "1px solid rgba(0,0,0,0.08)" }} className="rounded-lg overflow-hidden bg-white shadow-2xl">
                <iframe title="Resume Preview" srcDoc={resumeHtml} className="w-full border-none bg-white" style={{ height: "100vh" }} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="resume-builder-shell">
        <aside className="resume-builder-navpanel">
          <div className="resume-builder-brand">
            <h2>Resume Builder</h2>
            <p>Clean, fast, ATS-friendly</p>
          </div>

          <div className="resume-builder-navlist">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={`resume-builder-navbtn ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="resume-builder-formpanel">
          <div className="resume-builder-panelhead">
            <h1>Build your resume</h1>
            <p>
              Section {currentSectionIndex + 1} of {sections.length}
            </p>
          </div>

          {activeSection === "personal" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Personal Information</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>Full Name</span>
                  <input value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Job Title</span>
                  <input value={data.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Phone</span>
                  <input value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Email</span>
                  <input value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>LinkedIn</span>
                  <input value={data.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>GitHub</span>
                  <input value={data.github} onChange={(e) => updateField("github", e.target.value)} />
                </label>
                <label className="resume-builder-field resume-builder-field-full">
                  <span>Location</span>
                  <input value={data.location} onChange={(e) => updateField("location", e.target.value)} />
                </label>
              </div>
            </section>
          )}

          {activeSection === "summary" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Professional Summary</h3>
              <label className="resume-builder-field">
                <span>Summary</span>
                <textarea value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
              </label>
            </section>
          )}

          {activeSection === "skills" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Technical Skills</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>Languages / Core</span>
                  <input value={data.skillsLanguages} onChange={(e) => updateField("skillsLanguages", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Backend / Frameworks</span>
                  <input value={data.skillsBackend} onChange={(e) => updateField("skillsBackend", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Databases</span>
                  <input value={data.skillsDatabases} onChange={(e) => updateField("skillsDatabases", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Tools / Practices</span>
                  <input value={data.skillsTools} onChange={(e) => updateField("skillsTools", e.target.value)} />
                </label>
              </div>
            </section>
          )}

          {activeSection === "experience" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <div className="resume-builder-sectiontop">
                <h3>Experience</h3>
                <button type="button" className="resume-builder-accentbtn" onClick={addExperience}>
                  Add Experience
                </button>
              </div>

              <div className="resume-builder-stack">
                {data.experience.map((item, index) => (
                  <div key={`${item.company}-${index}`} className="resume-builder-block">
                    <div className="resume-builder-grid">
                      <label className="resume-builder-field">
                        <span>Company</span>
                        <input value={item.company} onChange={(e) => updateExperience(index, "company", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>Location</span>
                        <input value={item.location} onChange={(e) => updateExperience(index, "location", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>Title</span>
                        <input value={item.title} onChange={(e) => updateExperience(index, "title", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>Dates</span>
                        <input value={`${item.startDate} - ${item.endDate}`} readOnly />
                      </label>
                    </div>
                    <label className="resume-builder-field">
                      <span>Bullets</span>
                      <textarea value={item.bullets} onChange={(e) => updateExperience(index, "bullets", e.target.value)} />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "projects" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <div className="resume-builder-sectiontop">
                <h3>Projects</h3>
                <button type="button" className="resume-builder-accentbtn" onClick={addProject}>
                  Add Project
                </button>
              </div>

              <div className="resume-builder-stack">
                {data.projects.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="resume-builder-block">
                    <div className="resume-builder-grid">
                      <label className="resume-builder-field">
                        <span>Title</span>
                        <input value={item.title} onChange={(e) => updateProject(index, "title", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>GitHub URL</span>
                        <input value={item.githubUrl} onChange={(e) => updateProject(index, "githubUrl", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>Tech Stack</span>
                        <input value={item.techStack} onChange={(e) => updateProject(index, "techStack", e.target.value)} />
                      </label>
                      <label className="resume-builder-field">
                        <span>Date Range</span>
                        <input value={item.dateRange} onChange={(e) => updateProject(index, "dateRange", e.target.value)} />
                      </label>
                    </div>
                    <label className="resume-builder-field">
                      <span>Bullets</span>
                      <textarea value={item.bullets} onChange={(e) => updateProject(index, "bullets", e.target.value)} />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "education" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Education</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>College</span>
                  <input value={data.college} onChange={(e) => updateField("college", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Location</span>
                  <input value={data.eduLocation} onChange={(e) => updateField("eduLocation", e.target.value)} />
                </label>
                <label className="resume-builder-field resume-builder-field-full">
                  <span>Degree</span>
                  <input value={data.degree} onChange={(e) => updateField("degree", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>Start Year</span>
                  <input value={data.eduStart} onChange={(e) => updateField("eduStart", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>End Year</span>
                  <input value={data.eduEnd} onChange={(e) => updateField("eduEnd", e.target.value)} />
                </label>
                <label className="resume-builder-field">
                  <span>CGPA</span>
                  <input value={data.cgpa} onChange={(e) => updateField("cgpa", e.target.value)} />
                </label>
              </div>
            </section>
          )}

          {activeSection === "export" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Export</h3>
              <p style={{ color: "var(--text-secondary)" }}>Copy your resume snapshot as LaTeX or download the resume as a PDF.</p>
              <div className="resume-builder-sectionnav">
                <button type="button" className="resume-builder-navsecondary" onClick={copyLatex}>
                  <Copy className="h-4 w-4" />
                  {copyLatexStatus || "Copy LaTeX"}
                </button>
                <button type="button" className="resume-builder-navprimary" onClick={downloadPdf}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </section>
          )}

          <div className="resume-builder-sectionnav">
            <button
              type="button"
              className="resume-builder-navsecondary"
              onClick={() => setActiveSection(sections[Math.max(0, currentSectionIndex - 1)].id)}
              disabled={currentSectionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              className="resume-builder-navprimary"
              onClick={() => setActiveSection(sections[Math.min(sections.length - 1, currentSectionIndex + 1)].id)}
              disabled={currentSectionIndex === sections.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>

        <aside
          ref={previewContainerRef}
          className="resume-builder-previewpanel"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="resume-builder-previewhead">
            <div className="resume-builder-previewtitle">
              <h3>Live Resume Preview</h3>
              <p>✓ Live</p>
            </div>

            <div className="resume-builder-previewcontrols">
              {(["desktop", "tablet", "mobile"] as PreviewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`resume-builder-modebtn ${previewMode === mode ? "is-active" : ""}`}
                  onClick={() => setPreviewMode(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
              <button
                type="button"
                className="resume-builder-expandbtn"
                onClick={() => setIsFullscreen(true)}
                title="Enter fullscreen"
                aria-label="Enter fullscreen mode"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={previewContainerRef}
            style={{
              width: "100%",
              height: `${1123 * previewScale}px`,
              overflow: "hidden",
              position: "relative",
              background: "#fff",
              borderRadius: 4,
            }}
          >
            <iframe
              title="Resume Preview"
              srcDoc={resumeHtml}
              style={{
                width: "794px",
                height: "1123px",
                border: "none",
                transformOrigin: "top left",
                transform: `scale(${previewScale})`,
                background: "#fff",
              }}
              scrolling="no"
            />
          </div>
        </aside>
      </div>

      {isFullscreen ? (
        <div className="resume-builder-fullscreen-overlay" role="region" aria-label="Fullscreen resume preview" style={{ background: "#fff", padding: "40px" }}>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              background: "#1e1412",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              zIndex: 10000,
            }}
          >
            ✕ Close
          </button>
          <div className="flex flex-1 items-start justify-center overflow-auto p-0 bg-white">
            <div style={{ width: previewWidths[previewMode], border: "none", boxShadow: "none", background: "#fff" }} className="overflow-hidden bg-white">
              <iframe title="Resume Preview" srcDoc={resumeHtml} className="w-full border-none bg-white" style={{ height: "100vh", background: "#fff" }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ResumeBuilder;
