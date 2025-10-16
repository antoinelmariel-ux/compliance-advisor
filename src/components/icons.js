import React from '../react.js';

const createIcon = (iconName) => {
  return ({ className = '', ...props }) => (
    <span
      className={`icomoon-icon icon-${iconName} ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  );
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
