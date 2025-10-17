function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { normalizeAnswerForComparison } from './questions.js';
import { normalizeConditionGroups } from './conditionGroups.js';
import { sanitizeRuleCondition } from './ruleConditions.js';
var matchesCondition = (condition, answers) => {
  if (!condition || !condition.question) {
    return true;
  }
  var rawAnswer = answers[condition.question];
  if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') {
    return false;
  }
  var answer = normalizeAnswerForComparison(rawAnswer);
  var operator = condition.operator || 'equals';
  var expected = condition.value;
  switch (operator) {
    case 'equals':
      if (Array.isArray(answer)) {
        return answer.includes(expected);
      }
      return answer === expected;
    case 'not_equals':
      if (Array.isArray(answer)) {
        return !answer.includes(expected);
      }
      return answer !== expected;
    case 'contains':
      if (Array.isArray(answer)) {
        return answer.includes(expected);
      }
      if (typeof answer === 'string') {
        return answer.toLowerCase().includes(String(expected).toLowerCase());
      }
      return false;
    default:
      return false;
  }
};
var matchesConditionGroup = function matchesConditionGroup(conditions, answers) {
  var logic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'all';
  if (!conditions || conditions.length === 0) {
    return true;
  }
  var normalizedLogic = logic === 'any' ? 'any' : 'all';
  if (normalizedLogic === 'any') {
    return conditions.some(condition => matchesCondition(condition, answers));
  }
  return conditions.every(condition => matchesCondition(condition, answers));
};
var computeTimingDiff = (condition, answers) => {
  if (!condition.startQuestion || !condition.endQuestion) {
    return null;
  }
  var startAnswer = answers[condition.startQuestion];
  var endAnswer = answers[condition.endQuestion];
  if (!startAnswer || !endAnswer) {
    return null;
  }
  var startDate = new Date(startAnswer);
  var endDate = new Date(endAnswer);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  var diffInMs = endDate.getTime() - startDate.getTime();
  if (diffInMs < 0) {
    return null;
  }
  var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return {
    startDate,
    endDate,
    diffInDays,
    diffInWeeks: diffInDays / 7
  };
};
var normalizeTimingRequirement = value => {
  if (value === undefined || value === null || value === '') {
    return {};
  }
  if (typeof value === 'number') {
    return {
      minimumWeeks: value
    };
  }
  if (typeof value === 'string') {
    var parsed = Number(value);
    return Number.isNaN(parsed) ? {} : {
      minimumWeeks: parsed
    };
  }
  if (typeof value === 'object') {
    var result = {};
    if (typeof value.minimumWeeks === 'number') {
      result.minimumWeeks = value.minimumWeeks;
    } else if (typeof value.minimumWeeks === 'string' && value.minimumWeeks.trim() !== '') {
      var _parsed = Number(value.minimumWeeks);
      if (!Number.isNaN(_parsed)) {
        result.minimumWeeks = _parsed;
      }
    }
    if (typeof value.minimumDays === 'number') {
      result.minimumDays = value.minimumDays;
    } else if (typeof value.minimumDays === 'string' && value.minimumDays.trim() !== '') {
      var _parsed2 = Number(value.minimumDays);
      if (!Number.isNaN(_parsed2)) {
        result.minimumDays = _parsed2;
      }
    }
    return result;
  }
  return {};
};
var getActiveTimelineProfiles = (condition, answers) => {
  var profiles = Array.isArray(condition.complianceProfiles) ? condition.complianceProfiles : [];
  if (profiles.length === 0) {
    return [];
  }
  var matching = profiles.filter(profile => matchesConditionGroup(profile.conditions, answers, profile.conditionLogic));
  if (matching.length > 0) {
    return matching;
  }
  return profiles.filter(profile => !profile.conditions || profile.conditions.length === 0);
};
export var evaluateRule = (rule, answers) => {
  var timingContexts = [];
  var conditionGroups = normalizeConditionGroups(rule, sanitizeRuleCondition);
  var evaluateTimingCondition = condition => {
    var diff = computeTimingDiff(condition, answers);
    if (!diff) {
      timingContexts.push({
        type: 'timing',
        diff: null,
        profiles: [],
        satisfied: false,
        startQuestion: condition.startQuestion,
        endQuestion: condition.endQuestion
      });
      return false;
    }
    var activeProfiles = getActiveTimelineProfiles(condition, answers);
    var normalizedProfiles = activeProfiles.map(profile => ({
      id: profile.id || "profile_".concat(Date.now()),
      label: profile.label || 'Exigence de timing',
      description: profile.description || '',
      requirements: Object.fromEntries(Object.entries(profile.requirements || {}).map(_ref => {
        var [teamId, value] = _ref;
        return [teamId, normalizeTimingRequirement(value)];
      }))
    }));
    var satisfied = true;
    normalizedProfiles.forEach(profile => {
      Object.values(profile.requirements).forEach(requirement => {
        if (requirement.minimumDays !== undefined && diff.diffInDays < requirement.minimumDays) {
          satisfied = false;
        }
        if (requirement.minimumWeeks !== undefined && diff.diffInWeeks < requirement.minimumWeeks) {
          satisfied = false;
        }
      });
    });
    if (typeof condition.minimumWeeks === 'number' && diff.diffInWeeks < condition.minimumWeeks) {
      satisfied = false;
    }
    if (typeof condition.maximumWeeks === 'number' && diff.diffInWeeks > condition.maximumWeeks) {
      satisfied = false;
    }
    if (typeof condition.minimumDays === 'number' && diff.diffInDays < condition.minimumDays) {
      satisfied = false;
    }
    if (typeof condition.maximumDays === 'number' && diff.diffInDays > condition.maximumDays) {
      satisfied = false;
    }
    timingContexts.push({
      type: 'timing',
      diff,
      profiles: normalizedProfiles,
      satisfied,
      startQuestion: condition.startQuestion,
      endQuestion: condition.endQuestion
    });
    return satisfied;
  };
  var evaluateSingleCondition = condition => {
    var conditionType = condition.type || 'question';
    if (conditionType === 'timing') {
      return evaluateTimingCondition(condition);
    }
    return matchesCondition(condition, answers);
  };
  var groupResults = conditionGroups.map(group => {
    var conditions = Array.isArray(group.conditions) ? group.conditions : [];
    if (conditions.length === 0) {
      return true;
    }
    var logic = group.logic === 'any' ? 'any' : 'all';
    var results = conditions.map(evaluateSingleCondition);
    return logic === 'any' ? results.some(Boolean) : results.every(Boolean);
  });
  var triggered = conditionGroups.length === 0 ? true : groupResults.every(Boolean);
  return {
    triggered,
    timingContexts
  };
};
export var analyzeAnswers = (answers, rules) => {
  var evaluations = rules.map(rule => ({
    rule,
    evaluation: evaluateRule(rule, answers)
  }));
  var teamsSet = new Set();
  var allQuestions = {};
  var allRisks = [];
  var timelineByTeam = {};
  var timingDetails = [];
  evaluations.forEach(_ref2 => {
    var {
      rule,
      evaluation
    } = _ref2;
    if (evaluation.triggered) {
      rule.teams.forEach(teamId => teamsSet.add(teamId));
      Object.entries(rule.questions).forEach(_ref3 => {
        var [teamId, questions] = _ref3;
        if (!allQuestions[teamId]) {
          allQuestions[teamId] = [];
        }
        allQuestions[teamId].push(...questions);
      });
      allRisks.push(...rule.risks.map(risk => _objectSpread(_objectSpread({}, risk), {}, {
        priority: rule.priority,
        ruleId: rule.id,
        ruleName: rule.name,
        teams: Array.isArray(rule.teams) ? [...rule.teams] : []
      })));
    }
    evaluation.timingContexts.forEach(context => {
      if (!context || !context.diff) {
        var _context$satisfied;
        timingDetails.push({
          ruleId: rule.id,
          ruleName: rule.name,
          satisfied: (_context$satisfied = context === null || context === void 0 ? void 0 : context.satisfied) !== null && _context$satisfied !== void 0 ? _context$satisfied : false,
          diff: null,
          profiles: []
        });
        return;
      }
      var {
        diff
      } = context;
      var contextEntry = {
        ruleId: rule.id,
        ruleName: rule.name,
        satisfied: context.satisfied,
        diff,
        profiles: context.profiles
      };
      timingDetails.push(contextEntry);
      context.profiles.forEach(profile => {
        Object.entries(profile.requirements || {}).forEach(_ref4 => {
          var [teamId, requirement] = _ref4;
          if (!teamId) return;
          var normalized = normalizeTimingRequirement(requirement);
          var hasRequirement = normalized.minimumWeeks !== undefined || normalized.minimumDays !== undefined;
          if (!hasRequirement) {
            return;
          }
          if (!timelineByTeam[teamId]) {
            timelineByTeam[teamId] = [];
          }
          var meetsWeeks = normalized.minimumWeeks === undefined || diff.diffInWeeks >= normalized.minimumWeeks;
          var meetsDays = normalized.minimumDays === undefined || diff.diffInDays >= normalized.minimumDays;
          timelineByTeam[teamId].push({
            profileId: profile.id,
            profileLabel: profile.label,
            description: profile.description,
            requiredWeeks: normalized.minimumWeeks,
            requiredDays: normalized.minimumDays,
            actualWeeks: diff.diffInWeeks,
            actualDays: diff.diffInDays,
            satisfied: meetsWeeks && meetsDays
          });
        });
      });
    });
  });
  var complexityLevels = ['Faible', 'Modérée', 'Élevée'];
  var complexity = complexityLevels[Math.min(2, Math.floor(allRisks.length / 2))];
  return {
    triggeredRules: evaluations.filter(_ref5 => {
      var {
        evaluation
      } = _ref5;
      return evaluation.triggered;
    }).map(_ref6 => {
      var {
        rule
      } = _ref6;
      return rule;
    }),
    teams: Array.from(teamsSet),
    questions: allQuestions,
    risks: allRisks,
    timeline: {
      byTeam: timelineByTeam,
      details: timingDetails
    },
    complexity
  };
};
export { matchesCondition, matchesConditionGroup, computeTimingDiff, normalizeTimingRequirement, getActiveTimelineProfiles };