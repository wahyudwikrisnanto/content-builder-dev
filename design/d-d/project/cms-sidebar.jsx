const { useState, useCallback } = React;

/* ══════════════════════════════════════════════════════════
   SIDEBAR — Elements · Layers · Text Styles
   ══════════════════════════════════════════════════════════ */

let _clickOffset = 0;

function DragItem({ type, icon, label, preview }) {
  const { canvasWidth, canvasHeight, elements, dispatch } = useCms();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = () => {
    const y = 60 + (_clickOffset % 6) * 80;
    const x = 60 + (_clickOffset % 3) * 40;
    _clickOffset++;
    const el = CmsFactories[type](x, y);
    dispatch({ type: 'ADD_ELEMENT', element: el });
  };

  return (
    <div className="element-item" draggable onDragStart={handleDragStart} onClick={handleClick} title={`Drag or click to add ${label}`}>
      {preview || <div className="element-item-icon">{icon}</div>}
      <span className="element-item-label">{label}</span>
    </div>
  );
}

/* ─── Elements Tab ─── */
function ElementsPanel() {
  return (
    <div>
      <div className="element-section">
        <div className="element-section-title">Text</div>
        <div className="element-grid">
          <DragItem type="text-heading" label="Heading"
            preview={<span style={{ fontSize: 16, fontWeight: 700, color: '#222' }}>Heading</span>} />
          <DragItem type="text-subheading" label="Subheading"
            preview={<span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>Subheading</span>} />
          <DragItem type="text-body" label="Body"
            preview={<span style={{ fontSize: 12, fontWeight: 400, color: '#555' }}>Body text</span>} />
          <DragItem type="text-caption" label="Caption"
            preview={<span style={{ fontSize: 11, fontWeight: 400, color: '#999' }}>Caption</span>} />
        </div>
      </div>

      <div className="element-section">
        <div className="element-section-title">Media</div>
        <div className="element-grid">
          <DragItem type="image" icon={CmsIcons.Image({ size: 24 })} label="Image" />
          <DragItem type="video" icon={CmsIcons.Video({ size: 24 })} label="Video" />
        </div>
      </div>

      <div className="element-section">
        <div className="element-section-title">Shapes</div>
        <div className="element-grid three-col">
          <DragItem type="shape-rect" label="Rectangle"
            preview={<div style={{ width: 28, height: 22, borderRadius: 4, background: '#E8E8E8', border: '1.5px solid #CFCFCF' }}></div>} />
          <DragItem type="shape-circle" label="Circle"
            preview={<div style={{ width: 24, height: 24, borderRadius: 999, background: '#E8E8E8', border: '1.5px solid #CFCFCF' }}></div>} />
          <DragItem type="shape-line" label="Line"
            preview={<div style={{ width: 28, height: 2, background: '#ABABAB', borderRadius: 1 }}></div>} />
        </div>
      </div>

      <div className="element-section">
        <div className="element-section-title">Layout</div>
        <div className="element-grid">
          <DragItem type="divider" label="Divider"
            preview={<div style={{ width: 32, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ width: '100%', height: 1, background: '#D0D0D0' }}></div>
            </div>} />
          <DragItem type="container" label="Container"
            preview={<div style={{ width: 28, height: 22, borderRadius: 4, border: '1.5px dashed #BFBFBF' }}></div>} />
        </div>
      </div>
    </div>
  );
}

/* ─── Layers Tab ─── */
function LayerItem({ element, isActive }) {
  const { dispatch } = useCms();

  const typeIcons = {
    text: CmsIcons.Type({ size: 14 }),
    image: CmsIcons.Image({ size: 14 }),
    shape: CmsIcons.Square({ size: 14 }),
    video: CmsIcons.Video({ size: 14 }),
    divider: CmsIcons.Divider({ size: 14 }),
    container: CmsIcons.Container({ size: 14 }),
  };

  const getName = () => {
    if (element.type === 'text') return element.content.slice(0, 24) || 'Text';
    if (element.type === 'shape') return element.shapeType === 'circle' ? 'Circle' : element.shapeType === 'line' ? 'Line' : 'Rectangle';
    return element.type.charAt(0).toUpperCase() + element.type.slice(1);
  };

  return (
    <div
      className={`layer-item ${isActive ? 'active' : ''}`}
      onClick={() => dispatch({ type: 'SELECT', id: element.id })}
    >
      <span className="layer-item-icon" style={{ opacity: element.visible ? 1 : 0.3 }}>
        {typeIcons[element.type]}
      </span>
      <span className="layer-item-name" style={{ opacity: element.visible ? 1 : 0.4 }}>
        {getName()}
      </span>
      <div className="layer-item-actions">
        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_VISIBLE', id: element.id }); }}
          title={element.visible ? 'Hide' : 'Show'}>
          {element.visible ? CmsIcons.Eye({ size: 13 }) : CmsIcons.EyeOff({ size: 13 })}
        </button>
        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_LOCK', id: element.id }); }}
          title={element.locked ? 'Unlock' : 'Lock'}>
          {element.locked ? CmsIcons.Lock({ size: 13 }) : CmsIcons.Unlock({ size: 13 })}
        </button>
      </div>
    </div>
  );
}

function LayersPanel() {
  const { elements, selectedId } = useCms();
  const reversed = [...elements].reverse();

  if (elements.length === 0) {
    return (
      <div className="empty-panel">
        {CmsIcons.Layers({ size: 28, style: { opacity: 0.3 } })}
        <p>No layers yet</p>
        <p className="empty-sub">Add elements to see them here</p>
      </div>
    );
  }

  return (
    <div className="layers-list">
      {reversed.map(el => (
        <LayerItem key={el.id} element={el} isActive={el.id === selectedId} />
      ))}
    </div>
  );
}

/* ─── Text Styles Tab ─── */
function TextStylesPanel() {
  const { canvasWidth, dispatch } = useCms();

  const presets = [
    { key: 'text-heading',    label: 'Heading',    desc: 'Bold, 36px', style: { fontSize: 18, fontWeight: 700 } },
    { key: 'text-subheading', label: 'Subheading', desc: 'Semibold, 22px', style: { fontSize: 14, fontWeight: 600 } },
    { key: 'text-body',       label: 'Body text',  desc: 'Regular, 16px', style: { fontSize: 13, fontWeight: 400 } },
    { key: 'text-caption',    label: 'Caption',    desc: 'Regular, 12px · Gray', style: { fontSize: 11, fontWeight: 400, color: '#717171' } },
  ];

  const addPreset = (key) => {
    const el = CmsFactories[key](canvasWidth / 2 - 120, 80 + Math.random() * 100);
    dispatch({ type: 'ADD_ELEMENT', element: el });
  };

  return (
    <div>
      {presets.map(p => (
        <div key={p.key} className="text-style-card" onClick={() => addPreset(p.key)}>
          <span style={{ ...p.style, color: p.style.color || '#222' }}>{p.label}</span>
          <span className="text-style-desc">{p.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Sidebar ─── */
function CmsSidebar() {
  const { sidebarTab, dispatch } = useCms();

  const tabs = [
    { id: 'elements', label: 'Elements', icon: CmsIcons.Plus({ size: 15 }) },
    { id: 'layers',   label: 'Layers',   icon: CmsIcons.Layers({ size: 15 }) },
    { id: 'textStyles', label: 'Styles', icon: CmsIcons.Type({ size: 15 }) },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map(t => (
          <button key={t.id}
            className={`sidebar-tab ${sidebarTab === t.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-content">
        {sidebarTab === 'elements' && <ElementsPanel />}
        {sidebarTab === 'layers' && <LayersPanel />}
        {sidebarTab === 'textStyles' && <TextStylesPanel />}
      </div>
    </div>
  );
}

Object.assign(window, { CmsSidebar });
