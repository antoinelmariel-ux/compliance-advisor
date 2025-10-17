import { useEffect } from '../../../react.js';
var activateImmediately = elements => {
  elements.forEach(element => {
    element.classList.add('is-visible');
  });
};
export var useShowcaseAnimations = function useShowcaseAnimations() {
  var deps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    var elements = Array.from(document.querySelectorAll('[data-showcase-scope] .animate-on-scroll'));
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
    var observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });
    elements.forEach(element => observer.observe(element));
    return () => {
      observer.disconnect();
    };
  }, deps);
};