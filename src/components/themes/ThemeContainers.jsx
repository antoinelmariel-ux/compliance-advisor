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
        <div className="absolute -top-24 -left-28 h-[420px] w-[420px] rounded-full bg-[#c7d7ff] opacity-60 blur-[140px]" />
        <div className="absolute bottom-[-30%] right-[-18%] h-[520px] w-[520px] rounded-full bg-[#9ad6ff] opacity-50 blur-[170px]" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-b from-white/40 via-white/30 to-transparent" />
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
        <div className="absolute -top-36 right-[-25%] h-[520px] w-[520px] rounded-full bg-[#e50914] opacity-30 blur-[160px]" />
        <div className="absolute bottom-[-40%] left-[-30%] h-[480px] w-[480px] rounded-full bg-[#811010] opacity-40 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,22,0.85),_transparent_70%)]" />
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
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,_rgba(0,0,0,0.08)_0,_rgba(0,0,0,0.08)_16px,_transparent_16px,_transparent_32px)]" />
        <div className="absolute -top-32 left-1/4 h-48 w-48 rotate-6 rounded-full bg-[#ffe066] opacity-70 blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/5 h-72 w-72 -rotate-3 rounded-full bg-[#ffd43b] opacity-60 blur-3xl" />
      </>
    }
    ariaLabel="Vitrine marketing du projet – thème Amnesty International"
  >
    {children}
  </ThemeContainerBase>
);
