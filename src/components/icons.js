import React from '../react.js';

const ICON_CLASS_MAP = {
  'arrow-right2': 'fa-solid fa-chevron-right',
  'arrow-left2': 'fa-solid fa-chevron-left',
  warning: 'fa-solid fa-triangle-exclamation',
  checkmark2: 'fa-solid fa-circle-check',
  cog: 'fa-solid fa-gear',
  'file-text': 'fa-solid fa-file-lines',
  users: 'fa-solid fa-users',
  calendar: 'fa-solid fa-calendar-days',
  info: 'fa-solid fa-circle-info',
  pencil: 'fa-solid fa-pen',
  plus: 'fa-solid fa-plus',
  bin: 'fa-solid fa-trash-can',
  eye: 'fa-solid fa-eye',
  menu: 'fa-solid fa-grip-vertical',
  envelop: 'fa-solid fa-paper-plane',
  'aid-kit': 'fa-solid fa-wand-magic-sparkles',
  target: 'fa-solid fa-bullseye',
  rocket: 'fa-solid fa-rocket',
  compass2: 'fa-solid fa-compass',
  cross: 'fa-solid fa-xmark',
  download3: 'fa-solid fa-download',
  upload3: 'fa-solid fa-upload',
  'floppy-disk': 'fa-solid fa-floppy-disk',
  copy: 'fa-solid fa-copy',
};

const createIcon = (iconName) => {
  const iconClass = ICON_CLASS_MAP[iconName];

  return ({ className = '', title, ...props }) => {
    if (!iconClass) {
      console.warn(`Icône inconnue demandée : ${iconName}`);
      return null;
    }

    const composedClassName = `app-icon ${iconClass} ${className}`.trim();

    return (
      <i
        className={composedClassName}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        {...props}
      />
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
