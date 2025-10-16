import React, { useEffect } from '../../../react.js';
import { NetflixShowcaseContainer } from '../ThemeContainers.jsx';
import { ShowcaseContent } from '../shared/ShowcaseContent.jsx';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';

export const NetflixShowcase = ({
  data,
  themeSwitch,
  onClose,
  renderInStandalone,
  serializedPayload
}) => {
  useShowcaseAnimations([data, themeSwitch?.selected]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return undefined;
    }

    const scope = document.querySelector('[data-showcase-scope][data-showcase-theme="netflix"]');

    if (!scope) {
      return undefined;
    }

    const carouselSelectors = [
      '[data-role="hero-highlights"]',
      '[data-section="audience"] [data-role="tag-list"]'
    ];

    const carouselSelector = carouselSelectors.join(', ');

    const carousels = Array.from(scope.querySelectorAll(carouselSelector));

    let lastKnownActive = carousels[0] || null;

    const cleanupFns = [];

    carousels.forEach((carousel) => {
      const markActive = () => {
        carousel.dataset.netflixActive = 'true';
        lastKnownActive = carousel;
      };

      const markInactive = () => {
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

    const handleArrowNavigation = (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      const focusedCarousel = document.activeElement?.closest(carouselSelector);

      const hoveredCarousel = carousels.find((carousel) => carousel.dataset.netflixActive === 'true');

      const target = focusedCarousel || hoveredCarousel || lastKnownActive;

      if (!target) {
        return;
      }

      lastKnownActive = target;

      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const scrollAmount = target.clientWidth * 0.65;

      target.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      event.preventDefault();
    };

    const arrowListenerOptions = { passive: false };
    window.addEventListener('keydown', handleArrowNavigation, arrowListenerOptions);

    return () => {
      window.removeEventListener('keydown', handleArrowNavigation, arrowListenerOptions);
      cleanupFns.forEach((fn) => fn());
    };
  }, [data, themeSwitch?.selected]);

  useEffect(() => {
    if (typeof onClose !== 'function' || typeof window === 'undefined') {
      return undefined;
    }

    const handleEscape = (event) => {
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

  return (
    <NetflixShowcaseContainer renderInStandalone={renderInStandalone}>
      <ShowcaseContent
        data={data}
        themeSwitch={themeSwitch}
        onClose={onClose}
        renderInStandalone={renderInStandalone}
        serializedPayload={serializedPayload}
        classNames={{
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
        }}
      />
    </NetflixShowcaseContainer>
  );
};

