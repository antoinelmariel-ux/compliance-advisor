import React from '../../../react.js';
import { NebulaShowcaseContainer } from '../ThemeContainers.js';
import { ShowcaseContent } from '../shared/ShowcaseContent.js';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';
export var NebulaShowcase = _ref => {
  var {
    data,
    themeSwitch,
    onClose,
    renderInStandalone,
    serializedPayload,
    editing
  } = _ref;
  useShowcaseAnimations([data, themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected]);
  return /*#__PURE__*/React.createElement(NebulaShowcaseContainer, {
    renderInStandalone: renderInStandalone
  }, /*#__PURE__*/React.createElement(ShowcaseContent, {
    data: data,
    themeSwitch: themeSwitch,
    onClose: onClose,
    renderInStandalone: renderInStandalone,
    serializedPayload: serializedPayload,
    editing: editing,
    classNames: {
      article: 'nebula-showcase',
      card: 'nebula-panel',
      body: 'nebula-body',
      themeSwitcher: 'animate-on-scroll nebula-switcher',
      heroSection: 'animate-on-scroll nebula-hero',
      heroHighlights: 'nebula-hero-highlights',
      audienceSection: 'animate-on-scroll nebula-section nebula-section--audience',
      problemSection: 'animate-on-scroll nebula-section nebula-section--problem',
      solutionSection: 'animate-on-scroll nebula-section nebula-section--solution',
      teamSection: 'animate-on-scroll nebula-section nebula-section--team',
      timelineSection: 'animate-on-scroll nebula-section nebula-section--timeline',
      analysisSection: 'animate-on-scroll nebula-section nebula-section--analysis',
      opportunitiesSection: 'animate-on-scroll nebula-section nebula-section--opportunities',
      missingSection: 'animate-on-scroll nebula-section nebula-missing',
      actionsSection: 'animate-on-scroll nebula-section nebula-actions'
    }
  }));
};