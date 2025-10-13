export const SHOWCASE_THEME_STORAGE_KEY = 'compliance-advisor.showcase-theme';

export const SHOWCASE_THEMES = [
  {
    id: 'inspiration',
    label: 'Inspiration',
    shortLabel: 'Inspiration',
    description:
      'Style Apple clair : typographie SF Pro, surfaces immaculées et accents bleus subtils.',
  },
  {
    id: 'netflix',
    label: 'Immersion cinéma',
    shortLabel: 'Netflix',
    description:
      'Ambiance Netflix : fond cinématographique sombre, rouge signature et halos lumineux.',
  },
  {
    id: 'amnesty',
    label: 'Engagement Amnesty',
    shortLabel: 'Amnesty',
    description:
      "Contrastes noir/jaune inspirés d’Amnesty International, typographie militante et badges manifestes.",
  },
];

export const DEFAULT_SHOWCASE_THEME = SHOWCASE_THEMES[0]?.id || 'inspiration';

export const isShowcaseTheme = (themeId) =>
  typeof themeId === 'string' && SHOWCASE_THEMES.some(theme => theme.id === themeId);
