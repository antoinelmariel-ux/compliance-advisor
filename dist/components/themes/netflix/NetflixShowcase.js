import React, { useEffect } from '../../../react.js';
import { NetflixShowcaseContainer } from '../ThemeContainers.js';
import { ShowcaseContent } from '../shared/ShowcaseContent.js';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';
export var NetflixShowcase = _ref => {
  var {
    data,
    themeSwitch,
    onClose,
    renderInStandalone,
    serializedPayload,
    editing
  } = _ref;
  useShowcaseAnimations([data, themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected]);
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return undefined;
    }
    var scope = document.querySelector('[data-showcase-scope][data-showcase-theme="netflix"]');
    if (!scope) {
      return undefined;
    }
    var carouselSelectors = ['[data-role="hero-highlights"]', '[data-section="audience"] [data-role="tag-list"]'];
    var carouselSelector = carouselSelectors.join(', ');
    var carousels = Array.from(scope.querySelectorAll(carouselSelector));
    var lastKnownActive = carousels[0] || null;
    var cleanupFns = [];
    carousels.forEach(carousel => {
      var markActive = () => {
        carousel.dataset.netflixActive = 'true';
        lastKnownActive = carousel;
      };
      var markInactive = () => {
        delete carousel.dataset.netflixActive;
      };
      carousel.addEventListener('pointerenter', markActive);
      carousel.addEventListener('focusin', markActive);
      carousel.addEventListener('pointerleave', markInactive);
      carousel.addEventListener('focusout', markInactive);
      cleanupFns.push(() => {
        carousel.removeEventListener('pointerenter', markActive);
        carousel.removeEventListener('focusin', markActive);
        carousel.removeEventListener('pointerleave', markInactive);
        carousel.removeEventListener('focusout', markInactive);
      });
    });
    var handleArrowNavigation = event => {
      var _document$activeEleme;
      if (event.defaultPrevented) {
        return;
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }
      var focusedCarousel = (_document$activeEleme = document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.closest(carouselSelector);
      var hoveredCarousel = carousels.find(carousel => carousel.dataset.netflixActive === 'true');
      var target = focusedCarousel || hoveredCarousel || lastKnownActive;
      if (!target) {
        return;
      }
      lastKnownActive = target;
      var direction = event.key === 'ArrowRight' ? 1 : -1;
      var scrollAmount = target.clientWidth * 0.65;
      target.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
      event.preventDefault();
    };
    var arrowListenerOptions = {
      passive: false
    };
    window.addEventListener('keydown', handleArrowNavigation, arrowListenerOptions);
    return () => {
      window.removeEventListener('keydown', handleArrowNavigation, arrowListenerOptions);
      cleanupFns.forEach(fn => fn());
    };
  }, [data, themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected]);
  useEffect(() => {
    if (typeof onClose !== 'function' || typeof window === 'undefined') {
      return undefined;
    }
    var handleEscape = event => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  return /*#__PURE__*/React.createElement(NetflixShowcaseContainer, {
    renderInStandalone: renderInStandalone
  }, /*#__PURE__*/React.createElement(ShowcaseContent, {
    data: data,
    themeSwitch: themeSwitch,
    onClose: onClose,
    renderInStandalone: renderInStandalone,
    serializedPayload: serializedPayload,
    editing: editing,
    classNames: {
      article: 'netflix-showcase-frame',
      themeSwitcher: 'animate-on-scroll netflix-switcher',
      heroSection: 'animate-on-scroll netflix-hero',
      heroHighlights: 'animate-on-scroll netflix-hero-highlights',
      audienceSection: 'animate-on-scroll netflix-section',
      problemSection: 'animate-on-scroll netflix-section',
      solutionSection: 'animate-on-scroll netflix-section',
      teamSection: 'animate-on-scroll netflix-section',
      timelineSection: 'animate-on-scroll netflix-section',
      analysisSection: 'animate-on-scroll netflix-section',
      opportunitiesSection: 'animate-on-scroll netflix-section',
      missingSection: 'animate-on-scroll netflix-section',
      actionsSection: 'animate-on-scroll netflix-actions'
    }
  }));
};