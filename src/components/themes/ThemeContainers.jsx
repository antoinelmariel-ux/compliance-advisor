import React from '../../react.js';

const ThemeContainerBase = ({
  themeId,
  renderInStandalone,
  backgroundClass,
  overlay,
  children,
  ariaLabel,
}) => {
  const Element = renderInStandalone ? 'div' : 'section';
  const padding = renderInStandalone ? 'py-12 px-4 sm:px-8' : 'px-4 py-10 sm:px-8';
  const wrapperClass = renderInStandalone ? 'mx-auto w-full' : 'w-full';

  return (
    <Element
      data-showcase-scope
      data-showcase-theme={themeId}
      className={`relative isolate min-h-screen ${backgroundClass} ${padding}`}
      {...(!renderInStandalone ? { 'aria-label': ariaLabel || 'Vitrine marketing du projet' } : {})}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {overlay}
      </div>
      <div className={`relative ${wrapperClass}`}>{children}</div>
    </Element>
  );
};

export const AppleShowcaseContainer = ({ children, renderInStandalone }) => (
  <ThemeContainerBase
    themeId="apple"
    renderInStandalone={renderInStandalone}
    backgroundClass="bg-[#f5f5f7]"
    overlay={
      <>
        <div className="absolute -top-36 -left-24 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-white via-[#dce9ff] to-[#9cc9ff] opacity-70 blur-[170px]" />
        <div className="absolute top-1/3 right-[-10%] h-[520px] w-[520px] rounded-[52%] bg-gradient-to-tr from-[#c7ddff] via-white/40 to-transparent opacity-70 blur-[200px]" />
        <div className="absolute bottom-[-38%] left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-[58%] bg-gradient-to-tr from-[#82cfff]/40 via-[#a3e0ff]/20 to-transparent opacity-70 blur-[220px]" />
        <div className="absolute inset-x-[18%] top-[32%] h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute inset-x-[12%] top-[32%] h-[3px] -translate-y-[18px] rounded-full bg-gradient-to-r from-transparent via-sky-200/60 to-transparent blur" />
        <div className="absolute inset-y-[20%] left-[8%] w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent" />
      </>
    }
  >
    {children}
  </ThemeContainerBase>
);

export const NetflixShowcaseContainer = ({ children, renderInStandalone }) => (
  <ThemeContainerBase
    themeId="netflix"
    renderInStandalone={renderInStandalone}
    backgroundClass="bg-[#050507]"
    overlay={
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,22,0.85),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(229,9,20,0.22)_0%,_transparent_60%)]" />
        <div className="absolute -top-40 right-[-28%] h-[520px] w-[520px] rounded-full bg-[#e50914] opacity-35 blur-[170px]" />
        <div className="absolute bottom-[-45%] left-[-28%] h-[520px] w-[520px] rounded-full bg-[#801414] opacity-45 blur-[180px]" />
        <div className="absolute inset-y-[12%] left-12 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-y-[18%] right-[14%] w-[260px] rotate-12 bg-gradient-to-br from-[#ff3c28]/60 via-transparent to-transparent opacity-70 blur-[140px]" />
      </>
    }
    ariaLabel="Vitrine marketing du projet – thème Netflix"
  >
    {children}
  </ThemeContainerBase>
);

export const AmnestyShowcaseContainer = ({ children, renderInStandalone }) => (
  <ThemeContainerBase
    themeId="amnesty"
    renderInStandalone={renderInStandalone}
    backgroundClass="bg-[#fff9c2]"
    overlay={
      <>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(120deg,_rgba(0,0,0,0.08)_0,_rgba(0,0,0,0.08)_18px,_transparent_18px,_transparent_36px)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,237,0,0.35)_0%,_transparent_55%)]" />
        <div className="absolute -top-32 left-1/4 h-52 w-52 rotate-6 rounded-full bg-[#ffe066] opacity-70 blur-3xl" />
        <div className="absolute bottom-[-14%] right-[18%] h-80 w-80 -rotate-6 rounded-full bg-[#ffd43b] opacity-65 blur-3xl" />
        <div className="absolute inset-y-[25%] left-[10%] w-[220px] -rotate-12 bg-gradient-to-br from-black/20 via-transparent to-transparent opacity-50 blur-[90px]" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-[2px] bg-[repeating-linear-gradient(90deg,_#121212_0,_#121212_12px,_transparent_12px,_transparent_24px)] opacity-40" />
      </>
    }
    ariaLabel="Vitrine marketing du projet – thème Amnesty International"
  >
    {children}
  </ThemeContainerBase>
);
