const { useState, useEffect, useRef, useCallback, useMemo, useReducer, createContext, useContext } = React;

/* ══════════════════════════════════════════════════════════
   ICONS — minimal feather-style SVGs
   ══════════════════════════════════════════════════════════ */
const CmsIcon = ({ children, size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const CmsIcons = {
  Type:       (p={}) => <CmsIcon {...p}><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></CmsIcon>,
  Image:      (p={}) => <CmsIcon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></CmsIcon>,
  Square:     (p={}) => <CmsIcon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/></CmsIcon>,
  Circle:     (p={}) => <CmsIcon {...p}><circle cx="12" cy="12" r="9"/></CmsIcon>,
  LineIcon:   (p={}) => <CmsIcon {...p}><path d="M5 12h14"/></CmsIcon>,
  Video:      (p={}) => <CmsIcon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/></CmsIcon>,
  Divider:    (p={}) => <CmsIcon {...p}><path d="M3 12h18"/><path d="M3 6h18" opacity=".25"/><path d="M3 18h18" opacity=".25"/></CmsIcon>,
  Container:  (p={}) => <CmsIcon {...p}><rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 3"/></CmsIcon>,
  Layers:     (p={}) => <CmsIcon {...p}><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></CmsIcon>,
  Eye:        (p={}) => <CmsIcon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></CmsIcon>,
  EyeOff:     (p={}) => <CmsIcon {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></CmsIcon>,
  Lock:       (p={}) => <CmsIcon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></CmsIcon>,
  Unlock:     (p={}) => <CmsIcon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></CmsIcon>,
  Trash:      (p={}) => <CmsIcon {...p}><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></CmsIcon>,
  Copy:       (p={}) => <CmsIcon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></CmsIcon>,
  Undo:       (p={}) => <CmsIcon {...p}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13"/></CmsIcon>,
  Redo:       (p={}) => <CmsIcon {...p}><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13"/></CmsIcon>,
  Bold:       (p={}) => <CmsIcon {...p}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></CmsIcon>,
  Italic:     (p={}) => <CmsIcon {...p}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></CmsIcon>,
  Underline:  (p={}) => <CmsIcon {...p}><path d="M6 3v7a6 6 0 0012 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></CmsIcon>,
  AlignLeft:  (p={}) => <CmsIcon {...p}><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></CmsIcon>,
  AlignCenter:(p={}) => <CmsIcon {...p}><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></CmsIcon>,
  AlignRight: (p={}) => <CmsIcon {...p}><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></CmsIcon>,
  ChevronDown:(p={}) => <CmsIcon {...p}><polyline points="6,9 12,15 18,9"/></CmsIcon>,
  Plus:       (p={}) => <CmsIcon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></CmsIcon>,
  Minus:      (p={}) => <CmsIcon {...p}><line x1="5" y1="12" x2="19" y2="12"/></CmsIcon>,
  ArrowUp:    (p={}) => <CmsIcon {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></CmsIcon>,
  ArrowDown:  (p={}) => <CmsIcon {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></CmsIcon>,
  Grid:       (p={}) => <CmsIcon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></CmsIcon>,
  Move:       (p={}) => <CmsIcon {...p}><polyline points="5,9 2,12 5,15"/><polyline points="9,5 12,2 15,5"/><polyline points="15,19 12,22 9,19"/><polyline points="19,9 22,12 19,15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></CmsIcon>,
};

/* ══════════════════════════════════════════════════════════
   ELEMENT FACTORIES
   ══════════════════════════════════════════════════════════ */
let _uid = Date.now();
const cmsUid = () => `el-${_uid++}`;

function createText(x = 60, y = 60, preset) {
  const base = {
    id: cmsUid(), type: 'text', x, y,
    width: 240, height: 48,
    content: 'Type something...',
    styles: {
      fontSize: 16, fontWeight: '400', fontStyle: 'normal',
      textDecoration: 'none', color: '#222222',
      backgroundColor: 'transparent', textAlign: 'left',
      lineHeight: 1.5, letterSpacing: 0, borderRadius: 0,
      padding: 10, borderWidth: 0, borderColor: '#DDDDDD', opacity: 1,
    },
    visible: true, locked: false,
  };
  if (preset === 'heading')    { base.content='Heading'; base.width=320; base.height=56; base.styles.fontSize=36; base.styles.fontWeight='700'; }
  if (preset === 'subheading') { base.content='Subheading'; base.width=280; base.height=44; base.styles.fontSize=22; base.styles.fontWeight='600'; }
  if (preset === 'body')       { base.content='Body text goes here. Edit this text to add your own content.'; base.width=340; base.height=90; }
  if (preset === 'caption')    { base.content='Caption text'; base.width=180; base.height=32; base.styles.fontSize=12; base.styles.color='#717171'; }
  return base;
}

function createImage(x = 60, y = 60) {
  return {
    id: cmsUid(), type: 'image', x, y, width: 280, height: 200, content: '',
    styles: { borderRadius: 8, borderWidth: 0, borderColor: '#DDDDDD', opacity: 1, objectFit: 'cover' },
    visible: true, locked: false,
  };
}

function createShape(x = 60, y = 60, shapeType = 'rect') {
  return {
    id: cmsUid(), type: 'shape', shapeType, x, y,
    width: shapeType === 'line' ? 200 : 120,
    height: shapeType === 'line' ? 4 : 120,
    content: '',
    styles: {
      backgroundColor: shapeType === 'line' ? '#222222' : '#F0F0F0',
      borderRadius: shapeType === 'circle' ? 999 : 8,
      borderWidth: shapeType === 'line' ? 0 : 1,
      borderColor: '#DDDDDD', opacity: 1,
    },
    visible: true, locked: false,
  };
}

function createVideo(x = 60, y = 60) {
  return {
    id: cmsUid(), type: 'video', x, y, width: 320, height: 200, content: '',
    styles: { borderRadius: 8, borderWidth: 0, borderColor: '#DDDDDD', opacity: 1 },
    visible: true, locked: false,
  };
}

function createDivider(x = 60, y = 60) {
  return {
    id: cmsUid(), type: 'divider', x, y, width: 300, height: 2, content: '',
    styles: { backgroundColor: '#DDDDDD', opacity: 1, borderRadius: 0, borderWidth: 0, borderColor: '#DDDDDD' },
    visible: true, locked: false,
  };
}

function createContainer(x = 60, y = 60) {
  return {
    id: cmsUid(), type: 'container', x, y, width: 360, height: 240, content: '',
    styles: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB', opacity: 1, padding: 16 },
    visible: true, locked: false,
  };
}

const CmsFactories = {
  'text':            createText,
  'text-heading':    (x,y) => createText(x,y,'heading'),
  'text-subheading': (x,y) => createText(x,y,'subheading'),
  'text-body':       (x,y) => createText(x,y,'body'),
  'text-caption':    (x,y) => createText(x,y,'caption'),
  'image':           createImage,
  'shape-rect':      (x,y) => createShape(x,y,'rect'),
  'shape-circle':    (x,y) => createShape(x,y,'circle'),
  'shape-line':      (x,y) => createShape(x,y,'line'),
  'video':           createVideo,
  'divider':         createDivider,
  'container':       createContainer,
};

/* ══════════════════════════════════════════════════════════
   REDUCER + CONTEXT
   ══════════════════════════════════════════════════════════ */
const CMS_INITIAL = {
  elements: [],
  selectedId: null,
  editingTextId: null,
  canvasWidth: 800,
  canvasHeight: 1100,
  zoom: 1,
  sidebarTab: 'elements',
  history: [],
  future: [],
};

function snap(state) {
  return { history: [...state.history.slice(-49), JSON.parse(JSON.stringify(state.elements))], future: [] };
}

function cmsReducer(state, action) {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const h = snap(state);
      return { ...state, ...h, elements: [...state.elements, action.element], selectedId: action.element.id, editingTextId: null };
    }
    case 'UPDATE_ELEMENT': {
      const h = action.noHistory ? {} : snap(state);
      return { ...state, ...h, elements: state.elements.map(el => el.id === action.id ? { ...el, ...action.updates } : el) };
    }
    case 'UPDATE_STYLES': {
      const h = action.noHistory ? {} : snap(state);
      return { ...state, ...h, elements: state.elements.map(el => el.id === action.id ? { ...el, styles: { ...el.styles, ...action.styles } } : el) };
    }
    case 'DELETE_ELEMENT': {
      if (!action.id) return state;
      const h = snap(state);
      return { ...state, ...h, elements: state.elements.filter(el => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        editingTextId: state.editingTextId === action.id ? null : state.editingTextId };
    }
    case 'SELECT':
      return { ...state, selectedId: action.id, editingTextId: null };
    case 'SET_EDITING':
      return { ...state, editingTextId: action.id };
    case 'MOVE': {
      return { ...state, elements: state.elements.map(el => el.id === action.id ? { ...el, x: action.x, y: action.y } : el) };
    }
    case 'MOVE_END': {
      const h = { history: [...state.history.slice(-49), action.prev], future: [] };
      return { ...state, ...h };
    }
    case 'RESIZE': {
      return { ...state, elements: state.elements.map(el => el.id === action.id ? { ...el, x: action.x, y: action.y, width: action.w, height: action.h } : el) };
    }
    case 'RESIZE_END': {
      const h = { history: [...state.history.slice(-49), action.prev], future: [] };
      return { ...state, ...h };
    }
    case 'BRING_FORWARD': {
      const idx = state.elements.findIndex(e => e.id === action.id);
      if (idx < 0 || idx >= state.elements.length - 1) return state;
      const h = snap(state);
      const els = [...state.elements];
      [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
      return { ...state, ...h, elements: els };
    }
    case 'SEND_BACKWARD': {
      const idx = state.elements.findIndex(e => e.id === action.id);
      if (idx <= 0) return state;
      const h = snap(state);
      const els = [...state.elements];
      [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
      return { ...state, ...h, elements: els };
    }
    case 'DUPLICATE': {
      const el = state.elements.find(e => e.id === action.id);
      if (!el) return state;
      const h = snap(state);
      const dup = { ...JSON.parse(JSON.stringify(el)), id: cmsUid(), x: el.x + 20, y: el.y + 20 };
      return { ...state, ...h, elements: [...state.elements, dup], selectedId: dup.id };
    }
    case 'TOGGLE_VISIBLE': {
      return { ...state, elements: state.elements.map(el => el.id === action.id ? { ...el, visible: !el.visible } : el) };
    }
    case 'TOGGLE_LOCK': {
      return { ...state, elements: state.elements.map(el => el.id === action.id ? { ...el, locked: !el.locked } : el) };
    }
    case 'SET_CANVAS':
      return { ...state, canvasWidth: action.w, canvasHeight: action.h };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(3, action.zoom)) };
    case 'SET_TAB':
      return { ...state, sidebarTab: action.tab };
    case 'UNDO': {
      if (!state.history.length) return state;
      const prev = state.history[state.history.length - 1];
      return { ...state, elements: prev, history: state.history.slice(0, -1), future: [JSON.parse(JSON.stringify(state.elements)), ...state.future], selectedId: null, editingTextId: null };
    }
    case 'REDO': {
      if (!state.future.length) return state;
      const next = state.future[0];
      return { ...state, elements: next, history: [...state.history, JSON.parse(JSON.stringify(state.elements))], future: state.future.slice(1), selectedId: null, editingTextId: null };
    }
    default: return state;
  }
}

const CmsContext = createContext();

function CmsProvider({ children }) {
  const [state, dispatch] = useReducer(cmsReducer, CMS_INITIAL);
  const value = useMemo(() => ({
    ...state, dispatch,
    selected: state.elements.find(el => el.id === state.selectedId) || null,
  }), [state]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

function useCms() { return useContext(CmsContext); }

Object.assign(window, { CmsIcon, CmsIcons, CmsFactories, cmsUid, CmsProvider, useCms, CmsContext });
