import React from '../../../react.js';
import { AmnestyShowcaseContainer } from '../ThemeContainers.jsx';
import { ShowcaseContent } from '../shared/ShowcaseContent.jsx';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';

export const AmnestyShowcase = ({
  data,
  themeSwitch,
  onClose,
  renderInStandalone,
  serializedPayload
}) => {
  useShowcaseAnimations([data, themeSwitch?.selected]);

  return (
    <AmnestyShowcaseContainer renderInStandalone={renderInStandalone}>
      <ShowcaseContent
        data={data}
        themeSwitch={themeSwitch}
        onClose={onClose}
        renderInStandalone={renderInStandalone}
        serializedPayload={serializedPayload}
        classNames={{
          article: 'amnesty-showcase-canvas',
          themeSwitcher: 'animate-on-scroll amnesty-switcher',
          heroSection: 'animate-on-scroll amnesty-hero',
          heroHighlights: 'animate-on-scroll amnesty-hero-highlights',
          audienceSection: 'animate-on-scroll amnesty-section',
          problemSection: 'animate-on-scroll amnesty-section',
          solutionSection: 'animate-on-scroll amnesty-section',
          innovationSection: 'animate-on-scroll amnesty-section',
          teamSection: 'animate-on-scroll amnesty-section',
          timelineSection: 'animate-on-scroll amnesty-section',
          analysisSection: 'animate-on-scroll amnesty-section',
          opportunitiesSection: 'animate-on-scroll amnesty-section',
          missingSection: 'animate-on-scroll amnesty-section',
          actionsSection: 'animate-on-scroll amnesty-actions'
        }}
      />
    </AmnestyShowcaseContainer>
  );
};

