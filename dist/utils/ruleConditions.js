function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { applyConditionGroups, normalizeConditionGroups } from './conditionGroups.js';
var toNumber = value => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  var parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};
var sanitizeProfileCondition = function sanitizeProfileCondition() {
  var _condition$value;
  var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    question: condition.question || '',
    operator: condition.operator || 'equals',
    value: (_condition$value = condition.value) !== null && _condition$value !== void 0 ? _condition$value : ''
  };
};
var sanitizeComplianceProfile = function sanitizeComplianceProfile() {
  var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var conditions = Array.isArray(profile.conditions) ? profile.conditions.map(sanitizeProfileCondition) : [];
  return {
    id: profile.id || '',
    label: profile.label || '',
    description: profile.description || '',
    conditionLogic: profile.conditionLogic === 'any' ? 'any' : 'all',
    conditions,
    requirements: _objectSpread({}, profile.requirements || {})
  };
};
export var sanitizeRuleCondition = function sanitizeRuleCondition() {
  var _condition$value2;
  var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var type = condition.type === 'timing' ? 'timing' : 'question';
  if (type === 'timing') {
    var complianceProfiles = Array.isArray(condition.complianceProfiles) ? condition.complianceProfiles.map(sanitizeComplianceProfile) : [];
    return {
      type: 'timing',
      startQuestion: condition.startQuestion || '',
      endQuestion: condition.endQuestion || '',
      minimumWeeks: toNumber(condition.minimumWeeks),
      maximumWeeks: toNumber(condition.maximumWeeks),
      minimumDays: toNumber(condition.minimumDays),
      maximumDays: toNumber(condition.maximumDays),
      complianceProfiles
    };
  }
  return {
    type: 'question',
    question: condition.question || '',
    operator: condition.operator || 'equals',
    value: (_condition$value2 = condition.value) !== null && _condition$value2 !== void 0 ? _condition$value2 : ''
  };
};
export var normalizeRuleConditionGroups = function normalizeRuleConditionGroups() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return normalizeConditionGroups(entity, sanitizeRuleCondition);
};
export var applyRuleConditionGroups = function applyRuleConditionGroups() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var groups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return applyConditionGroups(entity, groups, sanitizeRuleCondition);
};
export var createEmptyQuestionCondition = () => {
  return sanitizeRuleCondition({
    type: 'question',
    question: '',
    operator: 'equals',
    value: ''
  });
};
export var createEmptyTimingCondition = () => {
  return sanitizeRuleCondition({
    type: 'timing',
    startQuestion: '',
    endQuestion: '',
    minimumWeeks: undefined,
    maximumWeeks: undefined,
    minimumDays: undefined,
    maximumDays: undefined,
    complianceProfiles: []
  });
};