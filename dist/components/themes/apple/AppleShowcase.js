import React from '../../../react.js';
import { AppleShowcaseContainer } from '../ThemeContainers.js';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';
import { ShowcaseEditable } from '../shared/ShowcaseEditable.js';
var hasText = value => typeof value === 'string' && value.trim().length > 0;
var sanitizeHighlight = (highlight, index) => {
  if (!highlight || typeof highlight !== 'object') {
    return null;
  }
  var label = hasText(highlight.label) ? highlight.label.trim() : null;
  var value = hasText(highlight.value) ? highlight.value.trim() : null;
  var caption = hasText(highlight.caption) ? highlight.caption.trim() : null;
  if (!label || !value) {
    return null;
  }
  return {
    id: hasText(highlight.id) ? highlight.id : "highlight-".concat(index),
    label,
    value,
    caption
  };
};
var sanitizeStringList = value => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(entry => {
    if (typeof entry === 'string') {
      var trimmed = entry.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (entry && typeof entry === 'object' && hasText(entry.label)) {
      return entry.label.trim();
    }
    return null;
  }).filter(Boolean);
};
var sanitizeRelevantTeams = teams => {
  if (!Array.isArray(teams)) {
    return [];
  }
  return teams.map((team, index) => {
    if (!team || typeof team !== 'object') {
      return null;
    }
    var name = hasText(team.name) ? team.name.trim() : null;
    var expertise = hasText(team.expertise) ? team.expertise.trim() : null;
    var contact = hasText(team.contact) ? team.contact.trim() : null;
    if (!name && !expertise && !contact) {
      return null;
    }
    return {
      id: hasText(team.id) ? team.id : "team-".concat(index),
      name,
      expertise,
      contact
    };
  }).filter(Boolean);
};
var sanitizeTimelineDetails = details => {
  if (!Array.isArray(details)) {
    return [];
  }
  return details.map((detail, index) => {
    if (!detail || typeof detail !== 'object') {
      return null;
    }
    var ruleName = hasText(detail.ruleName) ? detail.ruleName.trim() : hasText(detail.title) ? detail.title.trim() : null;
    var diff = detail.diff && typeof detail.diff === 'object' ? {
      weeks: typeof detail.diff.diffInWeeks === 'number' ? Math.round(detail.diff.diffInWeeks) : null,
      days: typeof detail.diff.diffInDays === 'number' ? Math.round(detail.diff.diffInDays) : null
    } : null;
    return {
      id: hasText(detail.ruleId) ? detail.ruleId : "timeline-detail-".concat(index),
      ruleName: ruleName || "Jalon ".concat(index + 1),
      diff
    };
  }).filter(Boolean);
};
var sanitizeRisks = risks => {
  if (!Array.isArray(risks)) {
    return [];
  }
  return risks.map((risk, index) => {
    if (!risk || typeof risk !== 'object') {
      return null;
    }
    var title = hasText(risk.title) ? risk.title.trim() : hasText(risk.name) ? risk.name.trim() : "Risque ".concat(index + 1);
    var description = hasText(risk.description) ? risk.description.trim() : null;
    var mitigation = hasText(risk.mitigation) ? risk.mitigation.trim() : null;
    var priority = hasText(risk.priority) ? risk.priority.trim() : null;
    return {
      id: hasText(risk.id) ? risk.id : hasText(risk.ruleId) ? risk.ruleId : "risk-".concat(index),
      title,
      description,
      mitigation,
      priority
    };
  }).filter(Boolean);
};
var sanitizeOpportunities = opportunities => {
  if (!Array.isArray(opportunities)) {
    return [];
  }
  return opportunities.map((opportunity, index) => {
    if (!opportunity || typeof opportunity !== 'object') {
      return null;
    }
    var title = hasText(opportunity.title) ? opportunity.title.trim() : hasText(opportunity.name) ? opportunity.name.trim() : "Opportunit\xE9 ".concat(index + 1);
    var description = hasText(opportunity.description) ? opportunity.description.trim() : null;
    return {
      id: hasText(opportunity.id) ? opportunity.id : "opportunity-".concat(index),
      title,
      description
    };
  }).filter(Boolean);
};
var sanitizeMissingQuestions = missingQuestions => {
  if (!Array.isArray(missingQuestions)) {
    return [];
  }
  return missingQuestions.map(questionId => hasText(questionId) ? questionId.trim() : null).filter(Boolean);
};
export var AppleShowcase = _ref => {
  var _data$audience, _data$audience2, _sections$problem, _sections$solution, _sections$solution2, _sections$solution3, _sections$team, _sections$team2, _sections$team3, _sections$timeline, _sections$timeline2, _sections$timeline3, _sections$analysis, _sections$analysis2, _sections$analysis3, _sections$analysis4, _sections$analysis5;
  var {
    data = {},
    themeSwitch = {},
    onClose,
    renderInStandalone,
    serializedPayload = '{}',
    editing = null
  } = _ref;
  useShowcaseAnimations([data, themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected]);
  var themeId = (themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected) || (data === null || data === void 0 ? void 0 : data.theme) || 'apple';
  var projectName = hasText(data === null || data === void 0 ? void 0 : data.projectName) ? data.projectName : 'Votre projet';
  var slogan = hasText(data === null || data === void 0 ? void 0 : data.slogan) ? data.slogan : null;
  var meta = data !== null && data !== void 0 && data.meta && typeof data.meta === 'object' ? data.meta : {};
  var heroBadgeLabel = hasText(meta.badge) ? meta.badge.trim() : 'Showcase Aura';
  var heroEyebrow = hasText(meta.eyebrow) ? meta.eyebrow.trim() : null;
  var versionSource = meta.version && typeof meta.version === 'object' ? meta.version : null;
  var versionLabel = hasText(versionSource === null || versionSource === void 0 ? void 0 : versionSource.label) ? versionSource.label.trim() : projectName;
  var versionNumber = hasText(versionSource === null || versionSource === void 0 ? void 0 : versionSource.number) ? versionSource.number.trim() : null;
  var defaultFooterStatus = 'Données showcase prêtes';
  var versionStatus = hasText(versionSource === null || versionSource === void 0 ? void 0 : versionSource.status) ? versionSource.status.trim() : defaultFooterStatus;
  var footerVersionParts = [versionLabel];
  if (versionNumber) {
    footerVersionParts.push("Version ".concat(versionNumber));
  }
  if (versionStatus) {
    footerVersionParts.push(versionStatus);
  }
  var footerVersionText = footerVersionParts.join(' — ');
  var heroHighlights = Array.isArray(data === null || data === void 0 ? void 0 : data.highlights) ? data.highlights.map((highlight, index) => sanitizeHighlight(highlight, index)).filter(Boolean) : [];
  var audienceItems = sanitizeStringList(data === null || data === void 0 || (_data$audience = data.audience) === null || _data$audience === void 0 ? void 0 : _data$audience.items);
  var audienceSummary = hasText(data === null || data === void 0 || (_data$audience2 = data.audience) === null || _data$audience2 === void 0 ? void 0 : _data$audience2.summary) ? data.audience.summary.trim() : null;
  var sections = (data === null || data === void 0 ? void 0 : data.sections) || {};
  var problemPainPoints = sanitizeStringList(sections === null || sections === void 0 || (_sections$problem = sections.problem) === null || _sections$problem === void 0 ? void 0 : _sections$problem.painPoints);
  var solutionDescription = hasText(sections === null || sections === void 0 || (_sections$solution = sections.solution) === null || _sections$solution === void 0 ? void 0 : _sections$solution.description) ? sections.solution.description.trim() : null;
  var solutionBenefits = sanitizeStringList(sections === null || sections === void 0 || (_sections$solution2 = sections.solution) === null || _sections$solution2 === void 0 ? void 0 : _sections$solution2.benefits);
  var solutionComparison = hasText(sections === null || sections === void 0 || (_sections$solution3 = sections.solution) === null || _sections$solution3 === void 0 ? void 0 : _sections$solution3.comparison) ? sections.solution.comparison.trim() : null;
  var teamLead = hasText(sections === null || sections === void 0 || (_sections$team = sections.team) === null || _sections$team === void 0 ? void 0 : _sections$team.lead) ? sections.team.lead.trim() : null;
  var teamCoreMembers = sanitizeStringList(sections === null || sections === void 0 || (_sections$team2 = sections.team) === null || _sections$team2 === void 0 ? void 0 : _sections$team2.coreMembers);
  var relevantTeams = sanitizeRelevantTeams(sections === null || sections === void 0 || (_sections$team3 = sections.team) === null || _sections$team3 === void 0 ? void 0 : _sections$team3.relevantTeams);
  var runway = (sections === null || sections === void 0 || (_sections$timeline = sections.timeline) === null || _sections$timeline === void 0 ? void 0 : _sections$timeline.runway) || null;
  var timelineSummary = (sections === null || sections === void 0 || (_sections$timeline2 = sections.timeline) === null || _sections$timeline2 === void 0 ? void 0 : _sections$timeline2.summary) || null;
  var timelineDetails = sanitizeTimelineDetails(sections === null || sections === void 0 || (_sections$timeline3 = sections.timeline) === null || _sections$timeline3 === void 0 ? void 0 : _sections$timeline3.details);
  var complexity = (sections === null || sections === void 0 || (_sections$analysis = sections.analysis) === null || _sections$analysis === void 0 ? void 0 : _sections$analysis.complexity) || null;
  var analysisSummary = hasText(sections === null || sections === void 0 || (_sections$analysis2 = sections.analysis) === null || _sections$analysis2 === void 0 ? void 0 : _sections$analysis2.summary) ? sections.analysis.summary.trim() : null;
  var primaryRisk = sections !== null && sections !== void 0 && (_sections$analysis3 = sections.analysis) !== null && _sections$analysis3 !== void 0 && _sections$analysis3.primaryRisk && typeof sections.analysis.primaryRisk === 'object' ? {
    priority: hasText(sections.analysis.primaryRisk.priority) ? sections.analysis.primaryRisk.priority.trim() : null,
    description: hasText(sections.analysis.primaryRisk.description) ? sections.analysis.primaryRisk.description.trim() : null,
    mitigation: hasText(sections.analysis.primaryRisk.mitigation) ? sections.analysis.primaryRisk.mitigation.trim() : null
  } : null;
  var risks = sanitizeRisks(sections === null || sections === void 0 || (_sections$analysis4 = sections.analysis) === null || _sections$analysis4 === void 0 ? void 0 : _sections$analysis4.risks);
  var opportunities = sanitizeOpportunities(sections === null || sections === void 0 || (_sections$analysis5 = sections.analysis) === null || _sections$analysis5 === void 0 ? void 0 : _sections$analysis5.opportunities);
  var missingQuestions = sanitizeMissingQuestions(data === null || data === void 0 ? void 0 : data.missingQuestions);
  var hasActions = typeof onClose === 'function';
  var navSections = [{
    id: 'audience',
    label: 'Audiences',
    visible: audienceItems.length > 0
  }, {
    id: 'problem',
    label: 'Problématique',
    visible: problemPainPoints.length > 0
  }, {
    id: 'solution',
    label: 'Solution',
    visible: Boolean(solutionDescription || solutionBenefits.length > 0 || solutionComparison)
  }, {
    id: 'team',
    label: 'Équipe',
    visible: Boolean(teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0)
  }, {
    id: 'timeline',
    label: 'Feuille de route',
    visible: Boolean(runway || timelineSummary || timelineDetails.length > 0)
  }, {
    id: 'analysis',
    label: 'Analyse',
    visible: Boolean(complexity || analysisSummary || primaryRisk || risks.length > 0)
  }, {
    id: 'opportunities',
    label: 'Opportunités',
    visible: opportunities.length > 0
  }, {
    id: 'questions',
    label: 'Questions clés',
    visible: missingQuestions.length > 0
  }, {
    id: 'actions',
    label: 'Actions',
    visible: hasActions
  }].filter(section => section.visible);
  var editingEnabled = Boolean(editing === null || editing === void 0 ? void 0 : editing.enabled) && typeof (editing === null || editing === void 0 ? void 0 : editing.onEdit) === 'function';
  var editingFields = (editing === null || editing === void 0 ? void 0 : editing.fields) || {};
  var buildEditableProps = function buildEditableProps(fieldKey) {
    var _editingFields$fieldK, _editingFields$fieldK2, _editingFields$fieldK3, _editingFields$fieldK4, _editingFields$fieldK5;
    var fallbackVariant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'block';
    return {
      enabled: editingEnabled && Boolean((_editingFields$fieldK = editingFields[fieldKey]) === null || _editingFields$fieldK === void 0 ? void 0 : _editingFields$fieldK.questionId),
      onEdit: editing === null || editing === void 0 ? void 0 : editing.onEdit,
      onRequestEnable: editing === null || editing === void 0 ? void 0 : editing.onRequestEnable,
      questionId: (_editingFields$fieldK2 = editingFields[fieldKey]) === null || _editingFields$fieldK2 === void 0 ? void 0 : _editingFields$fieldK2.questionId,
      label: (_editingFields$fieldK3 = editingFields[fieldKey]) === null || _editingFields$fieldK3 === void 0 ? void 0 : _editingFields$fieldK3.label,
      variant: ((_editingFields$fieldK4 = editingFields[fieldKey]) === null || _editingFields$fieldK4 === void 0 ? void 0 : _editingFields$fieldK4.variant) || fallbackVariant,
      question: ((_editingFields$fieldK5 = editingFields[fieldKey]) === null || _editingFields$fieldK5 === void 0 ? void 0 : _editingFields$fieldK5.question) || null
    };
  };
  return /*#__PURE__*/React.createElement(AppleShowcaseContainer, {
    renderInStandalone: renderInStandalone
  }, /*#__PURE__*/React.createElement("article", {
    "data-component": "project-showcase",
    "data-theme": themeId,
    "data-standalone": renderInStandalone ? 'true' : 'false',
    "data-editing": editingEnabled ? 'enabled' : 'disabled',
    className: "apple-showcase-surface apple-aura-surface"
  }, /*#__PURE__*/React.createElement("div", {
    "data-showcase-card": true,
    className: "apple-showcase-panel apple-aura-panel"
  }, /*#__PURE__*/React.createElement("div", {
    "data-showcase-overlay": true,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    "data-showcase-body": true,
    className: "apple-showcase-body apple-aura-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apple-aura",
    "data-showcase-layout": "aura"
  }, /*#__PURE__*/React.createElement("header", {
    className: "hero apple-aura__hero-section animate-on-scroll apple-parallax",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__badge",
    "aria-label": heroBadgeLabel
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "hero__badge-dot"
  }), /*#__PURE__*/React.createElement("span", null, heroBadgeLabel)), heroEyebrow ? /*#__PURE__*/React.createElement("p", {
    className: "hero__eyebrow",
    "data-field": "project-eyebrow"
  }, heroEyebrow) : null, /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('projectName', 'inline'), /*#__PURE__*/React.createElement("h1", {
    className: "hero__title",
    "data-field": "project-name"
  }, projectName)), slogan ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('projectSlogan', 'inline'), /*#__PURE__*/React.createElement("p", {
    className: "hero__subtitle",
    "data-field": "project-slogan"
  }, slogan)) : null, heroHighlights.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "hero__metrics metrics"
  }, heroHighlights.map(highlight => /*#__PURE__*/React.createElement("div", {
    className: "metric",
    key: highlight.id,
    "data-highlight": highlight.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric__value"
  }, highlight.value), /*#__PURE__*/React.createElement("span", {
    className: "metric__label"
  }, highlight.label), highlight.caption ? /*#__PURE__*/React.createElement("p", {
    className: "metric__caption"
  }, highlight.caption) : null))) : null, navSections.length > 0 ? /*#__PURE__*/React.createElement("nav", {
    className: "apple-aura__nav",
    "aria-label": "Navigation des sections"
  }, navSections.map(section => /*#__PURE__*/React.createElement("a", {
    key: section.id,
    className: "apple-aura__nav-link",
    href: "#".concat(section.id)
  }, section.label))) : null), /*#__PURE__*/React.createElement("main", {
    className: "apple-aura__main"
  }, audienceItems.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "audience",
    "data-showcase-section": "audience",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Audiences cibles"), audienceSummary ? /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, audienceSummary) : null), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('targetAudience'), /*#__PURE__*/React.createElement("ul", {
    className: "tag-list",
    "data-role": "tag-list"
  }, audienceItems.map((item, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(item, "-").concat(index)
  }, item))))) : null, problemPainPoints.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "problem",
    "data-showcase-section": "problem",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Probl\xE9matique"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Les irritants actuels \xE0 adresser avant le lancement.")), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('problemPainPoints'), /*#__PURE__*/React.createElement("ul", {
    className: "grid grid--two",
    "data-field": "problem-pain-points"
  }, problemPainPoints.map((point, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(point, "-").concat(index),
    className: "card"
  }, /*#__PURE__*/React.createElement("p", null, point)))))) : null, solutionDescription || solutionBenefits.length > 0 || solutionComparison ? /*#__PURE__*/React.createElement("section", {
    id: "solution",
    "data-showcase-section": "solution",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Proposition de valeur"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Une narration orchestr\xE9e pour d\xE9livrer l'exp\xE9rience Aura sur tous les canaux.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid--three"
  }, solutionDescription ? /*#__PURE__*/React.createElement("article", {
    className: "card",
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Description"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionDescription'), /*#__PURE__*/React.createElement("p", null, solutionDescription))) : null, solutionBenefits.length > 0 ? /*#__PURE__*/React.createElement("article", {
    className: "card",
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "B\xE9n\xE9fices cl\xE9s"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionBenefits'), /*#__PURE__*/React.createElement("ul", null, solutionBenefits.map((benefit, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(benefit, "-").concat(index)
  }, benefit))))) : null, solutionComparison ? /*#__PURE__*/React.createElement("article", {
    className: "card",
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Diff\xE9renciation"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionComparison'), /*#__PURE__*/React.createElement("p", null, solutionComparison))) : null)) : null, teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "team",
    "data-showcase-section": "team",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "\xC9quipe projet"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Les talents mobilis\xE9s pour d\xE9ployer la campagne Aura.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid--two"
  }, teamLead || teamCoreMembers.length > 0 ? /*#__PURE__*/React.createElement("article", {
    className: "card",
    "data-showcase-element": "team-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Leadership"), teamLead ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('teamLead', 'inline'), /*#__PURE__*/React.createElement("p", {
    className: "card__lead"
  }, teamLead)) : null, teamCoreMembers.length > 0 ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('teamCoreMembers'), /*#__PURE__*/React.createElement("ul", null, teamCoreMembers.map((member, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(member, "-").concat(index)
  }, member)))) : null) : null, relevantTeams.length > 0 ? /*#__PURE__*/React.createElement("article", {
    className: "card",
    "data-showcase-element": "team-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Experts mobilisables"), /*#__PURE__*/React.createElement("ul", {
    className: "stacked-list"
  }, relevantTeams.map(team => /*#__PURE__*/React.createElement("li", {
    key: team.id
  }, team.name ? /*#__PURE__*/React.createElement("span", {
    className: "stacked-list__title"
  }, team.name) : null, team.expertise ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__description"
  }, team.expertise) : null, team.contact ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__meta"
  }, team.contact) : null)))) : null)) : null, runway || timelineSummary || timelineDetails.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "timeline",
    "data-showcase-section": "timeline",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Feuille de route"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Les jalons cl\xE9s pour assurer la conformit\xE9 et la mise sur le march\xE9.")), /*#__PURE__*/React.createElement("div", {
    className: "timeline"
  }, runway ? /*#__PURE__*/React.createElement("div", {
    className: "timeline__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "timeline__period"
  }, "Runway"), /*#__PURE__*/React.createElement("p", null, "Du ".concat(runway.startLabel, " au ").concat(runway.endLabel, " (").concat(runway.weeksLabel, ", ").concat(runway.daysLabel, ")"))) : null, timelineSummary ? /*#__PURE__*/React.createElement("div", {
    className: "timeline__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "timeline__period"
  }, "Conformit\xE9"), /*#__PURE__*/React.createElement("p", null, timelineSummary.ruleName ? "".concat(timelineSummary.ruleName, " : ") : '', timelineSummary.satisfied ? 'Conformité atteinte' : 'Conformité non atteinte'), timelineSummary.weeks ? /*#__PURE__*/React.createElement("p", {
    className: "timeline__meta"
  }, "".concat(timelineSummary.weeks, " sem., ").concat(timelineSummary.days, " jours")) : null, Array.isArray(timelineSummary.profiles) && timelineSummary.profiles.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "tag-list"
  }, timelineSummary.profiles.map(profile => /*#__PURE__*/React.createElement("li", {
    key: profile.id
  }, profile.label))) : null) : null, timelineDetails.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "timeline__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "timeline__period"
  }, "Jalons"), /*#__PURE__*/React.createElement("ul", {
    className: "stacked-list"
  }, timelineDetails.map(detail => /*#__PURE__*/React.createElement("li", {
    key: detail.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "stacked-list__title"
  }, detail.ruleName), detail.diff && (detail.diff.weeks || detail.diff.days) ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__meta"
  }, detail.diff.weeks ? "".concat(detail.diff.weeks, " sem.") : '', detail.diff.weeks && detail.diff.days ? ' · ' : '', detail.diff.days ? "".concat(detail.diff.days, " jours") : '') : null)))) : null)) : null, complexity || analysisSummary || primaryRisk || risks.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "analysis",
    "data-showcase-section": "analysis",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Analyse de conformit\xE9"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Synth\xE8se des risques et du niveau d'effort pour s\xE9curiser le lancement.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid--two"
  }, complexity ? /*#__PURE__*/React.createElement("article", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", null, "Niveau de complexit\xE9"), /*#__PURE__*/React.createElement("p", {
    className: "metric__value"
  }, complexity)) : null, analysisSummary ? /*#__PURE__*/React.createElement("article", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", null, "R\xE9sum\xE9"), /*#__PURE__*/React.createElement("p", null, analysisSummary)) : null, primaryRisk ? /*#__PURE__*/React.createElement("article", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", null, "Risque principal"), primaryRisk.priority ? /*#__PURE__*/React.createElement("p", {
    className: "metric__label"
  }, primaryRisk.priority) : null, primaryRisk.description ? /*#__PURE__*/React.createElement("p", null, primaryRisk.description) : null, primaryRisk.mitigation ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__meta"
  }, primaryRisk.mitigation) : null) : null, risks.length > 0 ? /*#__PURE__*/React.createElement("article", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", null, "Risques identifi\xE9s"), /*#__PURE__*/React.createElement("ul", {
    className: "stacked-list"
  }, risks.map(risk => /*#__PURE__*/React.createElement("li", {
    key: risk.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "stacked-list__title"
  }, risk.title), risk.priority ? /*#__PURE__*/React.createElement("span", {
    className: "stacked-list__meta"
  }, risk.priority) : null, risk.description ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__description"
  }, risk.description) : null, risk.mitigation ? /*#__PURE__*/React.createElement("p", {
    className: "stacked-list__meta"
  }, risk.mitigation) : null)))) : null)) : null, opportunities.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "opportunities",
    "data-showcase-section": "opportunities",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Opportunit\xE9s"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Les leviers activables pour amplifier l'impact du lancement.")), /*#__PURE__*/React.createElement("ul", {
    className: "grid grid--two"
  }, opportunities.map(opportunity => /*#__PURE__*/React.createElement("li", {
    key: opportunity.id,
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", null, opportunity.title), opportunity.description ? /*#__PURE__*/React.createElement("p", null, opportunity.description) : null)))) : null, missingQuestions.length > 0 ? /*#__PURE__*/React.createElement("section", {
    id: "questions",
    "data-showcase-section": "missing-questions",
    className: "apple-aura__section animate-on-scroll"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
    className: "section__headline"
  }, "Questions manquantes"), /*#__PURE__*/React.createElement("p", {
    className: "section__lead"
  }, "Identifiez les informations \xE0 collecter pour compl\xE9ter la vitrine Aura.")), /*#__PURE__*/React.createElement("ul", {
    className: "tag-list"
  }, missingQuestions.map(questionId => /*#__PURE__*/React.createElement("li", {
    key: questionId
  }, questionId)))) : null, hasActions ? /*#__PURE__*/React.createElement("section", {
    id: "actions",
    "data-showcase-section": "actions",
    className: "apple-aura__section apple-aura__section--actions animate-on-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apple-aura__actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "data-action": "close",
    onClick: onClose
  }, "Revenir \xE0 l'application"))) : null), /*#__PURE__*/React.createElement("footer", {
    className: "apple-aura__footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer__content"
  }, /*#__PURE__*/React.createElement("p", {
    className: "footer__meta"
  }, footerVersionText), /*#__PURE__*/React.createElement("p", {
    className: "footer__meta"
  }, "Th\xE8me Apple \u2014 Build v1.0.53")))))), /*#__PURE__*/React.createElement("script", {
    type: "application/json",
    "data-project-showcase-payload": true,
    dangerouslySetInnerHTML: {
      __html: serializedPayload
    }
  })));
};