import React, { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface PortfolioPreviewProps {
  generatedHtml: string;
  previewKey: number;
  isGenerating?: boolean;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ generatedHtml, previewKey, isGenerating = false }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const previewWidths: Record<PreviewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleFullscreenClick = () => {
    if (!document.fullscreenElement && previewContainerRef.current) {
      previewContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        console.error('Failed to enter fullscreen');
      });
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
    }
  };

  // Inject viewport meta tag and apply container width styling to the iframe
  const enhancedHtml = (() => {
    if (!generatedHtml) return '';

    // Check if viewport meta tag exists
    const hasViewport = generatedHtml.includes('name="viewport"');
    
    let html = generatedHtml;

    // Add viewport meta tag if missing
    if (!hasViewport) {
      const headEndIndex = html.indexOf('</head>');
      if (headEndIndex !== -1) {
        const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1">';
        html = html.slice(0, headEndIndex) + viewportTag + html.slice(headEndIndex);
      }
    }

    return html;
  })();

  React.useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0b0f19]"
        role="region"
        aria-label="Fullscreen portfolio preview"
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Portfolio Preview (Fullscreen)</h3>
          <button
            onClick={() => {
              document.exitFullscreen().catch(() => {
                console.error('Failed to exit fullscreen');
              });
            }}
            className="transition"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Exit fullscreen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-4 dark:bg-[#0f172a]">
          <div
            style={{ width: previewWidths[previewMode], border: '1px solid var(--border)' }}
            className="rounded-lg overflow-hidden bg-white shadow-2xl dark:bg-[#0f172a]"
          >
            <iframe
              key={previewKey}
              title="Portfolio Preview"
              srcDoc={enhancedHtml}
              className="w-full h-screen border-none bg-white dark:bg-[#0f172a]"
              style={{
                height: '100vh',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      role="region"
      aria-label="Portfolio preview panel"
    >
      <div className="px-5 py-4 border-b flex flex-col gap-3" style={{ borderBottomColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Preview</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isGenerating ? 'Updating...' : '✓ Live'}
            </p>
          </div>
          <button
            onClick={handleFullscreenClick}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition dark:border-gray-700 dark:bg-[#0f172a] dark:text-gray-300"
            title="Enter fullscreen"
            aria-label="Enter fullscreen mode"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${previewMode === mode ? '' : 'border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
              style={previewMode === mode ? { background: 'var(--accent)', color: '#fff' } : undefined}
              aria-pressed={previewMode === mode}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={previewContainerRef}
        className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-4 dark:bg-[#0f172a]"
      >
        <div
          style={{
            width: previewWidths[previewMode],
            height: '100%',
            border: '1px solid var(--border)',
          }}
          className="rounded-xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a]"
        >
          <div className="h-10 border-b flex items-center px-4 gap-3 bg-gray-100 dark:bg-gray-800" style={{ borderBottomColor: 'var(--border)' }}>
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }}></span>
          </div>

          <div className="flex-1 overflow-hidden">
            <iframe
              key={previewKey}
              title="Portfolio Preview"
              srcDoc={enhancedHtml}
              className="w-full h-full border-none bg-white dark:bg-[#0f172a]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
