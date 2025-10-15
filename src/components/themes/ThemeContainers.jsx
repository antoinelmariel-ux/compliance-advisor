import React, { useEffect, useRef } from '../../react.js';

const NetflixAmbientVideo = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const reduceMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    if (reduceMotionQuery?.matches) {
      return undefined;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || typeof canvas.captureStream !== 'function') {
      if (videoElement.parentElement) {
        videoElement.parentElement.style.display = 'none';
      }
      return undefined;
    }

    const baseWidth = 1280;
    const baseHeight = 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = baseWidth * dpr;
    canvas.height = baseHeight * dpr;
    canvas.style.width = `${baseWidth}px`;
    canvas.style.height = `${baseHeight}px`;
    ctx.scale(dpr, dpr);

    const stream = canvas.captureStream(30);
    videoElement.srcObject = stream;
    videoElement.muted = true;

    const safelyPlay = () => {
      if (!videoElement.paused) {
        return;
      }

      const playback = videoElement.play();

      if (playback && typeof playback.catch === 'function') {
        playback.catch(() => {
          /* Intentionally swallow autoplay errors. */
        });
      }
    };

    safelyPlay();

    let frame = 0;
    let animationFrame;

    const render = () => {
      frame += 1;

      const width = baseWidth;
      const height = baseHeight;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);

      const baseGradient = ctx.createLinearGradient(0, 0, width, height);
      baseGradient.addColorStop(0, 'rgba(10, 10, 10, 0.92)');
      baseGradient.addColorStop(0.45, 'rgba(20, 20, 20, 0.88)');
      baseGradient.addColorStop(1, 'rgba(12, 12, 12, 0.92)');
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      const pulse = (Math.sin(frame / 45) + 1) / 2;
      const halo = ctx.createRadialGradient(
        width * (0.25 + pulse * 0.35),
        height * (0.25 + Math.cos(frame / 60) * 0.18),
        width * 0.05,
        width * 0.55,
        height * 0.5,
        width * 0.85
      );
      halo.addColorStop(0, `rgba(229, 9, 20, ${0.55 + pulse * 0.3})`);
      halo.addColorStop(0.45, 'rgba(118, 0, 12, 0.32)');
      halo.addColorStop(1, 'rgba(5, 5, 5, 0.92)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      const beamWidth = width * (0.22 + Math.sin(frame / 70) * 0.12);
      const beamGradient = ctx.createLinearGradient(0, 0, beamWidth, height * 1.5);
      beamGradient.addColorStop(0, 'rgba(229, 9, 20, 0.35)');
      beamGradient.addColorStop(0.5, 'rgba(229, 9, 20, 0.18)');
      beamGradient.addColorStop(1, 'rgba(229, 9, 20, 0)');
      ctx.save();
      ctx.translate(width * 0.68, height * 0.15);
      ctx.rotate(Math.sin(frame / 90) * 0.18);
      ctx.fillStyle = beamGradient;
      ctx.fillRect(-beamWidth / 2, -height * 0.2, beamWidth, height * 1.6);
      ctx.restore();

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 45; i += 1) {
        const sparkleSize = 1 + Math.random() * 2;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.25})`;
        ctx.fillRect(Math.random() * width, Math.random() * height, sparkleSize, sparkleSize);
      }

      ctx.globalAlpha = 0.25;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, height * 0.85 + Math.sin(frame / 35) * 12, width, 1);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);

    const handleVisibility = () => {
      const tracks = stream.getTracks();
      const enabled = !document.hidden;

      tracks.forEach((track) => {
        track.enabled = enabled;
      });

      if (enabled) {
        safelyPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      stream.getTracks().forEach((track) => track.stop());

      if (videoElement.srcObject === stream) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="netflix-ambient-video__container" aria-hidden="true">
      <video
        ref={videoRef}
        className="netflix-ambient-video"
        playsInline
        muted
        loop
        autoPlay
        tabIndex={-1}
      />
    </div>
  );
};

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
    backgroundClass="bg-[#f6f7fb]"
    overlay={
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.04)_0%,_transparent_55%)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-white via-[#dbe7ff] to-[#b8cffc] opacity-70 blur-[190px]" />
        <div className="absolute bottom-[-32%] right-[10%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-white via-[#cff2ff] to-[#9ed4ff] opacity-55 blur-[200px]" />
        <div className="absolute bottom-[-28%] left-[12%] h-[420px] w-[420px] rounded-[45%] bg-gradient-to-tr from-[#eff6ff] via-white to-transparent opacity-70 blur-[170px]" />
        <div className="absolute inset-x-[18%] top-[26%] h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute inset-x-[20%] top-[26%] h-[3px] -translate-y-[18px] rounded-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent blur" />
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
        <NetflixAmbientVideo />
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

export const NebulaShowcaseContainer = ({ children, renderInStandalone }) => (
  <ThemeContainerBase
    themeId="nebula"
    renderInStandalone={renderInStandalone}
    backgroundClass="bg-[#030513]"
    overlay={
      <div className="nebula-overlay" aria-hidden="true">
        <div className="nebula-overlay__grid" />
        <div className="nebula-aurora" />
        <div className="nebula-orb nebula-orb--one" />
        <div className="nebula-orb nebula-orb--two" />
        <div className="nebula-orb nebula-orb--three" />
        <div className="nebula-constellation" />
      </div>
    }
    ariaLabel="Vitrine marketing du projet – thème Nebula Pulse"
  >
    {children}
  </ThemeContainerBase>
);
