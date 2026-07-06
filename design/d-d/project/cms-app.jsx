const { useState, useEffect, useRef } = React;

/* ══════════════════════════════════════════════════════════
   APP SHELL — toolbar + layout + keyboard shortcuts
   ══════════════════════════════════════════════════════════ */

const CANVAS_PRESETS = [
  { label: 'Blog Post',    w: 800,  h: 1200 },
  { label: 'Landing Page', w: 1440, h: 900  },
  { label: 'Email',        w: 600,  h: 800  },
  { label: 'Square',       w: 1080, h: 1080 },
  { label: 'Story',        w: 1080, h: 1920 },
  { label: 'Mobile',       w: 375,  h: 812  },
  { label: 'Tablet',       w: 768,  h: 1024 },
  { label: 'A4 Portrait',  w: 794,  h: 1123 },
];

function CmsToolbar() {
  const { dispatch, history, future, canvasWidth, canvasHeight, zoom } = useCms();
  const [showPresets, setShowPresets] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showPresets) return;
    const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowPresets(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showPresets]);

  return (
    <div className="toolbar">
      {/* Logo */}
      <div className="toolbar-brand">
        {CmsIcons.Grid({ size: 18 })}
        <span>Builder</span>
      </div>

      <div className="toolbar-divider"></div>

      {/* Undo / Redo */}
      <div className="toolbar-group">
        <button className="icon-btn" disabled={!history.length} onClick={() => dispatch({ type: 'UNDO' })} title="Undo (Ctrl+Z)">
          {CmsIcons.Undo({ size: 17 })}
        </button>
        <button className="icon-btn" disabled={!future.length} onClick={() => dispatch({ type: 'REDO' })} title="Redo (Ctrl+Shift+Z)">
          {CmsIcons.Redo({ size: 17 })}
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* Canvas size */}
      <div className="canvas-size-selector" ref={dropRef}>
        <button className="canvas-size-btn" onClick={() => setShowPresets(!showPresets)}>
          <span>{canvasWidth} × {canvasHeight}</span>
          {CmsIcons.ChevronDown({ size: 14 })}
        </button>
        {showPresets && (
          <div className="canvas-size-dropdown">
            <div className="dropdown-label">Canvas presets</div>
            {CANVAS_PRESETS.map(p => (
              <button key={p.label} className="canvas-size-option"
                onClick={() => { dispatch({ type: 'SET_CANVAS', w: p.w, h: p.h }); setShowPresets(false); }}>
                <span>{p.label}</span>
                <span className="dims">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-spacer"></div>

      {/* Zoom */}
      <div className="toolbar-group">
        <button className="icon-btn" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom - 0.1 })} title="Zoom Out">
          {CmsIcons.Minus({ size: 16 })}
        </button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="icon-btn" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom + 0.1 })} title="Zoom In">
          {CmsIcons.Plus({ size: 16 })}
        </button>
      </div>
    </div>
  );
}

function CmsAppInner() {
  const { dispatch, selectedId, editingTextId } = useCms();

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const isContentEditable = document.activeElement?.contentEditable === 'true';

      // Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }
      // Redo
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }
      // Don't intercept when typing in inputs
      if (isInput || isContentEditable) {
        if (e.key === 'Escape' && isContentEditable) {
          document.activeElement?.blur();
        }
        return;
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) { e.preventDefault(); dispatch({ type: 'DELETE_ELEMENT', id: selectedId }); }
      }
      // Escape
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT', id: null });
      }
      // Duplicate
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        if (selectedId) { e.preventDefault(); dispatch({ type: 'DUPLICATE', id: selectedId }); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, selectedId, editingTextId]);

  return (
    <div className="app">
      <CmsToolbar />
      <div className="main-area">
        <CmsSidebar />
        <CmsCanvas />
        <CmsProperties />
      </div>
    </div>
  );
}

function CmsApp() {
  return (
    <CmsProvider>
      <CmsAppInner />
    </CmsProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CmsApp />);
