function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { useEffect, useRef } from '../../react.js';
var NetflixAmbientVideo = () => {
  var videoRef = useRef(null);
  useEffect(() => {
    var _window$matchMedia, _window;
    var videoElement = videoRef.current;
    if (!videoElement || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }
    var reduceMotionQuery = (_window$matchMedia = (_window = window).matchMedia) === null || _window$matchMedia === void 0 ? void 0 : _window$matchMedia.call(_window, '(prefers-reduced-motion: reduce)');
    if (reduceMotionQuery !== null && reduceMotionQuery !== void 0 && reduceMotionQuery.matches) {
      return undefined;
    }
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx || typeof canvas.captureStream !== 'function') {
      if (videoElement.parentElement) {
        videoElement.parentElement.style.display = 'none';
      }
      return undefined;
    }
    var baseWidth = 1280;
    var baseHeight = 720;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = baseWidth * dpr;
    canvas.height = baseHeight * dpr;
    canvas.style.width = "".concat(baseWidth, "px");
    canvas.style.height = "".concat(baseHeight, "px");
    ctx.scale(dpr, dpr);
    var stream = canvas.captureStream(30);
    videoElement.srcObject = stream;
    videoElement.muted = true;
    var safelyPlay = () => {
      if (!videoElement.paused) {
        return;
      }
      var playback = videoElement.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(() => {
          /* Intentionally swallow autoplay errors. */
        });
      }
    };
    safelyPlay();
    var frame = 0;
    var animationFrame;
    var render = () => {
      frame += 1;
      var width = baseWidth;
      var height = baseHeight;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      var baseGradient = ctx.createLinearGradient(0, 0, width, height);
      baseGradient.addColorStop(0, 'rgba(10, 10, 10, 0.92)');
      baseGradient.addColorStop(0.45, 'rgba(20, 20, 20, 0.88)');
      baseGradient.addColorStop(1, 'rgba(12, 12, 12, 0.92)');
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);
      var pulse = (Math.sin(frame / 45) + 1) / 2;
      var halo = ctx.createRadialGradient(width * (0.25 + pulse * 0.35), height * (0.25 + Math.cos(frame / 60) * 0.18), width * 0.05, width * 0.55, height * 0.5, width * 0.85);
      halo.addColorStop(0, "rgba(229, 9, 20, ".concat(0.55 + pulse * 0.3, ")"));
      halo.addColorStop(0.45, 'rgba(118, 0, 12, 0.32)');
      halo.addColorStop(1, 'rgba(5, 5, 5, 0.92)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      var beamWidth = width * (0.22 + Math.sin(frame / 70) * 0.12);
      var beamGradient = ctx.createLinearGradient(0, 0, beamWidth, height * 1.5);
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
      for (var i = 0; i < 45; i += 1) {
        var sparkleSize = 1 + Math.random() * 2;
        ctx.fillStyle = "rgba(255,255,255,".concat(0.15 + Math.random() * 0.25, ")");
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
    var handleVisibility = () => {
      var tracks = stream.getTracks();
      var enabled = !document.hidden;
      tracks.forEach(track => {
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
      stream.getTracks().forEach(track => track.stop());
      if (videoElement.srcObject === stream) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "netflix-ambient-video__container",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    className: "netflix-ambient-video",
    playsInline: true,
    muted: true,
    loop: true,
    autoPlay: true,
    tabIndex: -1
  }));
};
var ThemeContainerBase = _ref => {
  var {
    themeId,
    renderInStandalone,
    backgroundClass,
    overlay,
    children,
    ariaLabel
  } = _ref;
  var Element = renderInStandalone ? 'div' : 'section';
  var padding = renderInStandalone ? 'py-12 px-4 sm:px-8' : 'px-4 py-10 sm:px-8';
  var wrapperClass = renderInStandalone ? 'mx-auto w-full' : 'w-full';
  return /*#__PURE__*/React.createElement(Element, _extends({
    "data-showcase-scope": true,
    "data-showcase-theme": themeId,
    className: "relative isolate min-h-screen ".concat(backgroundClass, " ").concat(padding)
  }, !renderInStandalone ? {
    'aria-label': ariaLabel || 'Vitrine marketing du projet'
  } : {}), /*#__PURE__*/React.createElement("div", {
    className: "pointer-events-none absolute inset-0 overflow-hidden"
  }, overlay), /*#__PURE__*/React.createElement("div", {
    className: "relative ".concat(wrapperClass)
  }, children));
};
export var AppleShowcaseContainer = _ref2 => {
  var {
    children,
    renderInStandalone
  } = _ref2;
  return /*#__PURE__*/React.createElement(ThemeContainerBase, {
    themeId: "apple",
    renderInStandalone: renderInStandalone,
    backgroundClass: "bg-[#f6f7fb]",
    overlay: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75)_0%,_transparent_60%)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.04)_0%,_transparent_55%)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-white via-[#dbe7ff] to-[#b8cffc] opacity-70 blur-[190px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute bottom-[-32%] right-[10%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-white via-[#cff2ff] to-[#9ed4ff] opacity-55 blur-[200px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute bottom-[-28%] left-[12%] h-[420px] w-[420px] rounded-[45%] bg-gradient-to-tr from-[#eff6ff] via-white to-transparent opacity-70 blur-[170px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-x-[18%] top-[26%] h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-x-[20%] top-[26%] h-[3px] -translate-y-[18px] rounded-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent blur"
    }))
  }, children);
};
export var NetflixShowcaseContainer = _ref3 => {
  var {
    children,
    renderInStandalone
  } = _ref3;
  return /*#__PURE__*/React.createElement(ThemeContainerBase, {
    themeId: "netflix",
    renderInStandalone: renderInStandalone,
    backgroundClass: "bg-[#050507]",
    overlay: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NetflixAmbientVideo, null), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,22,0.85),_transparent_70%)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[linear-gradient(120deg,_rgba(229,9,20,0.22)_0%,_transparent_60%)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute -top-40 right-[-28%] h-[520px] w-[520px] rounded-full bg-[#e50914] opacity-35 blur-[170px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute bottom-[-45%] left-[-28%] h-[520px] w-[520px] rounded-full bg-[#801414] opacity-45 blur-[180px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-y-[12%] left-12 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-y-[18%] right-[14%] w-[260px] rotate-12 bg-gradient-to-br from-[#ff3c28]/60 via-transparent to-transparent opacity-70 blur-[140px]"
    })),
    ariaLabel: "Vitrine marketing du projet \u2013 th\xE8me Netflix"
  }, children);
};
export var AmnestyShowcaseContainer = _ref4 => {
  var {
    children,
    renderInStandalone
  } = _ref4;
  return /*#__PURE__*/React.createElement(ThemeContainerBase, {
    themeId: "amnesty",
    renderInStandalone: renderInStandalone,
    backgroundClass: "bg-[#fff9c2]",
    overlay: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[repeating-linear-gradient(120deg,_rgba(0,0,0,0.08)_0,_rgba(0,0,0,0.08)_18px,_transparent_18px,_transparent_36px)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,237,0,0.35)_0%,_transparent_55%)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute -top-32 left-1/4 h-52 w-52 rotate-6 rounded-full bg-[#ffe066] opacity-70 blur-3xl"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute bottom-[-14%] right-[18%] h-80 w-80 -rotate-6 rounded-full bg-[#ffd43b] opacity-65 blur-3xl"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-y-[25%] left-[10%] w-[220px] -rotate-12 bg-gradient-to-br from-black/20 via-transparent to-transparent opacity-50 blur-[90px]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-x-[14%] bottom-[18%] h-[2px] bg-[repeating-linear-gradient(90deg,_#121212_0,_#121212_12px,_transparent_12px,_transparent_24px)] opacity-40"
    })),
    ariaLabel: "Vitrine marketing du projet \u2013 th\xE8me Amnesty International"
  }, children);
};
export var NebulaShowcaseContainer = _ref5 => {
  var {
    children,
    renderInStandalone
  } = _ref5;
  return /*#__PURE__*/React.createElement(ThemeContainerBase, {
    themeId: "nebula",
    renderInStandalone: renderInStandalone,
    backgroundClass: "bg-[#030513]",
    overlay: /*#__PURE__*/React.createElement("div", {
      className: "nebula-overlay",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "nebula-overlay__grid"
    }), /*#__PURE__*/React.createElement("div", {
      className: "nebula-aurora"
    }), /*#__PURE__*/React.createElement("div", {
      className: "nebula-orb nebula-orb--one"
    }), /*#__PURE__*/React.createElement("div", {
      className: "nebula-orb nebula-orb--two"
    }), /*#__PURE__*/React.createElement("div", {
      className: "nebula-orb nebula-orb--three"
    }), /*#__PURE__*/React.createElement("div", {
      className: "nebula-constellation"
    })),
    ariaLabel: "Vitrine marketing du projet \u2013 th\xE8me Nebula Pulse"
  }, children);
};