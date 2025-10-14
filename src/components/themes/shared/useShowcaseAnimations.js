import { useEffect } from '../../../react.js';

const activateImmediately = (elements) => {
  elements.forEach((element) => {
    element.classList.add('is-visible');
  });
};

export const useShowcaseAnimations = (deps = []) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll('[data-showcase-scope] .animate-on-scroll')
    );

    if (elements.length === 0) {
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activateImmediately(elements);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      activateImmediately(elements);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        root: null,
        threshold: 0.15
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, deps);
};

