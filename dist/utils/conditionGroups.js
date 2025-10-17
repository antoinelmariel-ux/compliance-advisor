function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
export var sanitizeCondition = function sanitizeCondition() {
  var _condition$value;
  var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    question: condition.question || '',
    operator: condition.operator || 'equals',
    value: (_condition$value = condition.value) !== null && _condition$value !== void 0 ? _condition$value : ''
  };
};
export var sanitizeConditionGroup = function sanitizeConditionGroup() {
  var group = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var conditionSanitizer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sanitizeCondition;
  var logic = group.logic === 'any' ? 'any' : 'all';
  var conditions = Array.isArray(group.conditions) ? group.conditions.map(conditionSanitizer) : [];
  return {
    logic,
    conditions
  };
};
export var normalizeConditionGroups = function normalizeConditionGroups() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var conditionSanitizer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sanitizeCondition;
  var rawGroups = Array.isArray(entity.conditionGroups) ? entity.conditionGroups : null;
  if (rawGroups && rawGroups.length > 0) {
    return rawGroups.map(group => sanitizeConditionGroup(group, conditionSanitizer));
  }
  var fallbackConditions = Array.isArray(entity.conditions) ? entity.conditions : [];
  if (fallbackConditions.length === 0) {
    return [];
  }
  return [sanitizeConditionGroup({
    logic: entity.conditionLogic === 'any' ? 'any' : 'all',
    conditions: fallbackConditions
  }, conditionSanitizer)];
};
export var applyConditionGroups = function applyConditionGroups() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var groups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var conditionSanitizer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : sanitizeCondition;
  var sanitizedGroups = Array.isArray(groups) ? groups.map(group => sanitizeConditionGroup(group, conditionSanitizer)) : [];
  var hasSingleGroup = sanitizedGroups.length === 1;
  var legacyConditions = hasSingleGroup ? sanitizedGroups[0].conditions : [];
  var legacyLogic = hasSingleGroup ? sanitizedGroups[0].logic : 'all';
  return _objectSpread(_objectSpread({}, entity), {}, {
    conditionGroups: sanitizedGroups,
    conditions: legacyConditions,
    conditionLogic: legacyLogic
  });
};
export var hasAnyConditions = function hasAnyConditions() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var conditionSanitizer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sanitizeCondition;
  return normalizeConditionGroups(entity, conditionSanitizer).some(group => group.conditions.length > 0);
};