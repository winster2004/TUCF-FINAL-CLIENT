import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Paperclip, Plus, Send, X } from 'lucide-react';
import { getGroqApiKey } from '../lib/groq';
import { safeParseJSON } from '../lib/safeJson';
import './ChatbotAssistant.css';

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<ChatbotPdfDocument> };
    };
  }
}

interface ChatbotPdfTextItem {
  str: string;
}

interface ChatbotPdfPage {
  getTextContent: () => Promise<{ items: ChatbotPdfTextItem[] }>;
}

interface ChatbotPdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<ChatbotPdfPage>;
}

type ChatbotApiMessage =
  | { role: 'system' | 'assistant' | 'user'; content: string }
  | {
      role: 'user';
      content: Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
    };

interface ChatbotDisplayFile {
  name: string;
  type: string;
  previewUrl?: string;
}

interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: string;
  file?: ChatbotDisplayFile;
  isTyping?: boolean;
}

const CHATBOT_TEXT_MODEL = 'llama-3.1-8b-instant';
const CHATBOT_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const CHATBOT_WELCOME_MESSAGE = `Hi! I'm your AI Career Assistant.

I can help you with:
- Resume Review - upload your PDF
- ATS Optimization - rewrite + generate LaTeX
- Image Analysis - upload any image
- Interview Prep - role-specific questions
- Career Advice - jobs, salary, skills

Type anything or click the attachment button to upload a file!`;

function chatbot_generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function chatbot_formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function chatbot_escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function chatbot_renderMarkdown(text: string) {
  const escaped = chatbot_escapeHtml(text);
  return escaped
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:#0d1117;padding:12px;border-radius:8px;overflow-x:auto;font-size:12px;border:1px solid #2a2a2a"><code>$1</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^#### (.*$)/gm, '<h5 style="color:#f97316;margin:6px 0">$1</h5>')
    .replace(/^### (.*$)/gm, '<h4 style="color:#f97316;margin:8px 0">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="color:#f97316;margin:8px 0">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="color:#f97316;margin:10px 0">$1</h2>')
    .replace(/^\d+\. (.*$)/gm, '<li style="margin:4px 0;list-style:decimal inside">$1</li>')
    .replace(/^[-•] (.*$)/gm, '<li style="margin:4px 0;list-style:disc inside">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function chatbot_generateLatexTemplate() {
  return (
    '\\\\documentclass[letterpaper,10pt]{article}\n' +
    '\\\\usepackage[empty]{fullpage}\n' +
    '\\\\usepackage{titlesec}\n' +
    '\\\\usepackage{enumitem}\n' +
    '\\\\usepackage[hidelinks]{hyperref}\n' +
    '\\\\usepackage{tabularx}\n' +
    '\\\\pagestyle{empty}\n' +
    '\\\\addtolength{\\\\oddsidemargin}{-0.5in}\n' +
    '\\\\addtolength{\\\\textwidth}{1in}\n' +
    '\\\\addtolength{\\\\topmargin}{-0.7in}\n' +
    '\\\\addtolength{\\\\textheight}{1.4in}\n' +
    '\\\\urlstyle{same}\n' +
    '\\\\setlist[itemize]{noitemsep, topsep=1pt, parsep=0pt, partopsep=0pt}\n' +
    '\\\\titleformat{\\\\section}{\\\\bfseries}{}{0em}{}[\\\\titlerule]\n' +
    '\\\\titlespacing{\\\\section}{0pt}{4pt}{3pt}\n' +
    '\\\\setlength{\\\\parskip}{0pt}\n' +
    '\\\\setlength{\\\\parsep}{0pt}\n' +
    '\\\\begin{document}\n' +
    '\\\\vspace{-8pt}\n\n' +
    '% HEADER\n' +
    '\\\\begin{center}\n' +
    '{\\\\Large \\\\textbf{WINSTER MANO}}\\\\\\\\\n' +
    '\\\\vspace{2pt}\n' +
    '{\\\\small PHONE $|$ +91 8610913767}\\\\\\\\\n' +
    '\\\\vspace{1pt}\n' +
    '{\\\\small \\\\href{mailto:EMAIL}{EMAIL} $|$ \\\\href{LINKEDIN}{linkedin} $|$ \\\\href{GITHUB}{github}}\n' +
    '\\\\end{center}\n' +
    '\\\\vspace{-4pt}\n\n' +
    '% SUMMARY\n' +
    '\\\\section{SUMMARY}\n' +
    '\\\\vspace{-4pt}\n' +
    '[ATS-optimized summary with relevant keywords, 3-4 sentences]\n\n' +
    '% SKILLS\n' +
    '\\\\section{TECHNICAL SKILLS}\n' +
    '\\\\vspace{-4pt}\n' +
    '\\\\textbf{Languages \\\\& Core:} ${data.skillsLanguages}\\\\\\\\[-2pt]\n' +
    '\\\\textbf{Backend \\\\& Frameworks:} ${data.skillsBackend}\\\\\\\\[-2pt]\n' +
    '\\\\textbf{Databases:} ${data.skillsDatabases}\\\\\\\\[-2pt]\n' +
    '\\\\textbf{Tools \\\\& Practices:} ${data.skillsTools}\n' +
    '\\\\vspace{-4pt}\n\n' +
    '% EXPERIENCE\n' +
    '\\\\section{PROFESSIONAL EXPERIENCE}\n' +
    '\\\\vspace{-4pt}\n' +
    '\\\\textbf{Company Name} \\\\hfill Location\n' +
    '\\\\textit{Job Title} \\\\hfill Start -- End\n' +
    '\\\\vspace{-6pt}\n' +
    '\\\\begin{itemize}\n' +
    '\\\\item [bullet with action verb + metric]\n' +
    '\\\\item [bullet with action verb + metric]\n' +
    '\\\\end{itemize}\n\n' +
    '% PROJECTS\n' +
    '\\\\section{PROJECTS}\n' +
    '\\\\vspace{-4pt}\n' +
    '\\\\textbf{\\\\href{github_url}{Project Name}} \\\\hfill Start -- End\n' +
    'Tech Stack\n' +
    '\\\\vspace{-6pt}\n' +
    '\\\\begin{itemize}\n' +
    '\\\\item [bullet]\n' +
    '\\\\end{itemize}\n\n' +
    '% EDUCATION\n' +
    '\\\\section{EDUCATION}\n' +
    '\\\\vspace{-4pt}\n' +
    '\\\\textbf{${data.college}} \\\\hfill ${data.eduLocation}\\\\\\\\\n' +
    '${data.degree} \\\\hfill ${data.eduStart} -- ${data.eduEnd}\\\\\\\\\n' +
    'CGPA: ${data.cgpa}\n\n' +
    '\\\\end{document}'
  );
}

async function chatbot_ensurePdfJs() {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-chatbot-pdfjs="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load PDF.js.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.dataset.chatbotPdfjs = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PDF.js.'));
    document.body.appendChild(script);
  });

  if (!window.pdfjsLib) {
    throw new Error('PDF.js did not initialize.');
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
}

async function chatbot_extractPDFText(file: File) {
  const pdfjsLib = await chatbot_ensurePdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }

  return text;
}

async function chatbot_fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

async function chatbot_streamGroq(
  messages: ChatbotApiMessage[],
  model: string,
  onChunk: (token: string, fullText: string) => void,
  onDone: (fullText: string) => void,
  onError: (message: string) => void,
) {
  const apiKey = localStorage.getItem('groq_api_key');
  if (!apiKey) {
    onError('No API key found. Please add your Groq key in Settings.');
    return;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        stream: true,
        messages,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      onError(errorPayload?.error?.message || `Groq API error ${response.status}`);
      return;
    }

    if (!response.body) {
      onError('Streaming response body was not available.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) {
          continue;
        }

        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          onDone(fullText);
          return;
        }

        try {
          const parsed = safeParseJSON<{ choices?: Array<{ delta?: { content?: string } }> }>(
            data,
            'chatbot.sse',
          );
          if (!parsed) {
            continue;
          }
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            fullText += token;
            onChunk(token, fullText);
          }
        } catch {
          // Ignore malformed partial SSE lines.
        }
      }
    }

    onDone(fullText);
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unexpected streaming error.');
  }
}

function chatbot_extractLatex(fullText: string) {
  const match = fullText.match(/```latex([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }

  const start = fullText.indexOf('\\documentclass');
  const end = fullText.indexOf('\\end{document}');
  if (start !== -1 && end !== -1) {
    return fullText.substring(start, end + '\\end{document}'.length).trim();
  }

  return fullText;
}

const ChatbotAssistant: React.FC = () => {
  const [chatbot_messages, setChatbot_messages] = useState<ChatbotMessage[]>(() => [
    {
      id: chatbot_generateId(),
      role: 'assistant',
      content: CHATBOT_WELCOME_MESSAGE,
      timestamp: chatbot_formatTime(),
    },
  ]);
  const [chatbot_history, setChatbot_history] = useState<ChatbotApiMessage[]>([]);
  const [chatbot_resumeText, setChatbot_resumeText] = useState('');
  const [chatbot_currentFile, setChatbot_currentFile] = useState<File | null>(null);
  const [chatbot_currentFilePreview, setChatbot_currentFilePreview] = useState<string>('');
  const [chatbot_input, setChatbot_input] = useState('');
  const [chatbot_streaming, setChatbot_streaming] = useState(false);
  const [chatbot_toast, setChatbot_toast] = useState('');

  const chatbot_messagesRef = useRef<HTMLDivElement | null>(null);
  const chatbot_textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatbot_fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatbot_hasApiKey = useMemo(() => Boolean(getGroqApiKey()), []);

  const chatbot_scrollBottom = () => {
    if (chatbot_messagesRef.current) {
      chatbot_messagesRef.current.scrollTop = chatbot_messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    chatbot_scrollBottom();
  }, [chatbot_messages]);

  useEffect(() => {
    if (!chatbot_textareaRef.current) {
      return;
    }

    chatbot_textareaRef.current.style.height = 'auto';
    const maxHeight = 24 * 5 + 24;
    chatbot_textareaRef.current.style.height = `${Math.min(chatbot_textareaRef.current.scrollHeight, maxHeight)}px`;
    chatbot_textareaRef.current.style.overflowY = chatbot_textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [chatbot_input]);

  useEffect(() => {
    if (!chatbot_toast) {
      return;
    }

    const timeout = window.setTimeout(() => setChatbot_toast(''), 2000);
    return () => window.clearTimeout(timeout);
  }, [chatbot_toast]);

  const chatbot_setSendDisabled = (disabled: boolean) => {
    setChatbot_streaming(disabled);
  };

  const chatbot_resetChat = () => {
    setChatbot_history([]);
    setChatbot_resumeText('');
    setChatbot_currentFile(null);
    setChatbot_currentFilePreview('');
    setChatbot_input('');
    setChatbot_messages([
      {
        id: chatbot_generateId(),
        role: 'assistant',
        content: CHATBOT_WELCOME_MESSAGE,
        timestamp: chatbot_formatTime(),
      },
    ]);
  };

  const chatbot_clearFilePreview = () => {
    setChatbot_currentFile(null);
    setChatbot_currentFilePreview('');
    if (chatbot_fileInputRef.current) {
      chatbot_fileInputRef.current.value = '';
    }
  };

  const chatbot_appendUserBubble = (text: string, file: File | null, previewUrl?: string) => {
    const fileInfo = file
      ? {
          name: file.name,
          type: file.type,
          previewUrl,
        }
      : undefined;

    setChatbot_messages((current) => [
      ...current,
      {
        id: chatbot_generateId(),
        role: 'user',
        content: text,
        file: fileInfo,
        timestamp: chatbot_formatTime(),
      },
    ]);
  };

  const chatbot_appendAIBubble = () => {
    const id = chatbot_generateId();
    setChatbot_messages((current) => [
      ...current,
      {
        id,
        role: 'assistant',
        content: '',
        timestamp: chatbot_formatTime(),
        isTyping: true,
      },
    ]);
    return id;
  };

  const chatbot_updateBubble = (messageId: string, content: string, role: 'assistant' | 'error' = 'assistant') => {
    setChatbot_messages((current) =>
      current.map((message) =>
        message.id === messageId
          ? { ...message, role, content, isTyping: false, timestamp: chatbot_formatTime() }
          : message,
      ),
    );
  };

  const chatbot_showTyping = (messageId: string) => {
    setChatbot_messages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, isTyping: true } : message,
      ),
    );
  };

  const chatbot_hideTyping = (messageId: string) => {
    setChatbot_messages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, isTyping: false } : message,
      ),
    );
  };

  const chatbot_handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      return;
    }

    setChatbot_currentFile(file);
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setChatbot_currentFilePreview(previewUrl);
    } else {
      setChatbot_currentFilePreview('');
    }
  };

  const chatbot_handleCopyLatex = async (fullText: string) => {
    const latex = chatbot_extractLatex(fullText);
    await navigator.clipboard.writeText(latex);
    setChatbot_toast('Copied!');
  };

  const chatbot_handleDownloadLatex = (fullText: string) => {
    const latex = chatbot_extractLatex(fullText);
    const blob = new Blob([latex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'improved_resume.tex';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const chatbot_send = async () => {
    const userText = chatbot_input.trim();
    const file = chatbot_currentFile;
    if (!userText && !file) {
      return;
    }

    const currentPreview = chatbot_currentFilePreview;
    chatbot_appendUserBubble(userText, file, currentPreview);
    setChatbot_input('');
    chatbot_setSendDisabled(true);

    let fileContext = '';
    let isImage = false;
    let base64 = '';
    let imgType = '';

    try {
      if (file) {
        if (file.type === 'application/pdf') {
          fileContext = await chatbot_extractPDFText(file);
          setChatbot_resumeText(fileContext);
        } else if (file.type.startsWith('image/')) {
          isImage = true;
          base64 = await chatbot_fileToBase64(file);
          imgType = file.type;
        }
      }
    } catch (error) {
      const bubbleId = chatbot_appendAIBubble();
      chatbot_updateBubble(
        bubbleId,
        `Error: ${error instanceof Error ? error.message : 'Failed to read the uploaded file.'}`,
        'error',
      );
      chatbot_setSendDisabled(false);
      chatbot_clearFilePreview();
      return;
    }

    chatbot_clearFilePreview();

    const effectiveResumeText = fileContext || chatbot_resumeText;
    const systemPrompt = `You are an expert resume writer and ATS optimization specialist.

When a user uploads a resume and asks to improve it or make it ATS friendly:

STEP 1 - ANALYZE:
Briefly list the missing ATS keywords and what needs improvement (5-6 lines max).

STEP 2 - REWRITE THE FULL LATEX RESUME:
Generate the COMPLETE improved resume as LaTeX code using EXACTLY this template structure:

${chatbot_generateLatexTemplate()}

STRICT LATEX RULES:
- ALWAYS use \\documentclass[letterpaper,10pt]{article} — NEVER use moderncv
- ALWAYS use \\hfill for right-aligned dates
- ALWAYS use \\textbf{} for company/project names
- ALWAYS use \\textit{} for job titles
- ALWAYS use \\begin{itemize} \\item \\end{itemize} for bullets
- ALWAYS use \\href{url}{text} for links
- ALWAYS bold metrics like \\textbf{25\\%}
- NEVER use \\cvline, \\cventry, or any moderncv commands
- The LaTeX must be 100% complete and compilable on Overleaf immediately
- Include ALL sections from the original resume
- DO NOT use \\subsection or \\subsubsection in skills
- Wrap entire LaTeX in triple backticks: \`\`\`latex ... \`\`\`

STEP 3 - ATS SCORE:
After the LaTeX block, show:
- Estimated ATS Score: XX%
- Top 5 keywords added
- What was improved (3 bullet points)

For all other questions (not resume related), answer helpfully and concisely.${effectiveResumeText ? `\nUser's Resume Content:\n${effectiveResumeText}` : ''}`;

    const messages: ChatbotApiMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatbot_history,
    ];

    let chatbot_userContent = userText;
    if (fileContext) {
      chatbot_userContent = `${userText || 'Please analyze my resume'}\n\nResume:\n${fileContext}`;
    }

    let updatedHistory = [...chatbot_history];

    if (isImage) {
      const imageMessage: ChatbotApiMessage = {
        role: 'user',
        content: [
          { type: 'text', text: userText || 'Analyze this image' },
          { type: 'image_url', image_url: { url: `data:${imgType};base64,${base64}` } },
        ],
      };
      messages.push(imageMessage);
      updatedHistory = [...updatedHistory, imageMessage];
      setChatbot_history(updatedHistory);
    } else {
      const textMessage: ChatbotApiMessage = { role: 'user', content: chatbot_userContent };
      messages.push(textMessage);
      updatedHistory = [...updatedHistory, textMessage];
      setChatbot_history(updatedHistory);
    }

    const aiBubbleId = chatbot_appendAIBubble();
    chatbot_showTyping(aiBubbleId);

    const model = isImage ? CHATBOT_VISION_MODEL : CHATBOT_TEXT_MODEL;

    await chatbot_streamGroq(
      messages,
      model,
      (_token, fullText) => {
        chatbot_hideTyping(aiBubbleId);
        chatbot_updateBubble(aiBubbleId, fullText);
        chatbot_scrollBottom();
      },
      (fullText) => {
        setChatbot_history((current) => [...current, { role: 'assistant', content: fullText }]);
        chatbot_updateBubble(aiBubbleId, fullText);
        if (fullText.includes('\\documentclass[letterpaper')) {
          chatbot_extractLatex(fullText);
        }
        chatbot_setSendDisabled(false);
        chatbot_scrollBottom();
      },
      (errorMessage) => {
        chatbot_updateBubble(aiBubbleId, `Error: ${errorMessage}`, 'error');
        chatbot_setSendDisabled(false);
        chatbot_scrollBottom();
      },
    );
  };

  const chatbot_handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!chatbot_streaming) {
        void chatbot_send();
      }
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-shell">
        <div className="chatbot-topbar">
          <div className="chatbot-topbar-title">
            <Bot className="h-5 w-5" />
            <span>AI Assistant</span>
          </div>
          <button type="button" className="chatbot-new-chat" onClick={chatbot_resetChat}>
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        {!chatbot_hasApiKey && <div className="chatbot-banner">Add Groq API key in Settings</div>}

        <div className="chatbot-messages" ref={chatbot_messagesRef}>
          {chatbot_messages.map((message) => {
            const chatbot_hasLatex =
              message.content.includes('\\documentclass[letterpaper') || message.content.includes('```latex');
            const chatbot_latex = chatbot_hasLatex ? chatbot_extractLatex(message.content) : '';
            const chatbot_text = chatbot_hasLatex
              ? message.content
                  .replace(/```latex([\s\S]*?)```/, '')
                  .replace(chatbot_latex, '')
                  .trim()
              : message.content;

            return (
              <div
                key={message.id}
                className={`chatbot-row chatbot-row-${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className={`chatbot-bubble chatbot-bubble-${message.role}`}>
                  {message.file && (
                    <div className="chatbot-file-preview">
                      {message.file.type === 'application/pdf' ? (
                        <div className="chatbot-pdf-chip">PDF {message.file.name}</div>
                      ) : message.file.previewUrl ? (
                        <img src={message.file.previewUrl} alt={message.file.name} className="chatbot-image-thumb" />
                      ) : null}
                    </div>
                  )}

                  {message.isTyping ? (
                    <div className="chatbot-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <>
                      {chatbot_text && (
                        <div
                          className="chatbot-markdown"
                          dangerouslySetInnerHTML={{ __html: chatbot_renderMarkdown(chatbot_text) }}
                        />
                      )}

                      {chatbot_latex && (
                        <div className="chatbot-latex-wrap">
                          <div className="chatbot-latex-actions">
                            <button type="button" onClick={() => void chatbot_handleCopyLatex(message.content)}>
                              Copy LaTeX
                            </button>
                            <button type="button" onClick={() => chatbot_handleDownloadLatex(message.content)}>
                              Download .tex
                            </button>
                          </div>
                          <pre className="chatbot-latex-code"><code>{chatbot_latex}</code></pre>
                        </div>
                      )}
                    </>
                  )}

                  <div className="chatbot-timestamp">{message.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chatbot-inputbar">
          {chatbot_currentFile && (
            <div className="chatbot-selected-file">
              <span>{chatbot_currentFile.name}</span>
              <button type="button" onClick={chatbot_clearFilePreview}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="chatbot-inputrow">
            <button
              type="button"
              className="chatbot-attach-btn"
              onClick={() => chatbot_fileInputRef.current?.click()}
              disabled={chatbot_streaming}
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input
              ref={chatbot_fileInputRef}
              type="file"
              className="chatbot-hidden-input"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(event) => void chatbot_handleFileChange(event)}
            />

            <textarea
              ref={chatbot_textareaRef}
              value={chatbot_input}
              onChange={(event) => setChatbot_input(event.target.value)}
              onKeyDown={chatbot_handleKeyDown}
              placeholder="Ask anything... or upload your resume"
              className="chatbot-textarea"
              rows={1}
            />

            <button
              type="button"
              className="chatbot-send-btn"
              onClick={() => void chatbot_send()}
              disabled={chatbot_streaming || (!chatbot_input.trim() && !chatbot_currentFile)}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {chatbot_toast && <div className="chatbot-toast">{chatbot_toast}</div>}
    </div>
  );
};

export default ChatbotAssistant;
