import React, { useCallback, useEffect, useMemo, useState } from '../react.js';
import { formatAnswer } from '../utils/questions.js';
import { AppleShowcase } from './themes/apple/AppleShowcase.jsx';
import { NetflixShowcase } from './themes/netflix/NetflixShowcase.jsx';
import { AmnestyShowcase } from './themes/amnesty/AmnestyShowcase.jsx';
import { NebulaShowcase } from './themes/nebula/NebulaShowcase.jsx';
import { getMissingShowcaseQuestionLabels } from '../utils/showcaseRequirements.js';

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

export const SHOWCASE_THEME_STORAGE_KEY = 'compliance-advisor.showcase-theme';

export const SHOWCASE_THEMES = [
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
  },
  {
    id: 'nebula',
    label: 'Nebula Pulse',
    description:
      'Voyage cosmique : aurores animées, constellations vivantes et cartes holographiques pour un récit futuriste.'
  }
];

const THEME_COMPONENTS = {
  apple: AppleShowcase,
  netflix: NetflixShowcase,
  amnesty: AmnestyShowcase,
  nebula: NebulaShowcase
};

const SHOWCASE_EDITABLE_FIELDS = Object.freeze({
  projectName: { questionId: 'projectName', label: 'Nom du projet', variant: 'inline' },
  projectSlogan: { questionId: 'projectSlogan', label: 'Slogan', variant: 'inline' },
  targetAudience: { questionId: 'targetAudience', label: 'Audiences cibles' },
  problemPainPoints: { questionId: 'problemPainPoints', label: 'Points de douleur' },
  solutionDescription: { questionId: 'solutionDescription', label: 'Description de la solution' },
  solutionBenefits: { questionId: 'solutionBenefits', label: 'Bénéfices clés' },
  solutionComparison: { questionId: 'solutionComparison', label: 'Différenciation' },
  teamLead: { questionId: 'teamLead', label: 'Lead du projet', variant: 'inline' },
  teamCoreMembers: { questionId: 'teamCoreMembers', label: 'Collectif moteur' }
});

const isValidTheme = (themeId, themeOptions) =>
  typeof themeId === 'string'
    && themeOptions.some(theme => theme.id === themeId);

const resolveThemeOptions = (options) =>
  Array.isArray(options) && options.length > 0 ? options : SHOWCASE_THEMES;

export const getInitialShowcaseTheme = (themeOptions = SHOWCASE_THEMES) => {
  const resolvedOptions = resolveThemeOptions(themeOptions);
  const fallbackTheme = resolvedOptions[0]?.id || 'apple';

  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallbackTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(SHOWCASE_THEME_STORAGE_KEY);
    if (isValidTheme(storedTheme, resolvedOptions)) {
      return storedTheme;
    }
  } catch (error) {
    // Ignorer les erreurs d'accès au stockage.
  }

  return fallbackTheme;
};

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

const resolveShowcaseMeta = ({ projectMeta, isDemoProject, projectName }) => {
  const metaSource = projectMeta && typeof projectMeta === 'object' ? projectMeta : {};

  const badge = hasText(metaSource.badge)
    ? metaSource.badge.trim()
    : (isDemoProject ? 'Projet de démonstration' : null);

  const eyebrow = hasText(metaSource.eyebrow)
    ? metaSource.eyebrow.trim()
    : (badge || (isDemoProject ? 'Projet de démonstration' : 'Vitrine du projet'));

  const versionSource = metaSource.version && typeof metaSource.version === 'object'
    ? metaSource.version
    : null;

  const version = versionSource && hasText(versionSource.number)
    ? {
        label: hasText(versionSource.label) ? versionSource.label.trim() : projectName,
        number: versionSource.number.trim(),
        status: hasText(versionSource.status) ? versionSource.status.trim() : null
      }
    : null;

  return {
    eyebrow: hasText(eyebrow) ? eyebrow : 'Vitrine du projet',
    badge,
    version
  };
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
  teamLead,
  teamCoreMembersList,
  normalizedTeams,
  runway,
  timelineSummary,
  timelineDetails,
  complexity,
  analysis,
  primaryRisk,
  missingShowcaseQuestions,
  meta
}) => ({
  theme: selectedTheme,
  projectName: safeProjectName,
  slogan: hasText(slogan) ? slogan : null,
  meta,
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
  renderInStandalone = false,
  selectedTheme: selectedThemeProp,
  onThemeChange,
  themeOptions: themeOptionsProp,
  isDemoProject = false,
  projectMeta = null,
  allowEditing = false,
  onEditQuestion = null,
  onRequestEnableEditing = null
}) => {
  const rawProjectName = typeof projectName === 'string' ? projectName.trim() : '';
  const safeProjectName = rawProjectName.length > 0 ? rawProjectName : 'Votre projet';

  const themeOptions = useMemo(
    () => resolveThemeOptions(themeOptionsProp),
    [themeOptionsProp]
  );

  const [internalTheme, setInternalTheme] = useState(() => getInitialShowcaseTheme(themeOptions));

  useEffect(() => {
    if (isValidTheme(internalTheme, themeOptions)) {
      return;
    }

    const fallbackTheme = themeOptions[0]?.id || 'apple';
    if (internalTheme !== fallbackTheme) {
      setInternalTheme(fallbackTheme);
    }
  }, [internalTheme, themeOptions]);

  const isControlledTheme = isValidTheme(selectedThemeProp, themeOptions);
  const selectedTheme = isControlledTheme
    ? selectedThemeProp
    : (isValidTheme(internalTheme, themeOptions) ? internalTheme : themeOptions[0]?.id || 'apple');

  const activeTheme = useMemo(
    () => themeOptions.find(theme => theme.id === selectedTheme) || themeOptions[0] || null,
    [themeOptions, selectedTheme]
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
    if (!isValidTheme(nextThemeId, themeOptions)) {
      return;
    }

    if (isControlledTheme) {
      if (typeof onThemeChange === 'function') {
        onThemeChange(nextThemeId);
      }
      return;
    }

    setInternalTheme(nextThemeId);
  }, [isControlledTheme, onThemeChange, themeOptions]);

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
  const resolvedMeta = useMemo(
    () => resolveShowcaseMeta({ projectMeta, isDemoProject, projectName: safeProjectName }),
    [projectMeta, isDemoProject, safeProjectName]
  );

  const missingShowcaseQuestions = useMemo(
    () => getMissingShowcaseQuestionLabels(questions, answers),
    [answers, questions]
  );

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
        teamLead,
        teamCoreMembersList,
        normalizedTeams,
        runway,
        timelineSummary,
        timelineDetails: Array.isArray(timelineDetails) ? timelineDetails : [],
        complexity,
        analysis,
        primaryRisk,
        missingShowcaseQuestions,
        meta: resolvedMeta
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
      teamLead,
      teamCoreMembersList,
      normalizedTeams,
      runway,
      timelineSummary,
      timelineDetails,
      complexity,
      analysis,
      primaryRisk,
      missingShowcaseQuestions,
      resolvedMeta
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

  const themeSwitch = useMemo(
    () => ({
      selected: selectedTheme,
      activeTheme,
      options: themeOptions,
      onChange: handleThemeChange
    }),
    [selectedTheme, activeTheme, themeOptions, handleThemeChange]
  );

  const editableQuestionsById = useMemo(() => {
    const map = new Map();

    if (Array.isArray(questions)) {
      questions.forEach((question) => {
        if (
          question
          && typeof question.id === 'string'
          && question.id.length > 0
          && !map.has(question.id)
        ) {
          map.set(question.id, question);
        }
      });
    }

    return map;
  }, [questions]);

  const resolveEditPayload = useCallback((questionId, info) => {
    const baseInfo = info && typeof info === 'object' ? { ...info } : {};
    const infoQuestion = baseInfo.question && baseInfo.question.id === questionId ? baseInfo.question : null;
    const mappedQuestion = editableQuestionsById.get(questionId) || infoQuestion || null;

    if (mappedQuestion) {
      baseInfo.question = mappedQuestion;
    } else if (baseInfo.question && baseInfo.question.id !== questionId) {
      delete baseInfo.question;
    }

    return baseInfo;
  }, [editableQuestionsById]);

  const editingFieldConfigs = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(SHOWCASE_EDITABLE_FIELDS).map(([fieldKey, config]) => {
          const question = editableQuestionsById.get(config.questionId) || null;

          if (question) {
            return [fieldKey, { ...config, question }];
          }

          return [fieldKey, { ...config }];
        })
      ),
    [editableQuestionsById]
  );

  const forwardEditRequest = useCallback((questionId, info = {}) => {
    if (typeof onEditQuestion !== 'function') {
      return;
    }

    onEditQuestion(questionId, resolveEditPayload(questionId, info));
  }, [onEditQuestion, resolveEditPayload]);

  const forwardRequestEnable = useCallback((questionId, info = {}) => {
    if (typeof onRequestEnableEditing !== 'function') {
      return;
    }

    onRequestEnableEditing(questionId, resolveEditPayload(questionId, info));
  }, [onRequestEnableEditing, resolveEditPayload]);

  const editingContext = useMemo(() => {
    if (typeof onEditQuestion !== 'function') {
      return { enabled: false, fields: editingFieldConfigs };
    }

    return {
      enabled: Boolean(allowEditing),
      onEdit: forwardEditRequest,
      onRequestEnable: typeof onRequestEnableEditing === 'function' ? forwardRequestEnable : null,
      fields: editingFieldConfigs
    };
  }, [
    allowEditing,
    editingFieldConfigs,
    forwardEditRequest,
    forwardRequestEnable,
    onEditQuestion,
    onRequestEnableEditing
  ]);

  const ThemeComponent = THEME_COMPONENTS[selectedTheme] || AppleShowcase;

  return (
    <ThemeComponent
      data={payload}
      themeSwitch={themeSwitch}
      onClose={typeof onClose === 'function' ? handleClose : null}
      renderInStandalone={renderInStandalone}
      serializedPayload={serializedPayload}
      editing={editingContext}
    />
  );
};
