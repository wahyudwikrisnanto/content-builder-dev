const { useRef, useCallback, useState, useEffect } = React;

/* ══════════════════════════════════════════════════════════
   CANVAS — workspace, elements, drag/drop, move, resize
   ══════════════════════════════════════════════════════════ */

/* ─── Element type renderers ─── */

function CmsTextRenderer({ element, isEditing }) {
  const { dispatch } = useCms();
  const ref = useRef(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.innerText = element.content;
      ref.current.focus();
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch(e) {}
    }
  }, [isEditing]);

  const s = element.styles;
  const base = {
    width: '100%', height: '100%',
    padding: s.padding || 10,
    fontSize: s.fontSize, fontWeight: s.fontWeight,
    fontStyle: s.fontStyle, textDecoration: s.textDecoration,
    color: s.color, backgroundColor: s.backgroundColor === 'transparent' ? 'transparent' : s.backgroundColor,
    textAlign: s.textAlign, lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing, borderRadius: s.borderRadius,
    overflow: 'hidden', wordWrap: 'break-word', outline: 'none',
    fontFamily: 'inherit',
  };

  if (isEditing) {
    return (
      <div ref={ref} contentEditable suppressContentEditableWarning
        style={{ ...base, cursor: 'text' }}
        onInput={(e) => {
          dispatch({ type: 'UPDATE_ELEMENT', id: element.id, updates: { content: e.target.innerText }, noHistory: true });
        }}
        onBlur={() => {
          dispatch({ type: 'SET_EDITING', id: null });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Escape') { e.target.blur(); } }}
      ></div>
    );
  }

  return <div style={{ ...base, cursor: 'move', userSelect: 'none' }}>{element.content}</div>;
}

function CmsImageRenderer({ element }) {
  const { dispatch } = useCms();
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => dispatch({ type: 'UPDATE_ELEMENT', id: element.id, updates: { content: ev.target.result } });
    reader.readAsDataURL(file);
  };

  if (element.content) {
    return (
      <img src={element.content} alt="" draggable={false}
        style={{ width: '100%', height: '100%', objectFit: element.styles.objectFit || 'cover',
          borderRadius: element.styles.borderRadius, display: 'block' }} />
    );
  }

  return (
    <div className="img-placeholder" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
      {CmsIcons.Image({ size: 28, style: { opacity: 0.4 } })}
      <span>Click to upload</span>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}

function CmsShapeRenderer({ element }) {
  const s = element.styles;
  return <div style={{
    width: '100%', height: '100%',
    backgroundColor: s.backgroundColor, borderRadius: s.borderRadius,
    border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor}` : 'none',
    opacity: s.opacity,
  }}></div>;
}

function CmsVideoRenderer({ element }) {
  const { dispatch } = useCms();

  if (element.content) {
    let src = element.content;
    if (src.includes('youtube.com/watch')) src = src.replace('watch?v=', 'embed/');
    if (src.includes('youtu.be/')) src = src.replace('youtu.be/', 'www.youtube.com/embed/');
    return <iframe src={src} style={{ width: '100%', height: '100%', border: 'none', borderRadius: element.styles.borderRadius, pointerEvents: 'none' }} allowFullScreen></iframe>;
  }

  return (
    <div className="vid-placeholder">
      {CmsIcons.Video({ size: 28, style: { opacity: 0.5 } })}
      <span>Add video URL in properties</span>
    </div>
  );
}

function CmsDividerRenderer({ element }) {
  return <div style={{ width: '100%', height: '100%', backgroundColor: element.styles.backgroundColor, opacity: element.styles.opacity, borderRadius: element.styles.borderRadius }}></div>;
}

function CmsContainerRenderer({ element }) {
  const s = element.styles;
  return <div style={{
    width: '100%', height: '100%', backgroundColor: s.backgroundColor,
    borderRadius: s.borderRadius, border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor}` : 'none',
    opacity: s.opacity,
  }}></div>;
}

/* ─── Resize handles ─── */
function ResizeHandles({ element }) {
  const { dispatch, elements, zoom } = useCms();

  const handles = [
    { id: 'nw', css: { top: -5, left: -5, cursor: 'nwse-resize' } },
    { id: 'n',  css: { top: -5, left: '50%', marginLeft: -5, cursor: 'ns-resize' } },
    { id: 'ne', css: { top: -5, right: -5, cursor: 'nesw-resize' } },
    { id: 'e',  css: { top: '50%', right: -5, marginTop: -5, cursor: 'ew-resize' } },
    { id: 'se', css: { bottom: -5, right: -5, cursor: 'nwse-resize' } },
    { id: 's',  css: { bottom: -5, left: '50%', marginLeft: -5, cursor: 'ns-resize' } },
    { id: 'sw', css: { bottom: -5, left: -5, cursor: 'nesw-resize' } },
    { id: 'w',  css: { top: '50%', left: -5, marginTop: -5, cursor: 'ew-resize' } },
  ];

  const startResize = useCallback((e, hid) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const orig = { x: element.x, y: element.y, w: element.width, h: element.height };
    const prev = JSON.parse(JSON.stringify(elements));

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      let x = orig.x, y = orig.y, w = orig.w, h = orig.h;
      if (hid.includes('e')) w = Math.max(20, orig.w + dx);
      if (hid.includes('w')) { w = Math.max(20, orig.w - dx); x = orig.x + orig.w - w; }
      if (hid.includes('s')) h = Math.max(8, orig.h + dy);
      if (hid.includes('n')) { h = Math.max(8, orig.h - dy); y = orig.y + orig.h - h; }
      dispatch({ type: 'RESIZE', id: element.id, x, y, w, h });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      dispatch({ type: 'RESIZE_END', prev });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [element, elements, zoom, dispatch]);

  return (
    <>
      {handles.map(h => (
        <div key={h.id} className="resize-handle" style={{ position: 'absolute', width: 10, height: 10, background: '#fff', border: '2px solid var(--selection)', borderRadius: 2, zIndex: 10, ...h.css }}
          onMouseDown={(e) => startResize(e, h.id)} />
      ))}
    </>
  );
}

/* ─── Single canvas element ─── */
function CanvasElement({ element, isSelected, isEditing }) {
  const { dispatch, elements, zoom } = useCms();

  const handleMouseDown = useCallback((e) => {
    if (element.locked || isEditing) return;
    e.stopPropagation();
    dispatch({ type: 'SELECT', id: element.id });

    const startX = e.clientX, startY = e.clientY;
    const origX = element.x, origY = element.y;
    const prev = JSON.parse(JSON.stringify(elements));
    let moved = false;

    const onMove = (ev) => {
      moved = true;
      dispatch({ type: 'MOVE', id: element.id, x: origX + (ev.clientX - startX) / zoom, y: origY + (ev.clientY - startY) / zoom });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved) dispatch({ type: 'MOVE_END', prev });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [element, isEditing, zoom, elements, dispatch]);

  const handleDblClick = () => {
    if (element.type === 'text' && !element.locked) {
      dispatch({ type: 'SET_EDITING', id: element.id });
    }
  };

  const renderers = {
    text:      <CmsTextRenderer element={element} isEditing={isEditing} />,
    image:     <CmsImageRenderer element={element} />,
    shape:     <CmsShapeRenderer element={element} />,
    video:     <CmsVideoRenderer element={element} />,
    divider:   <CmsDividerRenderer element={element} />,
    container: <CmsContainerRenderer element={element} />,
  };

  return (
    <div
      className={`canvas-el ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''} ${element.locked ? 'locked' : ''}`}
      style={{
        position: 'absolute',
        left: element.x, top: element.y,
        width: element.width, height: element.height,
        opacity: element.styles.opacity != null ? element.styles.opacity : 1,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDblClick}
    >
      {renderers[element.type]}
      {isSelected && !element.locked && !isEditing && <ResizeHandles element={element} />}
    </div>
  );
}

/* ─── Canvas workspace ─── */
function CmsCanvas() {
  const { elements, selectedId, editingTextId, canvasWidth, canvasHeight, zoom, dispatch } = useCms();
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const didAutoFit = useRef(false);

  // Auto-fit zoom on first mount
  useEffect(() => {
    if (didAutoFit.current || !scrollRef.current) return;
    didAutoFit.current = true;
    const rect = scrollRef.current.getBoundingClientRect();
    const padX = 80, padY = 100;
    const fitZoom = Math.min((rect.width - padX) / canvasWidth, (rect.height - padY) / canvasHeight, 1);
    const rounded = Math.round(fitZoom * 20) / 20; // nearest 5%
    if (rounded < 1) dispatch({ type: 'SET_ZOOM', zoom: Math.max(0.25, rounded) });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const type = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (type && CmsFactories[type]) {
      const el = CmsFactories[type](Math.max(0, x - 60), Math.max(0, y - 20));
      dispatch({ type: 'ADD_ELEMENT', element: el });
      return;
    }

    // Handle dropped image files
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const el = CmsFactories.image(Math.max(0, x - 100), Math.max(0, y - 80));
          el.content = ev.target.result;
          dispatch({ type: 'ADD_ELEMENT', element: el });
        };
        reader.readAsDataURL(file);
      }
    }
  }, [zoom, dispatch]);

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-inner')) {
      dispatch({ type: 'SELECT', id: null });
    }
  };

  return (
    <div className="workspace">
      <div className="canvas-scroll" ref={scrollRef}>
        <div className="canvas-wrapper" style={{ width: canvasWidth * zoom, height: canvasHeight * zoom }}>
          <div
            ref={canvasRef}
            className={`canvas ${dragOver ? 'drag-over' : ''}`}
            style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            onClick={handleCanvasClick}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* Click target for deselect */}
            <div className="canvas-inner" style={{ position: 'absolute', inset: 0 }}></div>

            {elements.map(el => el.visible && (
              <CanvasElement key={el.id} element={el} isSelected={el.id === selectedId} isEditing={el.id === editingTextId} />
            ))}

            {elements.length === 0 && !dragOver && (
              <div className="canvas-empty">
                {CmsIcons.Move({ size: 32, style: { opacity: 0.2 } })}
                <p>Drag elements here<br/>or click from sidebar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CmsCanvas });
