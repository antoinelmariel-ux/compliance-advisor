import React, { useCallback, useEffect, useMemo, useState } from '../react.js';
import { formatAnswer } from '../utils/questions.js';
import {
  AppleShowcaseContainer,
  NetflixShowcaseContainer,
  AmnestyShowcaseContainer
} from './themes/ThemeContainers.jsx';

const findQuestionById = (questions, id) => {
  if (!Array.isArray(questions)) {
    return null;
  }

  return questions.find(question => question?.id === id) || null;
};

const getFormattedAnswer = (questions, answers, id) => {
  const question = findQuestionById(questions, id);
  if (!question) {
    return '';
  }

  return formatAnswer(question, answers?.[id]);
};

const getRawAnswer = (answers, id) => {
  if (!answers) {
    return undefined;
  }

  return answers[id];
};

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const SHOWCASE_THEME_STORAGE_KEY = 'compliance-advisor.showcase-theme';

const SHOWCASE_THEMES = [
  {
    id: 'apple',
    label: 'Apple Keynote',
    description:
      'Esprit Apple Keynote : lumière diffuse, typographie SF Pro et halo bleu précis.'
  },
  {
    id: 'netflix',
    label: 'Immersion cinéma',
    description:
      'Ambiance Netflix : fond cinématographique sombre, rouge signature et halos lumineux.'
  },
  {
    id: 'amnesty',
    label: 'Engagement Amnesty',
    description:
      "Contrastes noir/jaune inspirés d’Amnesty International, typographie militante et badges manifestes."
  }
];

const THEME_CONTAINERS = {
  apple: AppleShowcaseContainer,
  netflix: NetflixShowcaseContainer,
  amnesty: AmnestyShowcaseContainer
};

const REQUIRED_SHOWCASE_QUESTION_IDS = [
  'projectName',
  'projectSlogan',
  'targetAudience',
  'problemPainPoints',
  'solutionDescription',
  'solutionBenefits',
  'solutionComparison',
  'innovationProcess',
  'visionStatement',
  'teamLead',
  'teamCoreMembers',
  'campaignKickoffDate',
  'launchDate'
];

const parseListAnswer = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(entry => (typeof entry === 'string' ? entry.trim() : String(entry)))
      .filter(item => item.length > 0);
  }

  return String(value)
    .split(/\r?\n|·|•|;|,/)
    .map(entry => entry.replace(/^[-•\s]+/, '').trim())
    .filter(entry => entry.length > 0);
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed);
};

const computeRunway = (answers) => {
  const startRaw = answers?.campaignKickoffDate;
  const endRaw = answers?.launchDate;

  if (!startRaw || !endRaw) {
    return null;
  }

  const start = new Date(startRaw);
  const end = new Date(endRaw);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return null;
  }

  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffWeeks = diffDays / 7;

  return {
    start,
    end,
    diffDays,
    diffWeeks,
    startLabel: formatDate(start),
    endLabel: formatDate(end),
    weeksLabel: `${Math.round(diffWeeks)} sem.`,
    daysLabel: `${Math.round(diffDays)} j.`
  };
};

const sanitizeTimelineProfiles = (profiles) => {
  if (!Array.isArray(profiles)) {
    return [];
  }

  return profiles.map((profile, index) => {
    if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
      const labelCandidate = [profile.label, profile.name, profile.id]
        .map(value => {
          if (typeof value === 'string') {
            return value.trim();
          }
          if (typeof value === 'number') {
            return String(value);
          }
          return '';
        })
        .find(value => value.length > 0);

      const label = labelCandidate && labelCandidate.length > 0
        ? labelCandidate
        : `Profil ${index + 1}`;
      const description = typeof profile.description === 'string' && profile.description.trim().length > 0
        ? profile.description.trim()
        : null;

      return {
        id: typeof profile.id === 'string' && profile.id.trim().length > 0
          ? profile.id
          : `timeline-profile-${index}`,
        label,
        description,
        requirements: profile.requirements && typeof profile.requirements === 'object'
          ? profile.requirements
          : undefined
      };
    }

    const stringLabel = typeof profile === 'string' ? profile.trim() : '';
    const label = stringLabel.length > 0 ? stringLabel : `Profil ${index + 1}`;

    return {
      id: `timeline-profile-${index}`,
      label,
      description: null,
      requirements: undefined
    };
  });
};

const computeTimelineSummary = (timelineDetails) => {
  if (!Array.isArray(timelineDetails)) {
    return null;
  }

  const detailWithDiff = timelineDetails.find(detail => Boolean(detail?.diff));
  if (!detailWithDiff) {
    return null;
  }

  const diff = detailWithDiff.diff;
  const weeks = Math.round(diff.diffInWeeks);
  const days = Math.round(diff.diffInDays);

  return {
    ruleId: detailWithDiff.ruleId || null,
    ruleName: detailWithDiff.ruleName || null,
    satisfied: Boolean(detailWithDiff.satisfied),
    weeks,
    days,
    profiles: sanitizeTimelineProfiles(detailWithDiff.profiles)
  };
};

const getPrimaryRisk = (analysis) => {
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  if (risks.length === 0) {
    return null;
  }

  const priorityWeight = { Critique: 3, Important: 2, Recommandé: 1 };

  return risks.reduce((acc, risk) => {
    if (!acc) {
      return risk;
    }

    const currentWeight = priorityWeight[risk.priority] || 0;
    const bestWeight = priorityWeight[acc.priority] || 0;

    if (currentWeight > bestWeight) {
      return risk;
    }

    return acc;
  }, null);
};

const buildHeroHighlights = ({ targetAudience, runway }) => {
  const highlights = [];

  if (hasText(targetAudience)) {
    highlights.push({
      id: 'audience',
      label: 'Audience principale',
      value: targetAudience,
      caption: "Les personas qui verront la promesse en premier."
    });
  }

  if (runway) {
    highlights.push({
      id: 'runway',
      label: 'Runway avant lancement',
      value: `${runway.weeksLabel} (${runway.daysLabel})`,
      caption: `Du ${runway.startLabel} au ${runway.endLabel}.`
    });
  }

  return highlights;
};

const sanitizeForScript = (payload) => {
  try {
    return JSON.stringify(payload, null, 2).replace(/</g, '\\u003c');
  } catch (error) {
    return '{}';
  }
};

const buildShowcasePayload = ({
  selectedTheme,
  safeProjectName,
  slogan,
  targetAudienceList,
  heroHighlights,
  problemPainPoints,
  solutionDescription,
  solutionBenefits,
  solutionComparison,
  innovationProcess,
  visionStatement,
  teamLead,
  teamCoreMembersList,
  normalizedTeams,
  runway,
  timelineSummary,
  timelineDetails,
  complexity,
  analysis,
  primaryRisk,
  missingShowcaseQuestions
}) => ({
  theme: selectedTheme,
  projectName: safeProjectName,
  slogan: hasText(slogan) ? slogan : null,
  audience: {
    summary: targetAudienceList.join(', ') || null,
    items: targetAudienceList
  },
  highlights: heroHighlights,
  sections: {
    problem: { painPoints: problemPainPoints },
    solution: {
      description: hasText(solutionDescription) ? solutionDescription : null,
      benefits: solutionBenefits,
      comparison: hasText(solutionComparison) ? solutionComparison : null
    },
    innovation: {
      process: hasText(innovationProcess) ? innovationProcess : null,
      vision: hasText(visionStatement) ? visionStatement : null
    },
    team: {
      lead: hasText(teamLead) ? teamLead : null,
      coreMembers: teamCoreMembersList,
      relevantTeams: normalizedTeams
    },
    timeline: {
      runway,
      summary: timelineSummary,
      details: timelineDetails
    },
    analysis: {
      complexity: complexity || null,
      summary: hasText(analysis?.summary) ? analysis.summary : null,
      primaryRisk,
      risks: Array.isArray(analysis?.risks) ? analysis.risks : [],
      opportunities: Array.isArray(analysis?.opportunities) ? analysis.opportunities : [],
      raw: analysis || null
    }
  },
  missingQuestions: missingShowcaseQuestions
});

export const ProjectShowcase = ({
  projectName,
  onClose,
  analysis,
  relevantTeams,
  questions,
  answers,
  timelineDetails = [],
  renderInStandalone = false
}) => {
  const rawProjectName = typeof projectName === 'string' ? projectName.trim() : '';
  const safeProjectName = rawProjectName.length > 0 ? rawProjectName : 'Votre projet';

  const [selectedTheme, setSelectedTheme] = useState(() => {
    const fallbackTheme = SHOWCASE_THEMES[0]?.id || 'apple';

    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return fallbackTheme;
    }

    try {
      const storedTheme = window.localStorage.getItem(SHOWCASE_THEME_STORAGE_KEY);
      if (typeof storedTheme === 'string' && SHOWCASE_THEMES.some(theme => theme.id === storedTheme)) {
        return storedTheme;
      }
    } catch (error) {
      // Ignorer les erreurs d'accès au stockage.
    }

    return fallbackTheme;
  });

  const activeTheme = useMemo(
    () => SHOWCASE_THEMES.find(theme => theme.id === selectedTheme) || SHOWCASE_THEMES[0] || null,
    [selectedTheme]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SHOWCASE_THEME_STORAGE_KEY, selectedTheme);
    } catch (error) {
      // Ignorer les erreurs d'accès au stockage.
    }
  }, [selectedTheme]);

  const handleThemeChange = useCallback((nextThemeId) => {
    if (!SHOWCASE_THEMES.some(theme => theme.id === nextThemeId)) {
      return;
    }

    setSelectedTheme(nextThemeId);
  }, []);

  const normalizedTeams = useMemo(() => {
    if (!Array.isArray(relevantTeams)) {
      return [];
    }

    return relevantTeams.map(team => ({
      id: team.id || null,
      name: team.name || '',
      contact: team.contact || '',
      expertise: team.expertise || ''
    }));
  }, [relevantTeams]);

  const slogan = getFormattedAnswer(questions, answers, 'projectSlogan');
  const targetAudienceList = useMemo(
    () => parseListAnswer(getRawAnswer(answers, 'targetAudience')),
    [answers]
  );
  const targetAudience = targetAudienceList.join(', ');
  const problemPainPoints = useMemo(
    () => parseListAnswer(getRawAnswer(answers, 'problemPainPoints')),
    [answers]
  );
  const solutionDescription = getFormattedAnswer(questions, answers, 'solutionDescription');
  const solutionBenefits = useMemo(
    () => parseListAnswer(getRawAnswer(answers, 'solutionBenefits')),
    [answers]
  );
  const solutionComparison = getFormattedAnswer(questions, answers, 'solutionComparison');
  const innovationProcess = getFormattedAnswer(questions, answers, 'innovationProcess');
  const visionStatement = getFormattedAnswer(questions, answers, 'visionStatement');
  const teamLead = getFormattedAnswer(questions, answers, 'teamLead');
  const teamCoreMembersList = useMemo(
    () => parseListAnswer(getRawAnswer(answers, 'teamCoreMembers')),
    [answers]
  );

  const runway = useMemo(() => computeRunway(answers), [answers]);
  const timelineSummary = useMemo(() => computeTimelineSummary(timelineDetails), [timelineDetails]);
  const primaryRisk = useMemo(() => getPrimaryRisk(analysis), [analysis]);
  const heroHighlights = useMemo(
    () => buildHeroHighlights({ targetAudience, runway }),
    [targetAudience, runway]
  );
  const complexity = analysis?.complexity || null;

  const missingShowcaseQuestions = useMemo(() => {
    const available = new Set(
      Array.isArray(questions)
        ? questions.map(question => question?.id).filter(Boolean)
        : []
    );
    return REQUIRED_SHOWCASE_QUESTION_IDS.filter(id => !available.has(id));
  }, [questions]);

  const payload = useMemo(
    () =>
      buildShowcasePayload({
        selectedTheme,
        safeProjectName,
        slogan,
        targetAudienceList,
        heroHighlights,
        problemPainPoints,
        solutionDescription,
        solutionBenefits,
        solutionComparison,
        innovationProcess,
        visionStatement,
        teamLead,
        teamCoreMembersList,
        normalizedTeams,
        runway,
        timelineSummary,
        timelineDetails: Array.isArray(timelineDetails) ? timelineDetails : [],
        complexity,
        analysis,
        primaryRisk,
        missingShowcaseQuestions
      }),
    [
      selectedTheme,
      safeProjectName,
      slogan,
      targetAudienceList,
      heroHighlights,
      problemPainPoints,
      solutionDescription,
      solutionBenefits,
      solutionComparison,
      innovationProcess,
      visionStatement,
      teamLead,
      teamCoreMembersList,
      normalizedTeams,
      runway,
      timelineSummary,
      timelineDetails,
      complexity,
      analysis,
      primaryRisk,
      missingShowcaseQuestions
    ]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent('project-showcase:data', { detail: payload }));
      window.__PROJECT_SHOWCASE_DATA__ = payload;
    } catch (error) {
      // Ignorer les erreurs lors de la diffusion de l'événement.
    }
  }, [payload]);

  const serializedPayload = useMemo(() => sanitizeForScript(payload), [payload]);

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const ThemeContainer = THEME_CONTAINERS[selectedTheme] || AppleShowcaseContainer;

  return (
    <ThemeContainer renderInStandalone={renderInStandalone}>
      <article
        data-component="project-showcase"
        data-theme={selectedTheme}
        data-standalone={renderInStandalone ? 'true' : 'false'}
      >
        <div data-showcase-card>
          <div data-showcase-overlay aria-hidden="true" />
          <div data-showcase-body>
            <section data-section="theme" data-showcase-theme-switcher>
              <h2>Style de présentation</h2>
              {activeTheme?.description ? (
                <p data-role="theme-description">{activeTheme.description}</p>
              ) : null}
              <div data-role="theme-options">
                {SHOWCASE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    data-theme-option={theme.id}
                    aria-pressed={theme.id === selectedTheme}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </section>

            <header data-section="hero" data-showcase-section="hero">
              <div data-role="hero-header">
                <p data-role="eyebrow">Vitrine du projet</p>
                <h1 data-field="project-name">{safeProjectName}</h1>
                {hasText(slogan) ? <p data-field="project-slogan">{slogan}</p> : null}
              </div>
              {heroHighlights.length > 0 && (
                <div data-role="hero-highlights">
                  {heroHighlights.map(highlight => (
                    <article data-showcase-element="hero-highlight" data-highlight={highlight.id} key={highlight.id}>
                      <h3 data-role="label">{highlight.label}</h3>
                      <p data-role="value">{highlight.value}</p>
                      {highlight.caption ? <p data-role="caption">{highlight.caption}</p> : null}
                    </article>
                  ))}
                </div>
              )}
            </header>

            {targetAudienceList.length > 0 && (
              <section data-section="audience" data-showcase-section="audience">
                <h2>Audiences cibles</h2>
                <ul data-field="target-audience" data-role="tag-list">
                  {targetAudienceList.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {problemPainPoints.length > 0 && (
              <section data-section="problem" data-showcase-section="problem">
                <h2>Problèmes identifiés</h2>
                <ul data-field="problem-pain-points">
                  {problemPainPoints.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {(hasText(solutionDescription) || solutionBenefits.length > 0 || hasText(solutionComparison)) && (
              <section data-section="solution" data-showcase-section="solution">
                <h2>Proposition de valeur</h2>
                <div data-role="split-layout">
                  {hasText(solutionDescription) ? (
                    <article data-showcase-element="solution-card">
                      <h3>Description</h3>
                      <p data-field="solution-description">{solutionDescription}</p>
                    </article>
                  ) : null}
                  {solutionBenefits.length > 0 && (
                    <article data-showcase-element="solution-card">
                      <h3>Bénéfices clés</h3>
                      <ul data-field="solution-benefits">
                        {solutionBenefits.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  )}
                  {hasText(solutionComparison) ? (
                    <article data-showcase-element="solution-card">
                      <h3>Différenciation</h3>
                      <p data-field="solution-comparison">{solutionComparison}</p>
                    </article>
                  ) : null}
                </div>
              </section>
            )}

            {(hasText(innovationProcess) || hasText(visionStatement)) && (
              <section data-section="innovation" data-showcase-section="innovation">
                <h2>Innovation &amp; vision</h2>
                <div data-role="split-layout">
                  {hasText(innovationProcess) ? (
                    <article data-showcase-element="vision-card">
                      <h3>Approche</h3>
                      <p data-field="innovation-process">{innovationProcess}</p>
                    </article>
                  ) : null}
                  {hasText(visionStatement) ? (
                    <article data-showcase-element="vision-card">
                      <h3>Vision</h3>
                      <p data-field="vision-statement">{visionStatement}</p>
                    </article>
                  ) : null}
                </div>
              </section>
            )}

            {(hasText(teamLead) || teamCoreMembersList.length > 0 || normalizedTeams.length > 0) && (
              <section data-section="team" data-showcase-section="team">
                <h2>Équipe projet</h2>
                <div data-role="split-layout">
                  {hasText(teamLead) ? (
                    <article data-showcase-element="team-card">
                      <h3>Leadership</h3>
                      <p data-field="team-lead">{teamLead}</p>
                    </article>
                  ) : null}
                  {teamCoreMembersList.length > 0 && (
                    <article data-showcase-element="team-card">
                      <h3>Membres clés</h3>
                      <ul data-field="team-core-members" data-role="tag-list">
                        {teamCoreMembersList.map((member, index) => (
                          <li key={`${member}-${index}`}>{member}</li>
                        ))}
                      </ul>
                    </article>
                  )}
                  {normalizedTeams.length > 0 && (
                    <article data-showcase-element="team-card">
                      <h3>Experts conformité</h3>
                      <div data-role="team-grid">
                        {normalizedTeams.map(team => (
                          <div data-showcase-aside="team-profile" key={team.id || team.name}>
                            <h4>{team.name}</h4>
                            {team.expertise ? (
                              <p data-role="team-expertise">{team.expertise}</p>
                            ) : null}
                            {team.contact ? (
                              <p data-role="team-contact">{team.contact}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </article>
                  )}
                </div>
              </section>
            )}

            {(runway || timelineSummary || (Array.isArray(timelineDetails) && timelineDetails.length > 0)) && (
              <section data-section="timeline" data-showcase-section="timeline">
                <h2>Feuille de route</h2>
                <div data-role="split-layout">
                  {runway ? (
                    <article data-showcase-element="timeline-profile">
                      <h3>Période clef</h3>
                      <p data-field="timeline-runway">
                        {`Du ${runway.startLabel} au ${runway.endLabel} (${runway.weeksLabel}, ${runway.daysLabel})`}
                      </p>
                    </article>
                  ) : null}
                  {timelineSummary ? (
                    <article data-showcase-element="timeline-profile">
                      <h3>Conformité</h3>
                      <p data-field="timeline-summary">
                        {timelineSummary.ruleName ? `${timelineSummary.ruleName} : ` : ''}
                        {timelineSummary.satisfied ? 'Conformité atteinte' : 'Conformité non atteinte'}
                        {timelineSummary.weeks
                          ? ` (${timelineSummary.weeks} sem., ${timelineSummary.days} jours)`
                          : ''}
                      </p>
                      {Array.isArray(timelineSummary.profiles) && timelineSummary.profiles.length > 0 ? (
                        <ul data-role="tag-list">
                          {timelineSummary.profiles.map(profile => (
                            <li
                              key={profile.id || profile.label}
                              title={profile.description || undefined}
                              aria-label={
                                profile.description
                                  ? `${profile.label} — ${profile.description}`
                                  : profile.label
                              }
                            >
                              {profile.label}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ) : null}
                  {Array.isArray(timelineDetails) && timelineDetails.length > 0 && (
                    <article data-showcase-element="timeline-profile">
                      <h3>Jalons clés</h3>
                      <ul data-field="timeline-details" data-role="timeline-list">
                        {timelineDetails.map((detail, index) => (
                          <li key={detail.ruleId || detail.ruleName || index}>
                            <span>{detail.ruleName || 'Règle'}</span>
                            {detail.diff?.diffInWeeks ? (
                              <span>
                                {`${Math.round(detail.diff.diffInWeeks)} sem.`}
                                {detail.diff.diffInDays ? ` · ${Math.round(detail.diff.diffInDays)} jours` : ''}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}
                </div>
              </section>
            )}

            {(complexity || hasText(analysis?.summary) || primaryRisk || (Array.isArray(analysis?.risks) && analysis.risks.length > 0)) && (
              <section data-section="analysis" data-showcase-section="analysis">
                <h2>Analyse de conformité</h2>
                <div data-role="split-layout">
                  {complexity ? (
                    <article data-showcase-element="metric-card">
                      <h3>Niveau de complexité</h3>
                      <p data-field="analysis-complexity">{complexity}</p>
                    </article>
                  ) : null}
                  {hasText(analysis?.summary) ? (
                    <article data-showcase-element="metric-card">
                      <h3>Résumé</h3>
                      <p data-field="analysis-summary">{analysis.summary}</p>
                    </article>
                  ) : null}
                  {primaryRisk ? (
                    <article data-showcase-element="metric-card" data-element="primary-risk">
                      <h3>Risque principal</h3>
                      {primaryRisk.priority ? (
                        <p data-field="primary-risk-priority">{primaryRisk.priority}</p>
                      ) : null}
                      {hasText(primaryRisk.description) ? (
                        <p data-field="primary-risk-description">{primaryRisk.description}</p>
                      ) : null}
                      {hasText(primaryRisk.mitigation) ? (
                        <p data-field="primary-risk-mitigation">{primaryRisk.mitigation}</p>
                      ) : null}
                    </article>
                  ) : null}
                  {Array.isArray(analysis?.risks) && analysis.risks.length > 0 && (
                    <article data-showcase-element="metric-card" data-element="risk-list">
                      <h3>Risques identifiés</h3>
                      <ul data-role="risk-list">
                        {analysis.risks.map((risk, index) => (
                          <li key={risk.id || risk.ruleId || index}>
                            <span data-role="risk-title">{risk.title || risk.name || `Risque ${index + 1}`}</span>
                            {risk.priority ? <span data-role="risk-priority"> — {risk.priority}</span> : null}
                            {hasText(risk.description) ? (
                              <p data-role="risk-description">{risk.description}</p>
                            ) : null}
                            {hasText(risk.mitigation) ? (
                              <p data-role="risk-mitigation">{risk.mitigation}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}
                </div>
              </section>
            )}

            {Array.isArray(analysis?.opportunities) && analysis.opportunities.length > 0 && (
              <section data-section="opportunities" data-showcase-section="opportunities">
                <h2>Opportunités</h2>
                <ul data-role="opportunity-list">
                  {analysis.opportunities.map((opportunity, index) => (
                    <li key={opportunity.id || index}>
                      <span data-role="opportunity-title">
                        {opportunity.title || opportunity.name || `Opportunité ${index + 1}`}
                      </span>
                      {hasText(opportunity.description) ? (
                        <p data-role="opportunity-description">{opportunity.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {missingShowcaseQuestions.length > 0 && (
              <section data-section="missing-questions" data-showcase-section="missing-questions">
                <h2>Questions manquantes pour la vitrine</h2>
                <ul data-role="tag-list">
                  {missingShowcaseQuestions.map(id => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </section>
            )}

            {typeof onClose === 'function' && (
              <section data-section="actions" data-showcase-section="actions">
                <div data-role="actions">
                  <button type="button" data-action="close" onClick={handleClose}>
                    Revenir à l'application
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        <script
          type="application/json"
          data-project-showcase-payload
          dangerouslySetInnerHTML={{ __html: serializedPayload }}
        />
      </article>
    </ThemeContainer>
  );
};
