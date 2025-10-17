function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useCallback, useEffect, useMemo, useState } from '../react.js';
import { formatAnswer } from '../utils/questions.js';
import { NetflixShowcase } from './themes/netflix/NetflixShowcase.js';
import { AmnestyShowcase } from './themes/amnesty/AmnestyShowcase.js';
import { NebulaShowcase } from './themes/nebula/NebulaShowcase.js';
import { getMissingShowcaseQuestionLabels } from '../utils/showcaseRequirements.js';
var findQuestionById = (questions, id) => {
  if (!Array.isArray(questions)) {
    return null;
  }
  return questions.find(question => (question === null || question === void 0 ? void 0 : question.id) === id) || null;
};
var getFormattedAnswer = (questions, answers, id) => {
  var question = findQuestionById(questions, id);
  if (!question) {
    return '';
  }
  return formatAnswer(question, answers === null || answers === void 0 ? void 0 : answers[id]);
};
var getRawAnswer = (answers, id) => {
  if (!answers) {
    return undefined;
  }
  return answers[id];
};
var hasText = value => typeof value === 'string' && value.trim().length > 0;
export var SHOWCASE_THEME_STORAGE_KEY = 'compliance-advisor.showcase-theme';
var DEFAULT_THEME_ID = 'netflix';
export var SHOWCASE_THEMES = [{
  id: 'netflix',
  label: 'Immersion cinéma',
  description: 'Ambiance Netflix : fond cinématographique sombre, rouge signature et halos lumineux.'
}, {
  id: 'amnesty',
  label: 'Engagement Amnesty',
  description: "Contrastes noir/jaune inspirés d’Amnesty International, typographie militante et badges manifestes."
}, {
  id: 'nebula',
  label: 'Nebula Pulse',
  description: 'Voyage cosmique : aurores animées, constellations vivantes et cartes holographiques pour un récit futuriste.'
}];
var THEME_COMPONENTS = {
  netflix: NetflixShowcase,
  amnesty: AmnestyShowcase,
  nebula: NebulaShowcase
};
var SHOWCASE_EDITABLE_FIELDS = Object.freeze({
  projectName: {
    questionId: 'projectName',
    label: 'Nom du projet',
    variant: 'inline'
  },
  projectSlogan: {
    questionId: 'projectSlogan',
    label: 'Slogan',
    variant: 'inline'
  },
  targetAudience: {
    questionId: 'targetAudience',
    label: 'Audiences cibles'
  },
  problemPainPoints: {
    questionId: 'problemPainPoints',
    label: 'Points de douleur'
  },
  solutionDescription: {
    questionId: 'solutionDescription',
    label: 'Description de la solution'
  },
  solutionBenefits: {
    questionId: 'solutionBenefits',
    label: 'Bénéfices clés'
  },
  solutionComparison: {
    questionId: 'solutionComparison',
    label: 'Différenciation'
  },
  teamLead: {
    questionId: 'teamLead',
    label: 'Lead du projet',
    variant: 'inline'
  },
  teamCoreMembers: {
    questionId: 'teamCoreMembers',
    label: 'Collectif moteur'
  }
});
var isValidTheme = (themeId, themeOptions) => typeof themeId === 'string' && themeOptions.some(theme => theme.id === themeId);
var resolveThemeOptions = options => Array.isArray(options) && options.length > 0 ? options : SHOWCASE_THEMES;
export var getInitialShowcaseTheme = function getInitialShowcaseTheme() {
  var _resolvedOptions$;
  var themeOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SHOWCASE_THEMES;
  var resolvedOptions = resolveThemeOptions(themeOptions);
  var fallbackTheme = ((_resolvedOptions$ = resolvedOptions[0]) === null || _resolvedOptions$ === void 0 ? void 0 : _resolvedOptions$.id) || DEFAULT_THEME_ID;
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallbackTheme;
  }
  try {
    var storedTheme = window.localStorage.getItem(SHOWCASE_THEME_STORAGE_KEY);
    if (isValidTheme(storedTheme, resolvedOptions)) {
      return storedTheme;
    }
  } catch (error) {
    // Ignorer les erreurs d'accès au stockage.
  }
  return fallbackTheme;
};
var parseListAnswer = value => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(entry => typeof entry === 'string' ? entry.trim() : String(entry)).filter(item => item.length > 0);
  }
  return String(value).split(/\r?\n|·|•|;|,/).map(entry => entry.replace(/^[-•\s]+/, '').trim()).filter(entry => entry.length > 0);
};
var formatDate = value => {
  if (!value) {
    return '';
  }
  var parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed);
};
var computeRunway = answers => {
  var startRaw = answers === null || answers === void 0 ? void 0 : answers.campaignKickoffDate;
  var endRaw = answers === null || answers === void 0 ? void 0 : answers.launchDate;
  if (!startRaw || !endRaw) {
    return null;
  }
  var start = new Date(startRaw);
  var end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  var diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return null;
  }
  var diffDays = diffMs / (1000 * 60 * 60 * 24);
  var diffWeeks = diffDays / 7;
  return {
    start,
    end,
    diffDays,
    diffWeeks,
    startLabel: formatDate(start),
    endLabel: formatDate(end),
    weeksLabel: "".concat(Math.round(diffWeeks), " sem."),
    daysLabel: "".concat(Math.round(diffDays), " j.")
  };
};
var sanitizeTimelineProfiles = profiles => {
  if (!Array.isArray(profiles)) {
    return [];
  }
  return profiles.map((profile, index) => {
    if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
      var labelCandidate = [profile.label, profile.name, profile.id].map(value => {
        if (typeof value === 'string') {
          return value.trim();
        }
        if (typeof value === 'number') {
          return String(value);
        }
        return '';
      }).find(value => value.length > 0);
      var _label = labelCandidate && labelCandidate.length > 0 ? labelCandidate : "Profil ".concat(index + 1);
      var description = typeof profile.description === 'string' && profile.description.trim().length > 0 ? profile.description.trim() : null;
      return {
        id: typeof profile.id === 'string' && profile.id.trim().length > 0 ? profile.id : "timeline-profile-".concat(index),
        label: _label,
        description,
        requirements: profile.requirements && typeof profile.requirements === 'object' ? profile.requirements : undefined
      };
    }
    var stringLabel = typeof profile === 'string' ? profile.trim() : '';
    var label = stringLabel.length > 0 ? stringLabel : "Profil ".concat(index + 1);
    return {
      id: "timeline-profile-".concat(index),
      label,
      description: null,
      requirements: undefined
    };
  });
};
var computeTimelineSummary = timelineDetails => {
  if (!Array.isArray(timelineDetails)) {
    return null;
  }
  var detailWithDiff = timelineDetails.find(detail => Boolean(detail === null || detail === void 0 ? void 0 : detail.diff));
  if (!detailWithDiff) {
    return null;
  }
  var diff = detailWithDiff.diff;
  var weeks = Math.round(diff.diffInWeeks);
  var days = Math.round(diff.diffInDays);
  return {
    ruleId: detailWithDiff.ruleId || null,
    ruleName: detailWithDiff.ruleName || null,
    satisfied: Boolean(detailWithDiff.satisfied),
    weeks,
    days,
    profiles: sanitizeTimelineProfiles(detailWithDiff.profiles)
  };
};
var getPrimaryRisk = analysis => {
  var risks = Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.risks) ? analysis.risks : [];
  if (risks.length === 0) {
    return null;
  }
  var priorityWeight = {
    Critique: 3,
    Important: 2,
    Recommandé: 1
  };
  return risks.reduce((acc, risk) => {
    if (!acc) {
      return risk;
    }
    var currentWeight = priorityWeight[risk.priority] || 0;
    var bestWeight = priorityWeight[acc.priority] || 0;
    if (currentWeight > bestWeight) {
      return risk;
    }
    return acc;
  }, null);
};
var buildHeroHighlights = _ref => {
  var {
    targetAudience,
    runway
  } = _ref;
  var highlights = [];
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
      value: "".concat(runway.weeksLabel, " (").concat(runway.daysLabel, ")"),
      caption: "Du ".concat(runway.startLabel, " au ").concat(runway.endLabel, ".")
    });
  }
  return highlights;
};
var sanitizeForScript = payload => {
  try {
    return JSON.stringify(payload, null, 2).replace(/</g, '\\u003c');
  } catch (error) {
    return '{}';
  }
};
var resolveShowcaseMeta = _ref2 => {
  var {
    projectMeta,
    isDemoProject,
    projectName
  } = _ref2;
  var metaSource = projectMeta && typeof projectMeta === 'object' ? projectMeta : {};
  var badge = hasText(metaSource.badge) ? metaSource.badge.trim() : isDemoProject ? 'Projet de démonstration' : null;
  var eyebrow = hasText(metaSource.eyebrow) ? metaSource.eyebrow.trim() : badge || (isDemoProject ? 'Projet de démonstration' : 'Vitrine du projet');
  var versionSource = metaSource.version && typeof metaSource.version === 'object' ? metaSource.version : null;
  var version = versionSource && hasText(versionSource.number) ? {
    label: hasText(versionSource.label) ? versionSource.label.trim() : projectName,
    number: versionSource.number.trim(),
    status: hasText(versionSource.status) ? versionSource.status.trim() : null
  } : null;
  return {
    eyebrow: hasText(eyebrow) ? eyebrow : 'Vitrine du projet',
    badge,
    version
  };
};
var buildShowcasePayload = _ref3 => {
  var {
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
  } = _ref3;
  return {
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
      problem: {
        painPoints: problemPainPoints
      },
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
        summary: hasText(analysis === null || analysis === void 0 ? void 0 : analysis.summary) ? analysis.summary : null,
        primaryRisk,
        risks: Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.risks) ? analysis.risks : [],
        opportunities: Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.opportunities) ? analysis.opportunities : [],
        raw: analysis || null
      }
    },
    missingQuestions: missingShowcaseQuestions
  };
};
export var ProjectShowcase = _ref4 => {
  var _themeOptions$2;
  var {
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
  } = _ref4;
  var rawProjectName = typeof projectName === 'string' ? projectName.trim() : '';
  var safeProjectName = rawProjectName.length > 0 ? rawProjectName : 'Votre projet';
  var themeOptions = useMemo(() => resolveThemeOptions(themeOptionsProp), [themeOptionsProp]);
  var [internalTheme, setInternalTheme] = useState(() => getInitialShowcaseTheme(themeOptions));
  useEffect(() => {
    var _themeOptions$;
    if (isValidTheme(internalTheme, themeOptions)) {
      return;
    }
    var fallbackTheme = ((_themeOptions$ = themeOptions[0]) === null || _themeOptions$ === void 0 ? void 0 : _themeOptions$.id) || DEFAULT_THEME_ID;
    if (internalTheme !== fallbackTheme) {
      setInternalTheme(fallbackTheme);
    }
  }, [internalTheme, themeOptions]);
  var isControlledTheme = isValidTheme(selectedThemeProp, themeOptions);
  var selectedTheme = isControlledTheme ? selectedThemeProp : isValidTheme(internalTheme, themeOptions) ? internalTheme : ((_themeOptions$2 = themeOptions[0]) === null || _themeOptions$2 === void 0 ? void 0 : _themeOptions$2.id) || DEFAULT_THEME_ID;
  var activeTheme = useMemo(() => themeOptions.find(theme => theme.id === selectedTheme) || themeOptions[0] || null, [themeOptions, selectedTheme]);
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
  var handleThemeChange = useCallback(nextThemeId => {
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
  var normalizedTeams = useMemo(() => {
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
  var slogan = getFormattedAnswer(questions, answers, 'projectSlogan');
  var targetAudienceList = useMemo(() => parseListAnswer(getRawAnswer(answers, 'targetAudience')), [answers]);
  var targetAudience = targetAudienceList.join(', ');
  var problemPainPoints = useMemo(() => parseListAnswer(getRawAnswer(answers, 'problemPainPoints')), [answers]);
  var solutionDescription = getFormattedAnswer(questions, answers, 'solutionDescription');
  var solutionBenefits = useMemo(() => parseListAnswer(getRawAnswer(answers, 'solutionBenefits')), [answers]);
  var solutionComparison = getFormattedAnswer(questions, answers, 'solutionComparison');
  var teamLead = getFormattedAnswer(questions, answers, 'teamLead');
  var teamCoreMembersList = useMemo(() => parseListAnswer(getRawAnswer(answers, 'teamCoreMembers')), [answers]);
  var runway = useMemo(() => computeRunway(answers), [answers]);
  var timelineSummary = useMemo(() => computeTimelineSummary(timelineDetails), [timelineDetails]);
  var primaryRisk = useMemo(() => getPrimaryRisk(analysis), [analysis]);
  var heroHighlights = useMemo(() => buildHeroHighlights({
    targetAudience,
    runway
  }), [targetAudience, runway]);
  var complexity = (analysis === null || analysis === void 0 ? void 0 : analysis.complexity) || null;
  var resolvedMeta = useMemo(() => resolveShowcaseMeta({
    projectMeta,
    isDemoProject,
    projectName: safeProjectName
  }), [projectMeta, isDemoProject, safeProjectName]);
  var missingShowcaseQuestions = useMemo(() => getMissingShowcaseQuestionLabels(questions, answers), [answers, questions]);
  var payload = useMemo(() => buildShowcasePayload({
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
  }), [selectedTheme, safeProjectName, slogan, targetAudienceList, heroHighlights, problemPainPoints, solutionDescription, solutionBenefits, solutionComparison, teamLead, teamCoreMembersList, normalizedTeams, runway, timelineSummary, timelineDetails, complexity, analysis, primaryRisk, missingShowcaseQuestions, resolvedMeta]);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.dispatchEvent(new CustomEvent('project-showcase:data', {
        detail: payload
      }));
      window.__PROJECT_SHOWCASE_DATA__ = payload;
    } catch (error) {
      // Ignorer les erreurs lors de la diffusion de l'événement.
    }
  }, [payload]);
  var serializedPayload = useMemo(() => sanitizeForScript(payload), [payload]);
  var handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);
  var themeSwitch = useMemo(() => ({
    selected: selectedTheme,
    activeTheme,
    options: themeOptions,
    onChange: handleThemeChange
  }), [selectedTheme, activeTheme, themeOptions, handleThemeChange]);
  var editableQuestionsById = useMemo(() => {
    var map = new Map();
    if (Array.isArray(questions)) {
      questions.forEach(question => {
        if (question && typeof question.id === 'string' && question.id.length > 0 && !map.has(question.id)) {
          map.set(question.id, question);
        }
      });
    }
    return map;
  }, [questions]);
  var resolveEditPayload = useCallback((questionId, info) => {
    var baseInfo = info && typeof info === 'object' ? _objectSpread({}, info) : {};
    var infoQuestion = baseInfo.question && baseInfo.question.id === questionId ? baseInfo.question : null;
    var mappedQuestion = editableQuestionsById.get(questionId) || infoQuestion || null;
    if (mappedQuestion) {
      baseInfo.question = mappedQuestion;
    } else if (baseInfo.question && baseInfo.question.id !== questionId) {
      delete baseInfo.question;
    }
    return baseInfo;
  }, [editableQuestionsById]);
  var editingFieldConfigs = useMemo(() => Object.fromEntries(Object.entries(SHOWCASE_EDITABLE_FIELDS).map(_ref5 => {
    var [fieldKey, config] = _ref5;
    var question = editableQuestionsById.get(config.questionId) || null;
    if (question) {
      return [fieldKey, _objectSpread(_objectSpread({}, config), {}, {
        question
      })];
    }
    return [fieldKey, _objectSpread({}, config)];
  })), [editableQuestionsById]);
  var forwardEditRequest = useCallback(function (questionId) {
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof onEditQuestion !== 'function') {
      return;
    }
    onEditQuestion(questionId, resolveEditPayload(questionId, info));
  }, [onEditQuestion, resolveEditPayload]);
  var forwardRequestEnable = useCallback(function (questionId) {
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof onRequestEnableEditing !== 'function') {
      return;
    }
    onRequestEnableEditing(questionId, resolveEditPayload(questionId, info));
  }, [onRequestEnableEditing, resolveEditPayload]);
  var editingContext = useMemo(() => {
    if (typeof onEditQuestion !== 'function') {
      return {
        enabled: false,
        fields: editingFieldConfigs
      };
    }
    return {
      enabled: Boolean(allowEditing),
      onEdit: forwardEditRequest,
      onRequestEnable: typeof onRequestEnableEditing === 'function' ? forwardRequestEnable : null,
      fields: editingFieldConfigs
    };
  }, [allowEditing, editingFieldConfigs, forwardEditRequest, forwardRequestEnable, onEditQuestion, onRequestEnableEditing]);
  var ThemeComponent = THEME_COMPONENTS[selectedTheme] || THEME_COMPONENTS[DEFAULT_THEME_ID];
  return /*#__PURE__*/React.createElement(ThemeComponent, {
    data: payload,
    themeSwitch: themeSwitch,
    onClose: typeof onClose === 'function' ? handleClose : null,
    renderInStandalone: renderInStandalone,
    serializedPayload: serializedPayload,
    editing: editingContext
  });
};