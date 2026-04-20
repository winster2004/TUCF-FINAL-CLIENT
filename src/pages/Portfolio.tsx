import React, { useEffect, useRef, useState } from 'react';
import { Download, Eye, FolderGit2, LayoutTemplate, Palette, User, Wrench } from 'lucide-react';
import PortfolioPreview from '../components/PortfolioPreview';
import { safeParseJSON } from '../lib/safeJson';
import {
  generatePortfolio,
  uploadPortfolioResume,
  type PortfolioEducation,
  type PortfolioExperience,
  type PortfolioGenerateRequest,
  type PortfolioProject,
} from '../lib/api';

type ThemeOption = 'midnight' | 'cobalt' | 'slate';
type TemplateOption = 'modern' | 'minimal' | 'split';
type BuilderSection = 'template' | 'personal' | 'experience' | 'skills' | 'projects' | 'appearance' | 'export';

interface PortfolioFormData {
  fullName: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  hireLink: string;
  profileImageUrl: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  theme: ThemeOption;
  template: TemplateOption;
}

const sections: { id: BuilderSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'template', label: 'Templates', icon: LayoutTemplate },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'experience', label: 'Experience & Education', icon: User },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'export', label: 'Export', icon: Download },
];

const initialForm: PortfolioFormData = {
  fullName: 'Winster Mano',
  title: 'Full Stack Developer',
  tagline: 'Building modern products with clean systems',
  bio: "I'm Winster Mano. Passionate developer building web applications with modern technologies.",
  email: 'you@example.com',
  location: 'Bangalore, India',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  resumeUrl: 'https://example.com/resume.pdf',
  hireLink: 'mailto:you@example.com',
  profileImageUrl: '',
  ctaPrimaryText: 'View Projects',
  ctaSecondaryText: 'Download Resume',
  skills: 'JavaScript, React, Node.js, HTML, CSS, MongoDB, Tailwind',
  education: 'B.Tech Computer Science | ABC College | 2018 - 2022',
  experience: 'Software Developer | XYZ Company | 2023 - Present | Built scalable React + Node.js modules',
  projects:
    'Responsive Website | A modern responsive website built for client work | https://example.com/project1 | HTML,CSS,JavaScript\nVanilla JS To-do | Task tracker using local storage | https://example.com/project2 | JavaScript,LocalStorage\nFast Pizza | Food ordering app with modern React stack | https://example.com/project3 | React,Node.js,API',
  theme: 'midnight',
  template: 'modern',
};

function toStringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeTheme(value: unknown): ThemeOption {
  return value === 'midnight' || value === 'cobalt' || value === 'slate' ? value : 'midnight';
}

function normalizeTemplate(value: unknown): TemplateOption {
  return value === 'modern' || value === 'minimal' || value === 'split' ? value : 'modern';
}

function normalizeFormData(raw: Partial<PortfolioFormData>): PortfolioFormData {
  return {
    fullName: toStringOr(raw.fullName, initialForm.fullName),
    title: toStringOr(raw.title, initialForm.title),
    tagline: toStringOr(raw.tagline, initialForm.tagline),
    bio: toStringOr(raw.bio, initialForm.bio),
    email: toStringOr(raw.email, initialForm.email),
    location: toStringOr(raw.location, initialForm.location),
    github: toStringOr(raw.github, initialForm.github),
    linkedin: toStringOr(raw.linkedin, initialForm.linkedin),
    resumeUrl: toStringOr(raw.resumeUrl, initialForm.resumeUrl),
    hireLink: toStringOr(raw.hireLink, initialForm.hireLink),
    profileImageUrl: toStringOr(raw.profileImageUrl, initialForm.profileImageUrl),
    ctaPrimaryText: toStringOr(raw.ctaPrimaryText, initialForm.ctaPrimaryText),
    ctaSecondaryText: toStringOr(raw.ctaSecondaryText, initialForm.ctaSecondaryText),
    skills: toStringOr(raw.skills, initialForm.skills),
    education: toStringOr(raw.education, initialForm.education),
    experience: toStringOr(raw.experience, initialForm.experience),
    projects: toStringOr(raw.projects, initialForm.projects),
    theme: normalizeTheme(raw.theme),
    template: normalizeTemplate(raw.template),
  };
}

const FORM_STORAGE_KEY = 'portfolio_builder_form_v2';
const RESUME_STORAGE_KEY = 'portfolio_builder_resume_v2';
const RESUME_NAME_STORAGE_KEY = 'portfolio_builder_resume_name_v2';
const REQUIRED_MARKERS = [
  'navbar-wrap',
  'id="hero"',
  'id="experience-education"',
  'Technical Arsenal',
  'Featured Projects',
  'id="contact"',
  'Designed with Portfolio Maker',
];

const portfolioFieldClass =
  'w-full rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500';

const Portfolio: React.FC = () => {
  const [formData, setFormData] = useState<PortfolioFormData>(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) {
      return initialForm;
    }
    const parsed = safeParseJSON<Partial<PortfolioFormData>>(saved, 'portfolio.form');
    if (!parsed || typeof parsed !== 'object') {
      return initialForm;
    }
    return normalizeFormData(parsed);
  });
  const [uploadedResumeDataUrl, setUploadedResumeDataUrl] = useState(
    () => localStorage.getItem(RESUME_STORAGE_KEY) || '',
  );
  const [uploadedResumeFileName, setUploadedResumeFileName] = useState(
    () => localStorage.getItem(RESUME_NAME_STORAGE_KEY) || 'resume.pdf',
  );
  const [activeSection, setActiveSection] = useState<BuilderSection>('template');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [previewFrameKey, setPreviewFrameKey] = useState(0);
  const [downloadName, setDownloadName] = useState('portfolio.html');
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const requestVersionRef = useRef(0);
  const safeText = (value: unknown): string => (typeof value === 'string' ? value : '');

  const parseEducation = (): PortfolioEducation[] => {
    const rows = formData.education
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return rows.map((line) => {
      const [degree, college, years] = line.split('|').map((part) => part.trim());
      return {
        degree: degree ?? '',
        college: college ?? '',
        years: years ?? '',
      };
    });
  };

  const parseExperience = (): PortfolioExperience[] => {
    const rows = formData.experience
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return rows.map((line) => {
      const [role, company, duration, description] = line.split('|').map((part) => part.trim());
      return {
        role: role ?? '',
        company: company ?? '',
        duration: duration ?? '',
        description: description ?? '',
      };
    });
  };

  const parseProjects = (): PortfolioProject[] => {
    const rows = formData.projects
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return rows.map((line) => {
      const [name, description, link, tagsRaw] = line.split('|').map((part) => part.trim());
      const techTags = (tagsRaw ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      return {
        name: name ?? '',
        description: description ?? '',
        link: link ?? '',
        techTags,
      };
    });
  };

  const getPayload = (): PortfolioGenerateRequest => ({
    fullName: formData.fullName.trim(),
    title: formData.title.trim(),
    tagline: formData.tagline.trim(),
    bio: formData.bio.trim(),
    email: formData.email.trim(),
    location: formData.location.trim(),
    github: formData.github.trim(),
    linkedin: formData.linkedin.trim(),
    resumeUrl: uploadedResumeDataUrl || formData.resumeUrl.trim(),
    hireLink: formData.hireLink.trim(),
    profileImageUrl: formData.profileImageUrl.trim(),
    resumeFileName: uploadedResumeFileName,
    ctaPrimaryText: formData.ctaPrimaryText.trim(),
    ctaSecondaryText: formData.ctaSecondaryText.trim(),
    template: formData.template,
    skills: formData.skills
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    projects: parseProjects(),
    education: parseEducation(),
    experience: parseExperience(),
    theme: formData.theme,
  });

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf') {
      setErrorMessage('Only PDF resumes are supported.');
      return;
    }

    try {
      setErrorMessage('');
      const uploaded = await uploadPortfolioResume(file);
      setUploadedResumeDataUrl(uploaded.resumeUrl || '');
      setUploadedResumeFileName(uploaded.resumeFileName || file.name || 'resume.pdf');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload resume PDF.';
      setErrorMessage(message);
    }
  };

  const refreshPreview = async () => {
    if (!formData.fullName.trim() || !formData.title.trim()) {
      return;
    }

    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await generatePortfolio(getPayload());
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      const missing = REQUIRED_MARKERS.filter((marker) => !response.html.includes(marker));
      if (missing.length > 0) {
        setErrorMessage('Generated HTML is outdated on server. Restart backend and refresh preview.');
        return;
      }

      setGeneratedHtml(response.html);
      setPreviewFrameKey((prev) => prev + 1);
      setDownloadName(response.fileName);
    } catch (error) {
      if (requestVersion === requestVersionRef.current) {
        const message = error instanceof Error ? error.message : 'Portfolio generation failed.';
        setErrorMessage(message);
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (uploadedResumeDataUrl) {
      localStorage.setItem(RESUME_STORAGE_KEY, uploadedResumeDataUrl);
      localStorage.setItem(RESUME_NAME_STORAGE_KEY, uploadedResumeFileName);
    } else {
      localStorage.removeItem(RESUME_STORAGE_KEY);
      localStorage.removeItem(RESUME_NAME_STORAGE_KEY);
    }
  }, [uploadedResumeDataUrl, uploadedResumeFileName]);

  useEffect(() => {
    void refreshPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, uploadedResumeDataUrl, uploadedResumeFileName]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    if (!generatedHtml) {
      return;
    }

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
  };

  const renderSection = () => {
    if (activeSection === 'template') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Choose Template</h3>
          <div className="grid gap-3">
            {['minimal', 'modern', 'split'].map((option) => (
              (() => {
                const isActive = formData.template === option;

                return (
              <button
                key={option}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, template: option as TemplateOption }))}
                className={`w-full rounded-xl px-6 py-4 text-left text-2xl font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-[#1f2937] text-gray-300 hover:bg-orange-500 hover:text-white'
                }`}
              >
                <p className="text-4xl font-black capitalize">{option}</p>
              </button>
                );
              })()
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'personal') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="fullName" value={safeText(formData.fullName)} onChange={handleChange} placeholder="Full name" className={portfolioFieldClass} />
            <input name="title" value={safeText(formData.title)} onChange={handleChange} placeholder="Role title" className={portfolioFieldClass} />
            <input name="email" value={safeText(formData.email)} onChange={handleChange} placeholder="Email" className={portfolioFieldClass} />
            <input name="location" value={safeText(formData.location)} onChange={handleChange} placeholder="Location" className={portfolioFieldClass} />
            <input name="github" value={safeText(formData.github)} onChange={handleChange} placeholder="GitHub URL" className={portfolioFieldClass} />
            <input name="linkedin" value={safeText(formData.linkedin)} onChange={handleChange} placeholder="LinkedIn URL" className={portfolioFieldClass} />
            <input name="resumeUrl" value={safeText(formData.resumeUrl)} onChange={handleChange} placeholder="Resume URL" className={portfolioFieldClass} />
            <input name="hireLink" value={safeText(formData.hireLink)} onChange={handleChange} placeholder="Hire link / mailto" className={portfolioFieldClass} />
          </div>
          <input name="profileImageUrl" value={safeText(formData.profileImageUrl)} onChange={handleChange} placeholder="Profile image URL" className={portfolioFieldClass} />
          <input name="tagline" value={safeText(formData.tagline)} onChange={handleChange} placeholder="Tagline" className={portfolioFieldClass} />
          <textarea name="bio" value={safeText(formData.bio)} onChange={handleChange} placeholder="Short intro" className={`${portfolioFieldClass} h-24 resize-none`} />
        </div>
      );
    }

    if (activeSection === 'experience') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Experience & Education</h3>
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-800">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Upload Resume (PDF)</label>
            <input type="file" accept="application/pdf,.pdf" onChange={handleResumeUpload} className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#111827] file:px-4 file:py-2 file:text-gray-200 hover:file:bg-white/5" />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              {uploadedResumeDataUrl
                ? `Uploaded: ${uploadedResumeFileName}. Navbar Resume button will download this PDF.`
                : 'No PDF uploaded yet. You can still use the Resume URL field in Personal Info.'}
            </p>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Education format: Degree | College | Years</p>
          <textarea name="education" value={safeText(formData.education)} onChange={handleChange} className={`${portfolioFieldClass} h-24 resize-none`} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Experience format: Role | Company | Duration | Description</p>
          <textarea name="experience" value={safeText(formData.experience)} onChange={handleChange} className={`${portfolioFieldClass} h-28 resize-none`} />
        </div>
      );
    }

    if (activeSection === 'skills') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Technical Arsenal</h3>
          <textarea
            name="skills"
            value={safeText(formData.skills)}
            onChange={handleChange}
            placeholder="Comma-separated skills"
            className={`${portfolioFieldClass} h-32 resize-none`}
          />
        </div>
      );
    }

    if (activeSection === 'projects') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured Projects</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Format: Title | Description | URL | tag1,tag2,tag3</p>
          <textarea
            name="projects"
            value={safeText(formData.projects)}
            onChange={handleChange}
            className={`${portfolioFieldClass} h-36 resize-none`}
          />
        </div>
      );
    }

    if (activeSection === 'appearance') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="theme" value={normalizeTheme(formData.theme)} onChange={handleChange} className={portfolioFieldClass}>
              <option value="midnight">Midnight</option>
              <option value="cobalt">Cobalt</option>
              <option value="slate">Slate</option>
            </select>
            <div />
            <input name="ctaPrimaryText" value={safeText(formData.ctaPrimaryText)} onChange={handleChange} placeholder="Primary CTA text" className={portfolioFieldClass} />
            <input name="ctaSecondaryText" value={safeText(formData.ctaSecondaryText)} onChange={handleChange} placeholder="Secondary CTA text" className={portfolioFieldClass} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Export</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void refreshPreview()} className="flex items-center gap-2 rounded-xl px-4 py-2 tucf-btn-primary">
            <Eye className="h-4 w-4" />
            Refresh Preview
          </button>
          <button type="button" onClick={handleDownload} disabled={!generatedHtml} className="flex items-center gap-2 rounded-xl px-4 py-2 tucf-btn-primary disabled:opacity-50">
            <Download className="h-4 w-4" />
            Download HTML
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Portfolio Builder</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Live builder that exports complete responsive portfolio HTML.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_1.15fr] gap-5 flex-1 overflow-hidden">
        <aside className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <div className="p-5 border-b" style={{ borderBottomColor: 'var(--border)' }}>
            <p className="font-bold text-2xl">Portfolio-Maker</p>
          </div>
          <nav className="p-4 space-y-2 overflow-y-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition"
                  style={active ? { background: 'rgba(255,122,0,0.15)', color: 'var(--accent)' } : { color: 'var(--text-secondary)' }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-2xl overflow-hidden flex flex-col" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div className="p-5 border-b" style={{ borderBottomColor: 'var(--border)' }}>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Builder Panel</h2>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {renderSection()}
            {errorMessage && <p className="text-sm" style={{ color: 'var(--accent)' }}>{errorMessage}</p>}
          </div>
        </section>

        <PortfolioPreview generatedHtml={generatedHtml} previewKey={previewFrameKey} isGenerating={isGenerating} />
      </div>

      <div className="mt-3 flex items-center gap-3 px-5">
        <button type="button" onClick={handleDownload} disabled={!generatedHtml} className="flex items-center gap-2 rounded-xl px-4 py-2 tucf-btn-primary disabled:opacity-50">
          <Download className="h-4 w-4" />
          Download
        </button>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Output file: {downloadName}</p>
      </div>
    </div>
  );
};

export default Portfolio;
