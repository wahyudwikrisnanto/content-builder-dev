const { useState, useEffect } = React;

/* ══════════════════════════════════════════════════════════
   PROPERTIES PANEL
   ══════════════════════════════════════════════════════════ */

/* ─── Color input ─── */
function ColorInput({ value, onChange }) {
  const [hex, setHex] = useState(value || '#000000');
  useEffect(() => { setHex(value || '#000000'); }, [value]);

  const safeVal = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : (value || '#000000');

  return (
    <div className="color-input-wrap">
      <div className="color-swatch" style={{ backgroundColor: safeVal }}>
        <input type="color" value={safeVal} onChange={e => { setHex(e.target.value); onChange(e.target.value); }} />
      </div>
      <input className="color-hex-input" value={hex}
        onChange={e => { setHex(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value); }}
        onBlur={() => setHex(value || '#000000')} />
    </div>
  );
}

/* ─── Section helpers ─── */
function PropSection({ title, children }) {
  return (
    <div className="prop-section">
      <div className="prop-section-title">{title}</div>
      {children}
    </div>
  );
}

function PropRow({ label, children }) {
  return (
    <div className="prop-row">
      {label && <span className="prop-label">{label}</span>}
      {children}
    </div>
  );
}

/* ─── Canvas Properties (nothing selected) ─── */
function CanvasProps() {
  const { canvasWidth, canvasHeight, dispatch } = useCms();
  const [w, setW] = useState(canvasWidth);
  const [h, setH] = useState(canvasHeight);

  useEffect(() => { setW(canvasWidth); setH(canvasHeight); }, [canvasWidth, canvasHeight]);

  const apply = () => {
    dispatch({ type: 'SET_CANVAS', w: Math.max(100, w), h: Math.max(100, h) });
  };

  return (
    <div className="properties">
      <div className="properties-header">
        <span>Canvas</span>
      </div>
      <PropSection title="Size">
        <PropRow label="W">
          <input className="prop-input" type="number" value={w} min={100}
            onChange={e => setW(+e.target.value)} onBlur={apply} onKeyDown={e => e.key === 'Enter' && apply()} />
        </PropRow>
        <PropRow label="H">
          <input className="prop-input" type="number" value={h} min={100}
            onChange={e => setH(+e.target.value)} onBlur={apply} onKeyDown={e => e.key === 'Enter' && apply()} />
        </PropRow>
      </PropSection>
      <div className="prop-hint">Select an element to edit its properties</div>
    </div>
  );
}

/* ─── Position & Size ─── */
function PositionSection({ el }) {
  const { dispatch } = useCms();
  const upd = (k, v) => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, updates: { [k]: v } });

  return (
    <PropSection title="Position & Size">
      <div className="prop-row-pair">
        <PropRow label="X"><input className="prop-input" type="number" value={Math.round(el.x)} onChange={e => upd('x', +e.target.value)} /></PropRow>
        <PropRow label="Y"><input className="prop-input" type="number" value={Math.round(el.y)} onChange={e => upd('y', +e.target.value)} /></PropRow>
      </div>
      <div className="prop-row-pair">
        <PropRow label="W"><input className="prop-input" type="number" value={Math.round(el.width)} min={20} onChange={e => upd('width', Math.max(20, +e.target.value))} /></PropRow>
        <PropRow label="H"><input className="prop-input" type="number" value={Math.round(el.height)} min={8} onChange={e => upd('height', Math.max(8, +e.target.value))} /></PropRow>
      </div>
    </PropSection>
  );
}

/* ─── Typography ─── */
function TypographySection({ el }) {
  const { dispatch } = useCms();
  const s = el.styles;
  const sty = (k, v) => dispatch({ type: 'UPDATE_STYLES', id: el.id, styles: { [k]: v } });

  return (
    <PropSection title="Typography">
      <PropRow label="Size">
        <input className="prop-input" type="number" value={s.fontSize} min={8} max={200} style={{width: 64, flex: 'none'}}
          onChange={e => sty('fontSize', +e.target.value)} />
        <select className="prop-select" value={s.fontWeight} onChange={e => sty('fontWeight', e.target.value)}>
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
        </select>
      </PropRow>

      <PropRow label="Color">
        <ColorInput value={s.color} onChange={v => sty('color', v)} />
      </PropRow>

      <PropRow label="Align">
        <div className="toggle-group">
          {['left', 'center', 'right'].map(a => (
            <button key={a} className={`toggle-btn ${s.textAlign === a ? 'active' : ''}`} onClick={() => sty('textAlign', a)}>
              {a === 'left' && CmsIcons.AlignLeft({ size: 14 })}
              {a === 'center' && CmsIcons.AlignCenter({ size: 14 })}
              {a === 'right' && CmsIcons.AlignRight({ size: 14 })}
            </button>
          ))}
        </div>
      </PropRow>

      <PropRow label="Style">
        <div className="toggle-group">
          <button className={`toggle-btn ${s.fontStyle === 'italic' ? 'active' : ''}`} onClick={() => sty('fontStyle', s.fontStyle === 'italic' ? 'normal' : 'italic')}>
            {CmsIcons.Italic({ size: 14 })}
          </button>
          <button className={`toggle-btn ${s.textDecoration === 'underline' ? 'active' : ''}`} onClick={() => sty('textDecoration', s.textDecoration === 'underline' ? 'none' : 'underline')}>
            {CmsIcons.Underline({ size: 14 })}
          </button>
        </div>
      </PropRow>

      <PropRow label="Line">
        <input className="prop-input" type="number" step="0.1" min={0.8} max={4} value={s.lineHeight} onChange={e => sty('lineHeight', +e.target.value)} />
      </PropRow>
    </PropSection>
  );
}

/* ─── Appearance ─── */
function AppearanceSection({ el }) {
  const { dispatch } = useCms();
  const s = el.styles;
  const sty = (k, v) => dispatch({ type: 'UPDATE_STYLES', id: el.id, styles: { [k]: v } });

  return (
    <PropSection title="Appearance">
      {el.type === 'divider' ? (
        <PropRow label="Color">
          <ColorInput value={s.backgroundColor || '#DDDDDD'} onChange={v => sty('backgroundColor', v)} />
        </PropRow>
      ) : (
        <PropRow label="Fill">
          <ColorInput value={s.backgroundColor === 'transparent' ? '#FFFFFF' : (s.backgroundColor || '#FFFFFF')} onChange={v => sty('backgroundColor', v)} />
        </PropRow>
      )}

      {s.borderRadius !== undefined && el.type !== 'divider' && (
        <PropRow label="Radius">
          <input className="prop-input" type="number" min={0} value={s.borderRadius} onChange={e => sty('borderRadius', +e.target.value)} />
        </PropRow>
      )}

      {s.borderWidth !== undefined && el.type !== 'divider' && (
        <div className="prop-row-pair">
          <PropRow label="Border">
            <input className="prop-input" type="number" min={0} value={s.borderWidth} onChange={e => sty('borderWidth', +e.target.value)} />
          </PropRow>
          <PropRow label="">
            <ColorInput value={s.borderColor || '#DDDDDD'} onChange={v => sty('borderColor', v)} />
          </PropRow>
        </div>
      )}

      <PropRow label="Opacity">
        <input className="prop-slider" type="range" min={0} max={1} step={0.01} value={s.opacity != null ? s.opacity : 1}
          onChange={e => sty('opacity', +e.target.value)} />
        <span className="opacity-val">{Math.round((s.opacity != null ? s.opacity : 1) * 100)}%</span>
      </PropRow>
    </PropSection>
  );
}

/* ─── Image section ─── */
function ImageSection({ el }) {
  const { dispatch } = useCms();
  const s = el.styles;
  return (
    <PropSection title="Image">
      <PropRow label="URL">
        <input className="prop-input" type="text" placeholder="https://..."
          value={el.content?.startsWith('data:') ? '' : (el.content || '')}
          onChange={e => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, updates: { content: e.target.value } })} />
      </PropRow>
      <PropRow label="Fit">
        <select className="prop-select" value={s.objectFit || 'cover'}
          onChange={e => dispatch({ type: 'UPDATE_STYLES', id: el.id, styles: { objectFit: e.target.value } })}>
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </PropRow>
    </PropSection>
  );
}

/* ─── Video section ─── */
function VideoSection({ el }) {
  const { dispatch } = useCms();
  return (
    <PropSection title="Video">
      <PropRow label="URL">
        <input className="prop-input" type="text" placeholder="YouTube or Vimeo URL" value={el.content || ''}
          onChange={e => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, updates: { content: e.target.value } })} />
      </PropRow>
    </PropSection>
  );
}

/* ─── Layer ordering ─── */
function LayerOrderSection({ el }) {
  const { dispatch } = useCms();
  return (
    <PropSection title="Layer">
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn-sm" onClick={() => dispatch({ type: 'BRING_FORWARD', id: el.id })}>
          {CmsIcons.ArrowUp({ size: 13 })} Forward
        </button>
        <button className="btn-sm" onClick={() => dispatch({ type: 'SEND_BACKWARD', id: el.id })}>
          {CmsIcons.ArrowDown({ size: 13 })} Backward
        </button>
      </div>
    </PropSection>
  );
}

/* ─── Actions header ─── */
function PropActions({ el }) {
  const { dispatch } = useCms();
  const typeLabels = { text: 'Text', image: 'Image', shape: 'Shape', video: 'Video', divider: 'Divider', container: 'Container' };

  return (
    <div className="properties-header">
      <span>{typeLabels[el.type] || el.type}{el.type === 'shape' ? ` · ${el.shapeType}` : ''}</span>
      <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
        <button className="icon-btn" title="Duplicate (Ctrl+D)" onClick={() => dispatch({ type: 'DUPLICATE', id: el.id })}>
          {CmsIcons.Copy({ size: 15 })}
        </button>
        <button className="icon-btn" title="Delete" onClick={() => dispatch({ type: 'DELETE_ELEMENT', id: el.id })}>
          {CmsIcons.Trash({ size: 15 })}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Properties ─── */
function CmsProperties() {
  const { selected } = useCms();

  if (!selected) return <CanvasProps />;

  const el = selected;

  return (
    <div className="properties">
      <PropActions el={el} />
      <PositionSection el={el} />
      {el.type === 'text' && <TypographySection el={el} />}
      <AppearanceSection el={el} />
      {el.type === 'image' && <ImageSection el={el} />}
      {el.type === 'video' && <VideoSection el={el} />}
      <LayerOrderSection el={el} />
    </div>
  );
}

Object.assign(window, { CmsProperties });
