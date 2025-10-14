import React from '../../../react.js';
import { AppleShowcaseContainer } from '../ThemeContainers.jsx';
import { ShowcaseContent } from '../shared/ShowcaseContent.jsx';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';

export const AppleShowcase = ({
  data,
  themeSwitch,
  onClose,
  renderInStandalone,
  serializedPayload
}) => {
  useShowcaseAnimations([data, themeSwitch?.selected]);

  return (
    <AppleShowcaseContainer renderInStandalone={renderInStandalone}>
      <ShowcaseContent
        data={data}
        themeSwitch={themeSwitch}
        onClose={onClose}
        renderInStandalone={renderInStandalone}
        serializedPayload={serializedPayload}
        classNames={{
          article: 'apple-showcase-surface',
          themeSwitcher: 'animate-on-scroll apple-switcher',
          heroSection: 'animate-on-scroll apple-hero',
          heroHighlights: 'animate-on-scroll apple-hero-highlights',
          audienceSection: 'animate-on-scroll apple-section',
          problemSection: 'animate-on-scroll apple-section',
          solutionSection: 'animate-on-scroll apple-section',
          innovationSection: 'animate-on-scroll apple-section',
          teamSection: 'animate-on-scroll apple-section',
          timelineSection: 'animate-on-scroll apple-section',
          analysisSection: 'animate-on-scroll apple-section',
          opportunitiesSection: 'animate-on-scroll apple-section',
          missingSection: 'animate-on-scroll apple-section',
          actionsSection: 'animate-on-scroll apple-actions'
        }}
      />
    </AppleShowcaseContainer>
  );
};

