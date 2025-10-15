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
          card: 'apple-showcase-panel',
          body: 'apple-showcase-body',
          themeSwitcher: 'animate-on-scroll apple-switcher apple-parallax',
          heroSection: 'animate-on-scroll apple-hero apple-parallax',
          heroHighlights: 'apple-hero-highlights',
          audienceSection: 'animate-on-scroll apple-section apple-section--tags apple-parallax',
          problemSection: 'animate-on-scroll apple-section apple-section--narrative apple-parallax',
          solutionSection: 'animate-on-scroll apple-section apple-section--grid apple-parallax',
          innovationSection: 'animate-on-scroll apple-section apple-section--narrative apple-parallax',
          teamSection: 'animate-on-scroll apple-section apple-section--grid apple-parallax',
          timelineSection: 'animate-on-scroll apple-section apple-section--timeline apple-parallax',
          analysisSection: 'animate-on-scroll apple-section apple-section--analysis apple-parallax',
          opportunitiesSection: 'animate-on-scroll apple-section apple-section--opportunities apple-parallax',
          missingSection: 'animate-on-scroll apple-section apple-section--missing apple-parallax',
          actionsSection: 'animate-on-scroll apple-actions apple-parallax'
        }}
      />
    </AppleShowcaseContainer>
  );
};

