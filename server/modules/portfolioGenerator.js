const THEMES = {
  midnight: {
    bgStart: '#020817',
    bgEnd: '#070f2e',
    nav: '#091233',
    surface: '#0d173a',
    card: '#111f4a',
    text: '#f8fafc',
    muted: '#94a3b8',
    accent: '#60a5fa',
    border: 'rgba(148,163,184,.24)',
  },
  cobalt: {
    bgStart: '#031229',
    bgEnd: '#102a5f',
    nav: '#081b41',
    surface: '#0e285d',
    card: '#12356f',
    text: '#f8fafc',
    muted: '#bfdbfe',
    accent: '#93c5fd',
    border: 'rgba(147,197,253,.27)',
  },
  slate: {
    bgStart: '#0b1220',
    bgEnd: '#1e293b',
    nav: '#111827',
    surface: '#182436',
    card: '#1f2d40',
    text: '#f8fafc',
    muted: '#cbd5e1',
    accent: '#a5b4fc',
    border: 'rgba(148,163,184,.24)',
  },
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(value) {
  const input = String(value || '').trim();
  if (!input) {
    return '#';
  }
  if (input.startsWith('/')) {
    return input;
  }
  if (input.startsWith('#')) {
    return input;
  }
  if (input.startsWith('data:')) {
    return input;
  }
  if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('mailto:')) {
    return input;
  }
  return `https://${input}`;
}

function firstChar(value) {
  const text = String(value || '').trim();
  return text ? text.charAt(0).toUpperCase() : 'D';
}

function ensureEducation(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => ({
      degree: escapeHtml(item.degree || 'B.Tech Computer Science'),
      college: escapeHtml(item.college || 'College Name'),
      years: escapeHtml(item.years || '2018 - 2022'),
    }));
  }
  return [{ degree: 'B.Tech Computer Science', college: 'College Name', years: '2018 - 2022' }];
}

function ensureExperience(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => ({
      role: escapeHtml(item.role || 'Software Developer'),
      company: escapeHtml(item.company || 'Company Name'),
      duration: escapeHtml(item.duration || '2023 - Present'),
      description: escapeHtml(item.description || 'Worked on modern web applications and backend APIs.'),
    }));
  }
  return [{
    role: 'Software Developer',
    company: 'Company Name',
    duration: '2023 - Present',
    description: 'Worked on modern web applications and backend APIs.',
  }];
}

function ensureProjects(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => ({
      name: escapeHtml(item.name || 'Project Name'),
      description: escapeHtml(item.description || 'Project description goes here.'),
      link: safeUrl(item.link || '#'),
      techTags: Array.isArray(item.techTags) && item.techTags.length > 0
        ? item.techTags.map((tag) => escapeHtml(tag))
        : ['React', 'Node.js'],
    }));
  }
  return [
    { name: 'Responsive Website', description: 'A responsive website with modern UI.', link: '#', techTags: ['HTML', 'CSS', 'JavaScript'] },
    { name: 'Vanilla JS To-do', description: 'Simple task manager built with vanilla JavaScript.', link: '#', techTags: ['JavaScript', 'LocalStorage'] },
    { name: 'Fast Pizza', description: 'Food ordering app with API integration.', link: '#', techTags: ['React', 'API'] },
  ];
}

function ensureSkills(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data.map((skill) => escapeHtml(skill));
  }
  return ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB', 'Tailwind'];
}

export function generatePortfolioPage(input) {
  const themeName = THEMES[input.theme] ? input.theme : 'midnight';
  const theme = THEMES[themeName];

  const fullName = escapeHtml(input.fullName || 'Developer Name');
  const title = escapeHtml(input.title || 'Full Stack Developer');
  const intro = escapeHtml(input.bio || 'Passionate developer building web applications with modern technologies.');
  const tagline = escapeHtml(input.tagline || 'Building modern digital experiences.');
  const profileImageUrl = safeUrl(input.profileImageUrl || '');
  const github = safeUrl(input.github || '#');
  const linkedin = safeUrl(input.linkedin || '#');
  const email = escapeHtml(input.email || 'you@example.com');
  const resumeUrl = safeUrl(input.resumeUrl || '#');
  const resumeFileName = escapeHtml(input.resumeFileName || 'resume.pdf');
  const hireLink = safeUrl(input.hireLink || `mailto:${email}`);
  const ctaPrimaryText = escapeHtml(input.ctaPrimaryText || 'View Projects');
  const ctaSecondaryText = escapeHtml(input.ctaSecondaryText || 'Download Resume');
  const contactBlurb = 'Available for freelance work, product engineering, and full-time opportunities.';
  const resumeIsDataPdf = resumeUrl.startsWith('data:application/pdf');

  const skills = ensureSkills(input.skills);
  const projects = ensureProjects(input.projects);
  const education = ensureEducation(input.education);
  const experience = ensureExperience(input.experience);

  const projectCards = projects
    .map((project) => `
      <article class="project-card">
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <div class="tags">${project.techTags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        <a class="link-btn" href="${project.link}" target="_blank" rel="noreferrer">View Project</a>
      </article>
    `)
    .join('');

  const educationTimeline = education
    .map((item) => `
      <div class="timeline-item">
        <h4>${item.degree}</h4>
        <p class="line-muted">${item.college}</p>
        <p class="line-muted">${item.years}</p>
      </div>
    `)
    .join('');

  const experienceTimeline = experience
    .map((item) => `
      <div class="timeline-item">
        <h4>${item.role}</h4>
        <p class="line-muted">${item.company} - ${item.duration}</p>
        <p>${item.description}</p>
      </div>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullName} | Portfolio</title>
  <style>
    :root {
      --bg-start: ${theme.bgStart};
      --bg-end: ${theme.bgEnd};
      --nav: ${theme.nav};
      --surface: ${theme.surface};
      --card: ${theme.card};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --accent: ${theme.accent};
      --border: ${theme.border};
      --max: 1200px;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      color: var(--text);
      background: radial-gradient(circle at 68% 50%, rgba(99,102,241,.20), transparent 34%),
        linear-gradient(145deg, var(--bg-start), var(--bg-end));
    }
    body.light-mode {
      --bg-start: #eef2ff;
      --bg-end: #e2e8f0;
      --nav: #ffffff;
      --surface: #ffffff;
      --card: #f8fafc;
      --text: #0f172a;
      --muted: #475569;
      --accent: #2563eb;
      --border: rgba(15,23,42,.16);
    }
    .container { width: min(var(--max), 92vw); margin: 0 auto; }
    section { padding: 70px 0; }
    h2 { font-size: clamp(1.5rem, 2.6vw, 2.3rem); margin: 0 0 20px; letter-spacing: -0.02em; }
    p { line-height: 1.6; }
    .muted { color: var(--muted); }

    /* 1. Navbar */
    .navbar-wrap {
      position: sticky;
      top: 0;
      z-index: 60;
      background: color-mix(in srgb, var(--nav) 92%, black);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(7px);
    }
    .navbar {
      height: 84px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
    }
    .brand { font-size: clamp(1.12rem, 2vw, 1.8rem); font-weight: 800; display: flex; align-items: center; gap: 10px; letter-spacing: -0.02em; white-space: nowrap; }
    .brand i { color: var(--accent); }
    .nav-links { display: flex; gap: 28px; align-items: center; font-weight: 700; margin-left: auto; margin-right: 16px; }
    .nav-links a { color: var(--muted); text-decoration: none; }
    .nav-links a:hover { color: var(--text); }
    .resume-btn {
      color: var(--text) !important;
      background: rgba(148,163,184,.26);
      border: 1px solid var(--border);
      border-radius: 11px;
      padding: 11px 18px;
    }
    .sun-btn {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #facc15;
      background: rgba(148,163,184,.14);
    }
    .menu-btn {
      display: none;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(148,163,184,.14);
      color: var(--text);
      font-size: 23px;
      line-height: 1;
      cursor: pointer;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* 2. Hero Section */
    #hero .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 40px;
      align-items: center;
      min-height: calc(100vh - 120px);
    }
    .hero-copy h1 {
      margin: 0 0 12px;
      font-size: clamp(2.2rem, 6vw, 5.2rem);
      line-height: 1.03;
      letter-spacing: -0.03em;
    }
    .hero-copy .tagline { margin: 0 0 10px; color: var(--accent); font-weight: 700; }
    .hero-copy .intro { margin: 0 0 24px; color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.9rem); max-width: 24ch; }
    .hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
    .btn {
      display: inline-flex;
      text-decoration: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 999px;
      padding: 11px 20px;
      border: 1px solid var(--border);
      font-weight: 700;
    }
    .btn-ghost { color: var(--text); background: transparent; }
    .btn-solid { color: var(--text); background: rgba(148,163,184,.20); }
    .social-icons { display: flex; gap: 10px; }
    .social-icons a {
      width: 38px; height: 38px;
      display: inline-flex; align-items: center; justify-content: center;
      text-decoration: none; color: var(--text);
      border: 1px solid var(--border);
      border-radius: 10px;
      background: rgba(148,163,184,.10);
      font-weight: 700;
    }
    .hero-image-wrap { display: flex; justify-content: center; position: relative; }
    .hero-image {
      width: min(430px, 84vw);
      aspect-ratio: 1/1;
      border-radius: 999px;
      border: 9px solid var(--border);
      background: linear-gradient(145deg, #cbd5e1, #94a3b8);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      font-weight: 800;
      font-size: clamp(3rem, 9vw, 6rem);
    }
    .hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* 3. Experience & Education */
    #experience-education .grid-2 {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .panel {
      background: color-mix(in srgb, var(--surface) 92%, black);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
    }
    .timeline-item {
      position: relative;
      padding: 0 0 16px 18px;
      border-left: 2px solid color-mix(in srgb, var(--accent) 44%, transparent);
      margin-left: 6px;
    }
    .timeline-item::before {
      content: "";
      position: absolute;
      left: -7px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--accent);
    }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-item h4 { margin: 0 0 6px; }
    .line-muted { margin: 0 0 5px; color: var(--muted); font-size: .95rem; }

    /* 4. Technical Arsenal (Skills) */
    #skills .pill-wrap { display: flex; flex-wrap: wrap; gap: 12px; }
    .skill-pill {
      border: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(148,163,184,.18), rgba(148,163,184,.08));
      color: var(--text);
      border-radius: 999px;
      padding: 9px 16px;
      font-size: .9rem;
      font-weight: 700;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
    }

    /* 5. Featured Projects */
    #projects .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 14px;
    }
    .project-card {
      border: 1px solid var(--border);
      border-radius: 16px;
      background: color-mix(in srgb, var(--card) 92%, black);
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: 220px;
    }
    .project-card h3 { margin: 0 0 10px; }
    .project-card p { margin: 0 0 12px; color: var(--muted); flex: 1; }
    .tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
    .tag {
      font-size: .78rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 10px;
      color: var(--accent);
      background: rgba(96,165,250,.12);
    }
    .link-btn {
      text-decoration: none;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 10px;
      text-align: center;
      padding: 9px 10px;
      font-weight: 700;
      background: rgba(148,163,184,.14);
    }

    /* 6. Hire / Contact Section */
    #contact .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .contact-form {
      background: color-mix(in srgb, var(--surface) 92%, black);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: grid;
      gap: 10px;
    }
    .contact-form input, .contact-form textarea {
      width: 100%;
      padding: 11px 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: rgba(15,23,42,.35);
      color: var(--text);
      font: inherit;
    }
    .contact-form textarea { min-height: 120px; resize: vertical; }
    .contact-form button {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      color: var(--text);
      background: color-mix(in srgb, var(--accent) 30%, var(--surface));
      font-weight: 700;
      cursor: pointer;
    }

    /* 7. Footer */
    footer {
      border-top: 1px solid var(--border);
      text-align: center;
      padding: 26px 0 34px;
      color: var(--muted);
      font-size: .94rem;
    }

    @media (max-width: 980px) {
      .container { width: min(var(--max), calc(100vw - 36px)); }
      .navbar { height: 76px; }
      .menu-btn { display: inline-flex; align-items: center; justify-content: center; }
      .nav-links {
        display: none;
        position: absolute;
        top: calc(100% + 12px);
        left: 0;
        right: 0;
        margin: 0;
        padding: 16px;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        background: color-mix(in srgb, var(--nav) 96%, black);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0,0,0,.3);
      }
      .nav-links.open { display: flex; }
      .nav-links a {
        color: var(--text);
        display: block;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(148,163,184,.08);
      }
      .resume-btn { text-align: center; }
      #hero .hero-grid { grid-template-columns: 1fr; min-height: auto; }
      .hero-image-wrap { display: none; }
      #hero { padding-top: 34px; }
      .hero-copy .intro { max-width: none; }
      #experience-education .grid-2,
      #contact .contact-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      section { padding: 48px 0; }
      .hero-copy h1 { font-size: clamp(2rem, 12vw, 4rem); }
      .hero-actions { gap: 12px; }
      .btn { width: 100%; }
      .social-icons { flex-wrap: wrap; }
      .project-card { min-height: 0; }
    }
  </style>
</head>
<body>
  <!-- 1. Navbar -->
  <header class="navbar-wrap">
    <nav class="navbar container">
      <div class="brand"><i>&lt;/&gt;</i>${fullName.replace(/\s+/g, '')}Portfolio</div>
      <div class="nav-links" id="navLinks">
        <a href="#hero">Home</a>
        <a href="#experience-education">Path</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a
          class="resume-btn"
          href="${resumeUrl}"
          id="resumeDownloadBtn"
          data-resume-url="${resumeUrl}"
          data-resume-name="${resumeFileName}"
          ${resumeIsDataPdf ? '' : 'download'}
        >
          Download Resume
        </a>
        <a href="#contact">Hire Me</a>
      </div>
      <div class="nav-actions">
        <button type="button" id="themeToggle" class="sun-btn" aria-label="Toggle theme">Mode</button>
        <button type="button" id="menuToggle" class="menu-btn" aria-label="Toggle navigation">=</button>
      </div>
    </nav>
  </header>

  <!-- 2. Hero Section -->
  <section id="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1>${title}</h1>
        <p class="tagline">${fullName} - ${tagline}</p>
        <p class="intro">${intro}</p>
        <div class="hero-actions">
          <a class="btn btn-ghost" href="#projects">${ctaPrimaryText}</a>
          <a class="btn btn-solid" href="${resumeUrl}" target="_blank" rel="noreferrer">${ctaSecondaryText}</a>
        </div>
        <div class="social-icons">
          <a href="${github}" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
          <a href="${linkedin}" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
          <a href="mailto:${email}" aria-label="Email">@</a>
        </div>
      </div>
      <div class="hero-image-wrap">
        <div class="hero-image">
          ${
            profileImageUrl !== '#'
              ? `<img src="${profileImageUrl}" alt="${fullName}" />`
              : `<span>${firstChar(fullName)}</span>`
          }
        </div>
      </div>
    </div>
  </section>

  <!-- 3. Experience & Education -->
  <section id="experience-education">
    <div class="container">
      <h2>Experience & Education</h2>
      <div class="grid-2">
        <article class="panel">
          <h3>Education</h3>
          ${educationTimeline}
        </article>
        <article class="panel">
          <h3>Work History</h3>
          ${experienceTimeline}
        </article>
      </div>
    </div>
  </section>

  <!-- 4. Technical Arsenal (Skills) -->
  <section id="skills">
    <div class="container">
      <h2>Technical Arsenal</h2>
      <div class="pill-wrap">
        ${skills.map((skill) => `<span class="skill-pill">${skill}</span>`).join('')}
      </div>
    </div>
  </section>

  <!-- 5. Featured Projects -->
  <section id="projects">
    <div class="container">
      <h2>Featured Projects</h2>
      <div class="project-grid">
        ${projectCards}
      </div>
    </div>
  </section>

  <!-- 6. Hire / Contact Section -->
  <section id="contact">
    <div class="container">
      <h2>Let's work together</h2>
      <div class="contact-grid">
        <article class="panel">
          <p class="muted">${contactBlurb}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:var(--accent);text-decoration:none;">${email}</a></p>
          <p><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank" rel="noreferrer" style="color:var(--accent);text-decoration:none;">View Profile</a></p>
          <p><a class="link-btn" href="${hireLink}" target="_blank" rel="noreferrer">Hire / Contact Link</a></p>
        </article>
        <form class="contact-form" id="contactForm">
          <input type="text" name="name" placeholder="Name" required />
          <input type="email" name="email" placeholder="Email" required />
          <textarea name="message" placeholder="Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- 7. Footer -->
  <footer>
    <div class="container">
      <p>Copyright <span id="year"></span> ${fullName}</p>
      <p>All rights reserved</p>
      <p>Designed with Portfolio Maker</p>
    </div>
  </footer>

  <script>
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
      });
    }

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }

    const resumeBtn = document.getElementById('resumeDownloadBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const url = resumeBtn.getAttribute('data-resume-url') || '#';
        const fileName = resumeBtn.getAttribute('data-resume-name') || 'resume.pdf';
        if (!url || url === '#') {
          alert('No resume uploaded or configured yet.');
          return;
        }

        const absoluteUrl = new URL(url, window.location.origin).href;

        try {
          const response = await fetch(absoluteUrl, { credentials: 'include' });
          if (!response.ok) {
            throw new Error('Resume request failed.');
          }
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error('Resume download failed:', error);
          window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
        }
      });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = form.querySelector('input[name="name"]')?.value?.trim() || '';
        const senderEmail = form.querySelector('input[name="email"]')?.value?.trim() || '';
        const message = form.querySelector('textarea[name="message"]')?.value?.trim() || '';
        const toEmail = ${JSON.stringify(email)};
        const subject = encodeURIComponent('Portfolio Contact - ' + (name || 'New Message'));
        const body = encodeURIComponent(
          'Name: ' + (name || '-') + '\\n' +
          'Sender Email: ' + (senderEmail || '-') + '\\n\\n' +
          'Message:\\n' + (message || '-')
        );

        const gmailComposeUrl =
          'https://mail.google.com/mail/?view=cm&fs=1&to=' +
          encodeURIComponent(toEmail) +
          '&su=' + subject +
          '&body=' + body;

        window.location.href = gmailComposeUrl;
      });
    }
  </script>
</body>
</html>`;
}
