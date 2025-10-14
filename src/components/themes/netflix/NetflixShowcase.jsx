import React from '../../../react.js';
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
          innovationSection: 'animate-on-scroll netflix-section',
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

