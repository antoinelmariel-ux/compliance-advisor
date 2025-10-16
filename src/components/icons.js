import React from '../react.js';

const ICON_SVG_MAP = {
  'arrow-right2': () => <path d="M9 5l7 7-7 7" />, // Chevron Right
  'arrow-left2': () => <path d="M15 5l-7 7 7 7" />, // Chevron Left
  warning: () => (
    <>
      <path d="M10.29 3.64 2.5 17.14A2 2 0 0 0 4.24 20h15.52a2 2 0 0 0 1.74-2.86l-7.79-13.5a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" strokeLinecap="round" />
    </>
  ),
  checkmark2: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 12.5 2.25 2.25L15.5 10" />
    </>
  ),
  cog: () => (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  'file-text': () => (
    <>
      <path d="M14 2H7.5A3.5 3.5 0 0 0 4 5.5v13A3.5 3.5 0 0 0 7.5 22h9A3.5 3.5 0 0 0 20 18.5V9Z" />
      <path d="M14 2v7h7" />
      <path d="M9 14.5h6" />
      <path d="M9 18h6" />
    </>
  ),
  users: () => (
    <>
      <path d="M17 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 3 19.5V21" />
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M21 21v-1.25a4.25 4.25 0 0 0-3-4.07" />
      <path d="M18.5 3.5a3.5 3.5 0 0 1 0 6.59" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 11h18" />
    </>
  ),
  info: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 7h.01" strokeLinecap="round" />
    </>
  ),
  pencil: () => (
    <>
      <path d="M4 20h4l10.5-10.5a2.5 2.5 0 0 0-3.54-3.54L4.46 16.46a2 2 0 0 0-.46 1.28V20" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  plus: () => (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  bin: () => (
    <>
      <path d="M6 6h12" />
      <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
      <rect x="5" y="6" width="14" height="14" rx="2" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),
  eye: () => (
    <>
      <path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  menu: () => (
    <>
      <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  envelop: () => (
    <>
      <path d="m3 5 9 7 9-7" />
      <path d="M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
    </>
  ),
  'aid-kit': () => (
    <>
      <path d="m12 4-1.3 4.5L6 9.8l4.7 1.3L12 15.5l1.3-4.4 4.7-1.3-4.7-1.3Z" />
      <path d="m5 18.25-.45 1.45L3 20l1.55.3L5 22l.45-1.7L7 20l-1.55-.3Z" />
      <path d="m19 14-.45 1.45L17 16l1.55.55L19 18l.45-1.45L21 16l-1.55-.55Z" />
    </>
  ),
  target: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  rocket: () => (
    <>
      <path d="M12 3c3.5 0 6 2.5 6 6.5 0 4.5-2 8-4 10a2 2 0 0 1-2 0c-2-2-4-5.5-4-10C8 5.5 10.5 3 12 3Z" />
      <path d="M12 14.5v3" />
      <path d="M9 18.5 7.5 21" />
      <path d="M15 18.5 16.5 21" />
      <circle cx="12" cy="8.5" r="1.75" />
    </>
  ),
  compass2: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m16.75 8.25-2.5 6.5-6.5 2.5 2.5-6.5Z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  cross: () => (
    <>
      <path d="m7 7 10 10" />
      <path d="M17 7 7 17" />
    </>
  ),
  download3: () => (
    <>
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  upload3: () => (
    <>
      <path d="M12 21V9" />
      <path d="m16 13-4-4-4 4" />
      <path d="M5 5h14" />
    </>
  ),
  'floppy-disk': () => (
    <>
      <path d="M5 3h11.5L21 7.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <rect x="7.5" y="15" width="9" height="5" rx="1" />
      <path d="M15 3v5.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 7 8.5V3" />
    </>
  ),
  copy: () => (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
};

const DEFAULT_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const createIcon = (iconName) => {
  const renderSvgContent = ICON_SVG_MAP[iconName];

  return ({ className = '', title, ...props }) => {
    if (typeof renderSvgContent !== 'function') {
      console.warn(`Icône inconnue demandée : ${iconName}`);
      return null;
    }

    const composedClassName = `app-icon ${className}`.trim();

    return (
      <svg
        className={composedClassName}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        {...DEFAULT_SVG_PROPS}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {renderSvgContent(props)}
      </svg>
    );
  };
};

export const ChevronRight = createIcon('arrow-right2');
export const ChevronLeft = createIcon('arrow-left2');
export const AlertTriangle = createIcon('warning');
export const CheckCircle = createIcon('checkmark2');
export const Settings = createIcon('cog');
export const FileText = createIcon('file-text');
export const Users = createIcon('users');
export const Calendar = createIcon('calendar');
export const Info = createIcon('info');
export const Edit = createIcon('pencil');
export const Plus = createIcon('plus');
export const Trash2 = createIcon('bin');
export const Eye = createIcon('eye');
export const GripVertical = createIcon('menu');
export const Send = createIcon('envelop');
export const Sparkles = createIcon('aid-kit');
export const Target = createIcon('target');
export const Rocket = createIcon('rocket');
export const Compass = createIcon('compass2');
export const Close = createIcon('cross');
export const Download = createIcon('download3');
export const Upload = createIcon('upload3');
export const Save = createIcon('floppy-disk');
export const Copy = createIcon('copy');

export { createIcon };
