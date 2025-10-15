import React from '../../../react.js';
import { NebulaShowcaseContainer } from '../ThemeContainers.jsx';
import { ShowcaseContent } from '../shared/ShowcaseContent.jsx';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';

export const NebulaShowcase = ({
  data,
  themeSwitch,
  onClose,
  renderInStandalone,
  serializedPayload
}) => {
  useShowcaseAnimations([data, themeSwitch?.selected]);

  return (
    <NebulaShowcaseContainer renderInStandalone={renderInStandalone}>
      <ShowcaseContent
        data={data}
        themeSwitch={themeSwitch}
        onClose={onClose}
        renderInStandalone={renderInStandalone}
        serializedPayload={serializedPayload}
        classNames={{
          article: 'nebula-showcase',
          card: 'nebula-panel',
          body: 'nebula-body',
          themeSwitcher: 'animate-on-scroll nebula-switcher',
          heroSection: 'animate-on-scroll nebula-hero',
          heroHighlights: 'nebula-hero-highlights',
          audienceSection: 'animate-on-scroll nebula-section nebula-section--audience',
          problemSection: 'animate-on-scroll nebula-section nebula-section--problem',
          solutionSection: 'animate-on-scroll nebula-section nebula-section--solution',
          innovationSection: 'animate-on-scroll nebula-section nebula-section--innovation',
          teamSection: 'animate-on-scroll nebula-section nebula-section--team',
          timelineSection: 'animate-on-scroll nebula-section nebula-section--timeline',
          analysisSection: 'animate-on-scroll nebula-section nebula-section--analysis',
          opportunitiesSection: 'animate-on-scroll nebula-section nebula-section--opportunities',
          missingSection: 'animate-on-scroll nebula-section nebula-missing',
          actionsSection: 'animate-on-scroll nebula-section nebula-actions'
        }}
      />
    </NebulaShowcaseContainer>
  );
};
