import React from '../../../react.js';
import { AmnestyShowcaseContainer } from '../ThemeContainers.js';
import { ShowcaseContent } from '../shared/ShowcaseContent.js';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';
export var AmnestyShowcase = _ref => {
  var {
    data,
    themeSwitch,
    onClose,
    renderInStandalone,
    serializedPayload,
    editing
  } = _ref;
  useShowcaseAnimations([data, themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected]);
  return /*#__PURE__*/React.createElement(AmnestyShowcaseContainer, {
    renderInStandalone: renderInStandalone
  }, /*#__PURE__*/React.createElement(ShowcaseContent, {
    data: data,
    themeSwitch: themeSwitch,
    onClose: onClose,
    renderInStandalone: renderInStandalone,
    serializedPayload: serializedPayload,
    editing: editing,
    classNames: {
      article: 'amnesty-showcase-canvas',
      themeSwitcher: 'animate-on-scroll amnesty-switcher',
      heroSection: 'animate-on-scroll amnesty-hero',
      heroHighlights: 'animate-on-scroll amnesty-hero-highlights',
      audienceSection: 'animate-on-scroll amnesty-section',
      problemSection: 'animate-on-scroll amnesty-section',
      solutionSection: 'animate-on-scroll amnesty-section',
      teamSection: 'animate-on-scroll amnesty-section',
      timelineSection: 'animate-on-scroll amnesty-section',
      analysisSection: 'animate-on-scroll amnesty-section',
      opportunitiesSection: 'animate-on-scroll amnesty-section',
      missingSection: 'animate-on-scroll amnesty-section',
      actionsSection: 'animate-on-scroll amnesty-actions'
    }
  }));
};