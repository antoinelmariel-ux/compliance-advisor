function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from '../../../react.js';
import { ShowcaseEditable } from './ShowcaseEditable.js';
var isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
export var ShowcaseContent = _ref => {
  var _data$audience, _sections$problem;
  var {
    data = {},
    themeSwitch = {},
    onClose,
    renderInStandalone = false,
    classNames: classNamesOverrides = {},
    serializedPayload = '{}',
    editing = null
  } = _ref;
  var themeId = (themeSwitch === null || themeSwitch === void 0 ? void 0 : themeSwitch.selected) || (data === null || data === void 0 ? void 0 : data.theme) || 'apple';
  var meta = data !== null && data !== void 0 && data.meta && typeof data.meta === 'object' ? data.meta : {};
  var eyebrow = isNonEmptyString(meta.eyebrow) ? meta.eyebrow : 'Vitrine du projet';
  var projectName = isNonEmptyString(data === null || data === void 0 ? void 0 : data.projectName) ? data.projectName : 'Votre projet';
  var slogan = isNonEmptyString(data === null || data === void 0 ? void 0 : data.slogan) ? data.slogan : null;
  var highlights = Array.isArray(data === null || data === void 0 ? void 0 : data.highlights) ? data.highlights : [];
  var audienceItems = Array.isArray(data === null || data === void 0 || (_data$audience = data.audience) === null || _data$audience === void 0 ? void 0 : _data$audience.items) ? data.audience.items : [];
  var sections = (data === null || data === void 0 ? void 0 : data.sections) || {};
  var problemPainPoints = Array.isArray(sections === null || sections === void 0 || (_sections$problem = sections.problem) === null || _sections$problem === void 0 ? void 0 : _sections$problem.painPoints) ? sections.problem.painPoints : [];
  var solution = (sections === null || sections === void 0 ? void 0 : sections.solution) || {};
  var solutionDescription = isNonEmptyString(solution.description) ? solution.description : null;
  var solutionBenefits = Array.isArray(solution.benefits) ? solution.benefits : [];
  var solutionComparison = isNonEmptyString(solution.comparison) ? solution.comparison : null;
  var team = (sections === null || sections === void 0 ? void 0 : sections.team) || {};
  var teamLead = isNonEmptyString(team.lead) ? team.lead : null;
  var teamCoreMembers = Array.isArray(team.coreMembers) ? team.coreMembers : [];
  var relevantTeams = Array.isArray(team.relevantTeams) ? team.relevantTeams : [];
  var timeline = (sections === null || sections === void 0 ? void 0 : sections.timeline) || {};
  var runway = (timeline === null || timeline === void 0 ? void 0 : timeline.runway) || null;
  var timelineSummary = (timeline === null || timeline === void 0 ? void 0 : timeline.summary) || null;
  var timelineDetails = Array.isArray(timeline === null || timeline === void 0 ? void 0 : timeline.details) ? timeline.details : [];
  var analysis = (sections === null || sections === void 0 ? void 0 : sections.analysis) || {};
  var complexity = (analysis === null || analysis === void 0 ? void 0 : analysis.complexity) || null;
  var analysisSummary = isNonEmptyString(analysis === null || analysis === void 0 ? void 0 : analysis.summary) ? analysis.summary : null;
  var primaryRisk = (analysis === null || analysis === void 0 ? void 0 : analysis.primaryRisk) || null;
  var risks = Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.risks) ? analysis.risks : [];
  var opportunities = Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.opportunities) ? analysis.opportunities : [];
  var missingQuestions = Array.isArray(data === null || data === void 0 ? void 0 : data.missingQuestions) ? data.missingQuestions : [];
  var classDefaults = {
    article: '',
    card: '',
    body: '',
    heroSection: 'animate-on-scroll',
    heroHighlights: '',
    audienceSection: 'animate-on-scroll',
    problemSection: 'animate-on-scroll',
    solutionSection: 'animate-on-scroll',
    teamSection: 'animate-on-scroll',
    timelineSection: 'animate-on-scroll',
    analysisSection: 'animate-on-scroll',
    opportunitiesSection: 'animate-on-scroll',
    missingSection: 'animate-on-scroll',
    actionsSection: 'animate-on-scroll'
  };
  var classes = _objectSpread(_objectSpread({}, classDefaults), classNamesOverrides || {});
  var getClass = key => classes[key] ? classes[key] : undefined;
  var editHandler = typeof (editing === null || editing === void 0 ? void 0 : editing.onEdit) === 'function' ? editing.onEdit : null;
  var requestEnableHandler = typeof (editing === null || editing === void 0 ? void 0 : editing.onRequestEnable) === 'function' ? editing.onRequestEnable : null;
  var editingFields = (editing === null || editing === void 0 ? void 0 : editing.fields) || {};
  var editingEnabled = Boolean(editing === null || editing === void 0 ? void 0 : editing.enabled) && Boolean(editHandler);
  var buildEditableProps = function buildEditableProps(fieldKey) {
    var _editingFields$fieldK, _editingFields$fieldK2, _editingFields$fieldK3, _editingFields$fieldK4, _editingFields$fieldK5;
    var fallbackVariant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'block';
    return {
      enabled: editingEnabled && Boolean((_editingFields$fieldK = editingFields[fieldKey]) === null || _editingFields$fieldK === void 0 ? void 0 : _editingFields$fieldK.questionId),
      onEdit: editHandler,
      onRequestEnable: requestEnableHandler,
      questionId: (_editingFields$fieldK2 = editingFields[fieldKey]) === null || _editingFields$fieldK2 === void 0 ? void 0 : _editingFields$fieldK2.questionId,
      label: (_editingFields$fieldK3 = editingFields[fieldKey]) === null || _editingFields$fieldK3 === void 0 ? void 0 : _editingFields$fieldK3.label,
      variant: ((_editingFields$fieldK4 = editingFields[fieldKey]) === null || _editingFields$fieldK4 === void 0 ? void 0 : _editingFields$fieldK4.variant) || fallbackVariant,
      question: ((_editingFields$fieldK5 = editingFields[fieldKey]) === null || _editingFields$fieldK5 === void 0 ? void 0 : _editingFields$fieldK5.question) || null
    };
  };
  return /*#__PURE__*/React.createElement("article", {
    "data-component": "project-showcase",
    "data-theme": themeId,
    "data-standalone": renderInStandalone ? 'true' : 'false',
    "data-editing": editingEnabled ? 'enabled' : 'disabled',
    className: getClass('article')
  }, /*#__PURE__*/React.createElement("div", {
    "data-showcase-card": true,
    className: getClass('card')
  }, /*#__PURE__*/React.createElement("div", {
    "data-showcase-overlay": true,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    "data-showcase-body": true,
    className: getClass('body')
  }, /*#__PURE__*/React.createElement("header", {
    "data-section": "hero",
    "data-showcase-section": "hero",
    className: getClass('heroSection')
  }, /*#__PURE__*/React.createElement("div", {
    "data-role": "hero-header"
  }, /*#__PURE__*/React.createElement("p", {
    "data-role": "eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('projectName', 'inline'), /*#__PURE__*/React.createElement("h1", {
    "data-field": "project-name"
  }, projectName)), slogan ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('projectSlogan', 'inline'), /*#__PURE__*/React.createElement("p", {
    "data-field": "project-slogan"
  }, slogan)) : null), highlights.length > 0 ? /*#__PURE__*/React.createElement("div", {
    "data-role": "hero-highlights",
    className: getClass('heroHighlights')
  }, highlights.map(highlight => /*#__PURE__*/React.createElement("article", {
    key: highlight.id,
    "data-showcase-element": "hero-highlight",
    "data-highlight": highlight.id
  }, /*#__PURE__*/React.createElement("h3", {
    "data-role": "label"
  }, highlight.label), /*#__PURE__*/React.createElement("p", {
    "data-role": "value"
  }, highlight.value), highlight.caption ? /*#__PURE__*/React.createElement("p", {
    "data-role": "caption"
  }, highlight.caption) : null))) : null), audienceItems.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "audience",
    "data-showcase-section": "audience",
    className: getClass('audienceSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Audiences cibles"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('targetAudience'), /*#__PURE__*/React.createElement("ul", {
    "data-field": "target-audience",
    "data-role": "tag-list"
  }, audienceItems.map((item, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(item, "-").concat(index)
  }, item))))) : null, problemPainPoints.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "problem",
    "data-showcase-section": "problem",
    className: getClass('problemSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Probl\xE8mes identifi\xE9s"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('problemPainPoints'), /*#__PURE__*/React.createElement("ul", {
    "data-field": "problem-pain-points"
  }, problemPainPoints.map((item, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(item, "-").concat(index)
  }, item))))) : null, solutionDescription || solutionBenefits.length > 0 || solutionComparison ? /*#__PURE__*/React.createElement("section", {
    "data-section": "solution",
    "data-showcase-section": "solution",
    className: getClass('solutionSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Proposition de valeur"), /*#__PURE__*/React.createElement("div", {
    "data-role": "split-layout"
  }, solutionDescription ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Description"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionDescription'), /*#__PURE__*/React.createElement("p", {
    "data-field": "solution-description"
  }, solutionDescription))) : null, solutionBenefits.length > 0 ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "B\xE9n\xE9fices cl\xE9s"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionBenefits'), /*#__PURE__*/React.createElement("ul", {
    "data-field": "solution-benefits"
  }, solutionBenefits.map((item, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(item, "-").concat(index)
  }, item))))) : null, solutionComparison ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "solution-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Diff\xE9renciation"), /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('solutionComparison'), /*#__PURE__*/React.createElement("p", {
    "data-field": "solution-comparison"
  }, solutionComparison))) : null)) : null, teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "team",
    "data-showcase-section": "team",
    className: getClass('teamSection')
  }, /*#__PURE__*/React.createElement("h2", null, "\xC9quipe"), /*#__PURE__*/React.createElement("div", {
    "data-role": "team-grid"
  }, teamLead || teamCoreMembers.length > 0 ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "team-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Leadership"), teamLead ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('teamLead', 'inline'), /*#__PURE__*/React.createElement("p", {
    "data-field": "team-lead"
  }, teamLead)) : null, teamCoreMembers.length > 0 ? /*#__PURE__*/React.createElement(ShowcaseEditable, buildEditableProps('teamCoreMembers'), /*#__PURE__*/React.createElement("ul", {
    "data-field": "team-core-members"
  }, teamCoreMembers.map((member, index) => /*#__PURE__*/React.createElement("li", {
    key: "".concat(member, "-").concat(index)
  }, member)))) : null) : null, relevantTeams.length > 0 ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "team-profile",
    "data-showcase-aside": "team-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Experts mobilisables"), /*#__PURE__*/React.createElement("div", {
    "data-role": "team-list"
  }, relevantTeams.map((teamEntry, index) => /*#__PURE__*/React.createElement("div", {
    key: teamEntry.id || teamEntry.name || index,
    "data-role": "team-card"
  }, /*#__PURE__*/React.createElement("h4", {
    "data-role": "team-name"
  }, teamEntry.name || 'Équipe'), isNonEmptyString(teamEntry.expertise) ? /*#__PURE__*/React.createElement("p", {
    "data-role": "team-expertise"
  }, teamEntry.expertise) : null, isNonEmptyString(teamEntry.contact) ? /*#__PURE__*/React.createElement("p", {
    "data-role": "team-contact"
  }, teamEntry.contact) : null)))) : null)) : null, runway || timelineSummary || timelineDetails.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "timeline",
    "data-showcase-section": "timeline",
    className: getClass('timelineSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Feuille de route"), /*#__PURE__*/React.createElement("div", {
    "data-role": "split-layout"
  }, runway ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "timeline-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "P\xE9riode clef"), /*#__PURE__*/React.createElement("p", {
    "data-field": "timeline-runway"
  }, "Du ".concat(runway.startLabel, " au ").concat(runway.endLabel, " (").concat(runway.weeksLabel, ", ").concat(runway.daysLabel, ")"))) : null, timelineSummary ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "timeline-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Conformit\xE9"), /*#__PURE__*/React.createElement("p", {
    "data-field": "timeline-summary"
  }, timelineSummary.ruleName ? "".concat(timelineSummary.ruleName, " : ") : '', timelineSummary.satisfied ? 'Conformité atteinte' : 'Conformité non atteinte', timelineSummary.weeks ? " (".concat(timelineSummary.weeks, " sem., ").concat(timelineSummary.days, " jours)") : ''), Array.isArray(timelineSummary.profiles) && timelineSummary.profiles.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    "data-role": "tag-list"
  }, timelineSummary.profiles.map(profile => /*#__PURE__*/React.createElement("li", {
    key: profile.id || profile.label,
    title: profile.description || undefined,
    "aria-label": profile.description ? "".concat(profile.label, " \u2014 ").concat(profile.description) : profile.label
  }, profile.label))) : null) : null, timelineDetails.length > 0 ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "timeline-profile"
  }, /*#__PURE__*/React.createElement("h3", null, "Jalons cl\xE9s"), /*#__PURE__*/React.createElement("ul", {
    "data-field": "timeline-details",
    "data-role": "timeline-list"
  }, timelineDetails.map((detail, index) => {
    var _detail$diff;
    return /*#__PURE__*/React.createElement("li", {
      key: detail.ruleId || detail.ruleName || index
    }, /*#__PURE__*/React.createElement("span", null, detail.ruleName || 'Règle'), detail !== null && detail !== void 0 && (_detail$diff = detail.diff) !== null && _detail$diff !== void 0 && _detail$diff.diffInWeeks ? /*#__PURE__*/React.createElement("span", null, "".concat(Math.round(detail.diff.diffInWeeks), " sem."), detail.diff.diffInDays ? " \xB7 ".concat(Math.round(detail.diff.diffInDays), " jours") : '') : null);
  }))) : null)) : null, complexity || analysisSummary || primaryRisk || risks.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "analysis",
    "data-showcase-section": "analysis",
    className: getClass('analysisSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Analyse de conformit\xE9"), /*#__PURE__*/React.createElement("div", {
    "data-role": "split-layout"
  }, complexity ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "metric-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Niveau de complexit\xE9"), /*#__PURE__*/React.createElement("p", {
    "data-field": "analysis-complexity"
  }, complexity)) : null, analysisSummary ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "metric-card"
  }, /*#__PURE__*/React.createElement("h3", null, "R\xE9sum\xE9"), /*#__PURE__*/React.createElement("p", {
    "data-field": "analysis-summary"
  }, analysisSummary)) : null, primaryRisk ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "metric-card",
    "data-element": "primary-risk"
  }, /*#__PURE__*/React.createElement("h3", null, "Risque principal"), primaryRisk.priority ? /*#__PURE__*/React.createElement("p", {
    "data-field": "primary-risk-priority"
  }, primaryRisk.priority) : null, isNonEmptyString(primaryRisk.description) ? /*#__PURE__*/React.createElement("p", {
    "data-field": "primary-risk-description"
  }, primaryRisk.description) : null, isNonEmptyString(primaryRisk.mitigation) ? /*#__PURE__*/React.createElement("p", {
    "data-field": "primary-risk-mitigation"
  }, primaryRisk.mitigation) : null) : null, risks.length > 0 ? /*#__PURE__*/React.createElement("article", {
    "data-showcase-element": "metric-card",
    "data-element": "risk-list"
  }, /*#__PURE__*/React.createElement("h3", null, "Risques identifi\xE9s"), /*#__PURE__*/React.createElement("ul", {
    "data-role": "risk-list"
  }, risks.map((risk, index) => /*#__PURE__*/React.createElement("li", {
    key: risk.id || risk.ruleId || index
  }, /*#__PURE__*/React.createElement("span", {
    "data-role": "risk-title"
  }, risk.title || risk.name || "Risque ".concat(index + 1)), risk.priority ? /*#__PURE__*/React.createElement("span", {
    "data-role": "risk-priority"
  }, " \u2014 ", risk.priority) : null, isNonEmptyString(risk.description) ? /*#__PURE__*/React.createElement("p", {
    "data-role": "risk-description"
  }, risk.description) : null, isNonEmptyString(risk.mitigation) ? /*#__PURE__*/React.createElement("p", {
    "data-role": "risk-mitigation"
  }, risk.mitigation) : null)))) : null)) : null, opportunities.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "opportunities",
    "data-showcase-section": "opportunities",
    className: getClass('opportunitiesSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Opportunit\xE9s"), /*#__PURE__*/React.createElement("ul", {
    "data-role": "opportunity-list"
  }, opportunities.map((opportunity, index) => /*#__PURE__*/React.createElement("li", {
    key: opportunity.id || index
  }, /*#__PURE__*/React.createElement("span", {
    "data-role": "opportunity-title"
  }, opportunity.title || opportunity.name || "Opportunit\xE9 ".concat(index + 1)), isNonEmptyString(opportunity.description) ? /*#__PURE__*/React.createElement("p", {
    "data-role": "opportunity-description"
  }, opportunity.description) : null)))) : null, missingQuestions.length > 0 ? /*#__PURE__*/React.createElement("section", {
    "data-section": "missing-questions",
    "data-showcase-section": "missing-questions",
    className: getClass('missingSection')
  }, /*#__PURE__*/React.createElement("h2", null, "Questions manquantes pour la vitrine"), /*#__PURE__*/React.createElement("ul", {
    "data-role": "tag-list"
  }, missingQuestions.map(id => /*#__PURE__*/React.createElement("li", {
    key: id
  }, id)))) : null, typeof onClose === 'function' ? /*#__PURE__*/React.createElement("section", {
    "data-section": "actions",
    "data-showcase-section": "actions",
    className: getClass('actionsSection')
  }, /*#__PURE__*/React.createElement("div", {
    "data-role": "actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "data-action": "close",
    onClick: onClose
  }, "Revenir \xE0 l'application"))) : null)), /*#__PURE__*/React.createElement("script", {
    type: "application/json",
    "data-project-showcase-payload": true,
    dangerouslySetInnerHTML: {
      __html: serializedPayload
    }
  }));
};