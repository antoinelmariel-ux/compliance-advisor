function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useEffect, useRef, useState } from '../react.js';
import { Plus, Trash2, CheckCircle } from './icons.js';
import { applyRuleConditionGroups, normalizeRuleConditionGroups, sanitizeRuleCondition, createEmptyQuestionCondition, createEmptyTimingCondition } from '../utils/ruleConditions.js';
export var RuleEditor = _ref => {
  var {
    rule,
    onSave,
    onCancel,
    questions,
    teams
  } = _ref;
  var overlayRef = useRef(null);
  var titleRef = useRef(null);
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollTo({
        top: 0
      });
    }
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);
  var buildRuleState = source => {
    var base = _objectSpread(_objectSpread({}, source), {}, {
      conditionLogic: source.conditionLogic === 'any' ? 'any' : 'all',
      conditions: Array.isArray(source.conditions) ? source.conditions.map(sanitizeRuleCondition) : [],
      conditionGroups: Array.isArray(source.conditionGroups) ? source.conditionGroups : [],
      teams: Array.isArray(source.teams) ? source.teams : [],
      questions: source.questions || {},
      risks: Array.isArray(source.risks) ? source.risks : []
    });
    var groups = normalizeRuleConditionGroups(base);
    return applyRuleConditionGroups(base, groups);
  };
  var [editedRule, setEditedRule] = useState(() => buildRuleState(rule));
  useEffect(() => {
    setEditedRule(buildRuleState(rule));
  }, [rule]);
  var conditionGroups = Array.isArray(editedRule.conditionGroups) ? editedRule.conditionGroups : [];
  var updateConditionGroupsState = updater => {
    setEditedRule(prev => {
      var currentGroups = Array.isArray(prev.conditionGroups) ? prev.conditionGroups : [];
      var nextGroups = updater(currentGroups);
      return applyRuleConditionGroups(prev, nextGroups);
    });
  };
  var addConditionGroup = () => {
    updateConditionGroupsState(groups => [...groups, {
      logic: 'all',
      conditions: [createEmptyQuestionCondition()]
    }]);
  };
  var updateConditionGroupLogic = (groupIndex, logic) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        logic: logic === 'any' ? 'any' : 'all'
      });
      return updated;
    });
  };
  var deleteConditionGroup = groupIndex => {
    updateConditionGroupsState(groups => groups.filter((_, idx) => idx !== groupIndex));
  };
  var withUpdatedCondition = (groups, groupIndex, conditionIndex, updater) => {
    var updated = [...groups];
    var target = updated[groupIndex] || {
      logic: 'all',
      conditions: []
    };
    var conditions = Array.isArray(target.conditions) ? [...target.conditions] : [];
    var currentCondition = sanitizeRuleCondition(conditions[conditionIndex] || createEmptyQuestionCondition());
    var nextCondition = sanitizeRuleCondition(updater ? updater(currentCondition) || currentCondition : currentCondition);
    conditions[conditionIndex] = nextCondition;
    updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
      conditions
    });
    return updated;
  };
  var addConditionToGroup = groupIndex => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      var conditions = Array.isArray(target.conditions) ? [...target.conditions] : [];
      conditions.push(createEmptyQuestionCondition());
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions
      });
      return updated;
    });
  };
  var updateConditionField = (groupIndex, conditionIndex, field, value) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, condition => _objectSpread(_objectSpread({}, condition), {}, {
      [field]: value
    })));
  };
  var deleteConditionFromGroup = (groupIndex, conditionIndex) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      var conditions = Array.isArray(target.conditions) ? target.conditions.filter((_, idx) => idx !== conditionIndex) : [];
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions
      });
      return updated;
    });
  };
  var handleConditionTypeChange = (groupIndex, conditionIndex, type) => {
    updateConditionGroupsState(groups => {
      var updated = [...groups];
      var target = updated[groupIndex] || {
        logic: 'all',
        conditions: []
      };
      var conditions = Array.isArray(target.conditions) ? [...target.conditions] : [];
      var normalizedType = type === 'timing' ? 'timing' : 'question';
      conditions[conditionIndex] = normalizedType === 'timing' ? createEmptyTimingCondition() : createEmptyQuestionCondition();
      updated[groupIndex] = _objectSpread(_objectSpread({}, target), {}, {
        conditions
      });
      return updated;
    });
  };
  var cloneTimingProfiles = condition => {
    return Array.isArray(condition.complianceProfiles) ? condition.complianceProfiles.map(profile => _objectSpread(_objectSpread({}, profile), {}, {
      conditions: Array.isArray(profile.conditions) ? profile.conditions.map(cond => _objectSpread({}, cond)) : [],
      requirements: _objectSpread({}, profile.requirements || {})
    })) : [];
  };
  var addTimingProfile = (groupIndex, conditionIndex) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      profiles.push({
        id: "profile_".concat(Math.random().toString(36).slice(2, 8)),
        label: 'Nouveau scénario',
        description: '',
        requirements: {},
        conditions: [],
        conditionLogic: 'all'
      });
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var updateTimingProfileField = (groupIndex, conditionIndex, profileIndex, field, value) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      if (!profiles[profileIndex]) {
        return current;
      }
      profiles[profileIndex] = _objectSpread(_objectSpread({}, profiles[profileIndex]), {}, {
        [field]: value
      });
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var deleteTimingProfile = (groupIndex, conditionIndex, profileIndex) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current).filter((_, idx) => idx !== profileIndex);
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var addTimingProfileCondition = (groupIndex, conditionIndex, profileIndex) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      var profile = _objectSpread({}, profiles[profileIndex] || {
        conditions: []
      });
      profile.conditions = [...(profile.conditions || []), {
        question: '',
        operator: 'equals',
        value: ''
      }];
      profiles[profileIndex] = profile;
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var updateTimingProfileCondition = (groupIndex, conditionIndex, profileIndex, conditionIdx, field, value) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      var profile = _objectSpread({}, profiles[profileIndex] || {
        conditions: []
      });
      var profileConditions = Array.isArray(profile.conditions) ? [...profile.conditions] : [];
      if (!profileConditions[conditionIdx]) {
        profileConditions[conditionIdx] = {
          question: '',
          operator: 'equals',
          value: ''
        };
      }
      profileConditions[conditionIdx] = _objectSpread(_objectSpread({}, profileConditions[conditionIdx]), {}, {
        [field]: value
      });
      profile.conditions = profileConditions;
      profiles[profileIndex] = profile;
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var deleteTimingProfileCondition = (groupIndex, conditionIndex, profileIndex, conditionIdx) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      var profile = _objectSpread({}, profiles[profileIndex] || {
        conditions: []
      });
      profile.conditions = Array.isArray(profile.conditions) ? profile.conditions.filter((_, idx) => idx !== conditionIdx) : [];
      profiles[profileIndex] = profile;
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var updateTimingRequirement = (groupIndex, conditionIndex, profileIndex, teamId, value) => {
    updateConditionGroupsState(groups => withUpdatedCondition(groups, groupIndex, conditionIndex, current => {
      var profiles = cloneTimingProfiles(current);
      var profile = _objectSpread({}, profiles[profileIndex] || {});
      var requirements = _objectSpread({}, profile.requirements || {});
      var currentRequirement = requirements[teamId];
      if (value === '') {
        delete requirements[teamId];
      } else {
        var parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          if (currentRequirement && typeof currentRequirement === 'object' && !Array.isArray(currentRequirement)) {
            requirements[teamId] = _objectSpread(_objectSpread({}, currentRequirement), {}, {
              minimumWeeks: parsed
            });
          } else {
            requirements[teamId] = parsed;
          }
        }
      }
      profile.requirements = requirements;
      profiles[profileIndex] = profile;
      return _objectSpread(_objectSpread({}, current), {}, {
        complianceProfiles: profiles
      });
    }));
  };
  var toggleTeam = teamId => {
    var currentTeams = Array.isArray(editedRule.teams) ? editedRule.teams : [];
    var newTeams = currentTeams.includes(teamId) ? currentTeams.filter(t => t !== teamId) : [...currentTeams, teamId];
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      teams: newTeams
    }));
  };
  var addQuestionForTeam = teamId => {
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      questions: _objectSpread(_objectSpread({}, editedRule.questions), {}, {
        [teamId]: [...(editedRule.questions[teamId] || []), '']
      })
    }));
  };
  var updateTeamQuestion = (teamId, index, value) => {
    var newQuestions = _objectSpread({}, editedRule.questions);
    newQuestions[teamId][index] = value;
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      questions: newQuestions
    }));
  };
  var deleteTeamQuestion = (teamId, index) => {
    var newQuestions = _objectSpread({}, editedRule.questions);
    newQuestions[teamId] = newQuestions[teamId].filter((_, i) => i !== index);
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      questions: newQuestions
    }));
  };
  var addRisk = () => {
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      risks: [...editedRule.risks, {
        description: '',
        level: 'Moyen',
        mitigation: ''
      }]
    }));
  };
  var updateRisk = (index, field, value) => {
    var newRisks = [...editedRule.risks];
    newRisks[index][field] = value;
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      risks: newRisks
    }));
  };
  var deleteRisk = index => {
    setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      risks: editedRule.risks.filter((_, i) => i !== index)
    }));
  };
  var dateQuestions = questions.filter(q => (q.type || 'choice') === 'date');
  var dialogTitleId = 'rule-editor-title';
  return /*#__PURE__*/React.createElement("div", {
    ref: overlayRef,
    className: "fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto",
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-4 sm:my-8 overflow-y-auto hv-surface hv-modal-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": dialogTitleId
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl hv-surface"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h2", {
    id: dialogTitleId,
    ref: titleRef,
    tabIndex: -1,
    className: "text-3xl font-bold text-gray-800 focus:outline-none"
  }, "\xC9dition de r\xE8gle"), /*#__PURE__*/React.createElement("div", {
    className: "flex space-x-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all hv-button"
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSave(applyRuleConditionGroups(editedRule, conditionGroups)),
    className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all hv-button hv-button-primary"
  }, "Enregistrer")))), /*#__PURE__*/React.createElement("div", {
    className: "px-8 py-6 space-y-8"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "\uD83D\uDCCB Informations g\xE9n\xE9rales"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Nom de la r\xE8gle"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: editedRule.name,
    onChange: e => setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      name: e.target.value
    })),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
    placeholder: "Ex: Projet digital avec donn\xE9es de sant\xE9"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-2"
  }, "Niveau de priorit\xE9"), /*#__PURE__*/React.createElement("select", {
    value: editedRule.priority,
    onChange: e => setEditedRule(_objectSpread(_objectSpread({}, editedRule), {}, {
      priority: e.target.value
    })),
    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Critique"
  }, "\uD83D\uDD34 Critique"), /*#__PURE__*/React.createElement("option", {
    value: "Important"
  }, "\uD83D\uDFE0 Important"), /*#__PURE__*/React.createElement("option", {
    value: "Recommand\xE9"
  }, "\uD83D\uDD35 Recommand\xE9"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800"
  }, "\uD83C\uDFAF Conditions de d\xE9clenchement"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mt-1"
  }, "D\xE9finissez dans quels cas cette r\xE8gle doit s'activer automatiquement.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addConditionGroup,
    className: "flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-1"
  }), "Ajouter un groupe")), conditionGroups.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 rounded-lg p-6 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600 mb-2"
  }, "Cette r\xE8gle est toujours d\xE9clench\xE9e pour le moment."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Cr\xE9ez un groupe pour sp\xE9cifier des conditions de d\xE9clenchement."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addConditionGroup,
    className: "inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-2"
  }), "Cr\xE9er un groupe de conditions"))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200"
  }, conditionGroups.length === 1 ? (() => {
    var logic = conditionGroups[0].logic === 'any' ? 'any' : 'all';
    var logicLabel = logic === 'any' ? 'OU' : 'ET';
    var logicDescription = logic === 'any' ? 'au moins une des conditions ci-dessous est remplie' : 'toutes les conditions ci-dessous sont remplies';
    return /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-blue-900"
    }, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCA1 Logique :"), " Cette r\xE8gle se d\xE9clenchera si", ' ', /*#__PURE__*/React.createElement("strong", {
      className: "text-blue-700"
    }, logicDescription), ' ', "(logique ", logicLabel, ").");
  })() : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-sm text-blue-900"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDCA1 Logique :"), " La r\xE8gle se d\xE9clenche lorsque", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "chaque groupe de conditions"), " ci-dessous est valid\xE9 (logique globale ", /*#__PURE__*/React.createElement("strong", null, "ET"), ")."), /*#__PURE__*/React.createElement("p", null, "\xC0 l'int\xE9rieur d'un groupe, choisissez si", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "toutes"), " les conditions doivent \xEAtre vraies (ET) ou si", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-blue-700"
  }, "au moins une"), " suffit (OU)."))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, conditionGroups.map((group, groupIdx) => {
    var logic = group.logic === 'any' ? 'any' : 'all';
    var conditions = Array.isArray(group.conditions) ? group.conditions : [];
    var connectorLabel = logic === 'any' ? 'OU' : 'ET';
    return /*#__PURE__*/React.createElement("div", {
      key: groupIdx
    }, groupIdx > 0 && /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center -mb-3",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow"
    }, "ET")), /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-3 mb-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold text-gray-700"
    }, "Groupe ", groupIdx + 1), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 text-xs text-indigo-800 uppercase tracking-wide"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold"
    }, "Logique interne"), /*#__PURE__*/React.createElement("select", {
      value: logic,
      onChange: e => updateConditionGroupLogic(groupIdx, e.target.value),
      className: "px-3 py-1.5 border border-indigo-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500"
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Toutes les conditions (ET)"), /*#__PURE__*/React.createElement("option", {
      value: "any"
    }, "Au moins une condition (OU)"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => deleteConditionGroup(groupIdx),
      className: "ml-auto p-2 text-red-600 hover:bg-red-50 rounded transition-all",
      "aria-label": "Supprimer le groupe ".concat(groupIdx + 1)
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-4 h-4"
    }))), conditions.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "bg-white border border-dashed border-indigo-200 rounded-lg p-4 text-sm text-indigo-700"
    }, /*#__PURE__*/React.createElement("p", null, "Ajoutez une condition pour d\xE9finir ce groupe."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => addConditionToGroup(groupIdx),
      className: "mt-3 inline-flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-4 h-4 mr-1"
    }), "Ajouter une condition")) : /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, conditions.map((condition, conditionIdx) => {
      var _condition$minimumWee, _condition$maximumWee;
      var conditionType = condition.type === 'timing' ? 'timing' : 'question';
      var selectedQuestion = questions.find(q => q.id === condition.question);
      var selectedQuestionType = (selectedQuestion === null || selectedQuestion === void 0 ? void 0 : selectedQuestion.type) || 'choice';
      var usesOptions = ['choice', 'multi_choice'].includes(selectedQuestionType);
      var inputType = selectedQuestionType === 'number' ? 'number' : selectedQuestionType === 'date' ? 'date' : 'text';
      var placeholder = selectedQuestionType === 'date' ? 'AAAA-MM-JJ' : selectedQuestionType === 'url' ? 'https://...' : 'Valeur (texte, date, etc.)';
      return /*#__PURE__*/React.createElement("div", {
        key: conditionIdx,
        className: "bg-white rounded-lg border border-indigo-200 p-4 shadow-sm"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center gap-3 mb-3"
      }, conditionIdx > 0 && /*#__PURE__*/React.createElement("span", {
        className: "bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold"
      }, connectorLabel), /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-semibold text-gray-700"
      }, "Condition ", conditionIdx + 1), /*#__PURE__*/React.createElement("select", {
        value: conditionType,
        onChange: e => handleConditionTypeChange(groupIdx, conditionIdx, e.target.value),
        className: "px-3 py-2 border border-indigo-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: "question"
      }, "Bas\xE9e sur une r\xE9ponse"), /*#__PURE__*/React.createElement("option", {
        value: "timing"
      }, "Comparaison de dates")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => deleteConditionFromGroup(groupIdx, conditionIdx),
        className: "ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-all"
      }, /*#__PURE__*/React.createElement(Trash2, {
        className: "w-4 h-4"
      }))), conditionType === 'timing' ? /*#__PURE__*/React.createElement("div", {
        className: "space-y-4"
      }, dateQuestions.length >= 2 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Date de d\xE9part"), /*#__PURE__*/React.createElement("select", {
        value: condition.startQuestion,
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'startQuestion', e.target.value),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "S\xE9lectionner..."), dateQuestions.map(q => /*#__PURE__*/React.createElement("option", {
        key: q.id,
        value: q.id
      }, q.id, " - ", q.question.substring(0, 40), "...")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Date d'arriv\xE9e"), /*#__PURE__*/React.createElement("select", {
        value: condition.endQuestion,
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'endQuestion', e.target.value),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "S\xE9lectionner..."), dateQuestions.map(q => /*#__PURE__*/React.createElement("option", {
        key: q.id,
        value: q.id
      }, q.id, " - ", q.question.substring(0, 40), "..."))))), /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Dur\xE9e minimale (semaines)"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: (_condition$minimumWee = condition.minimumWeeks) !== null && _condition$minimumWee !== void 0 ? _condition$minimumWee : '',
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'minimumWeeks', e.target.value === '' ? undefined : Number(e.target.value)),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
        placeholder: "Ex: 8"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Dur\xE9e maximale (semaines - optionnel)"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: (_condition$maximumWee = condition.maximumWeeks) !== null && _condition$maximumWee !== void 0 ? _condition$maximumWee : '',
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'maximumWeeks', e.target.value === '' ? undefined : Number(e.target.value)),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
        placeholder: "Laisser vide si non concern\xE9"
      }))), /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-gray-500"
      }, "La r\xE8gle sera valide si la dur\xE9e entre les deux dates respecte les contraintes d\xE9finies."), /*#__PURE__*/React.createElement("div", {
        className: "mt-4 border border-indigo-200 rounded-lg bg-white/60 p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mb-3"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-sm font-semibold text-gray-700"
      }, "Sc\xE9narios de d\xE9lais par compliance"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => addTimingProfile(groupIdx, conditionIdx),
        className: "flex items-center px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
      }, /*#__PURE__*/React.createElement(Plus, {
        className: "w-4 h-4 mr-1"
      }), "Ajouter un sc\xE9nario")), condition.complianceProfiles && condition.complianceProfiles.length > 0 ? /*#__PURE__*/React.createElement("div", {
        className: "space-y-4"
      }, condition.complianceProfiles.map((profile, profileIdx) => {
        var requirementEntries = Object.entries(profile.requirements || {});
        var requirementValueForTeam = teamId => {
          var _profile$requirements;
          var requirement = (_profile$requirements = profile.requirements) === null || _profile$requirements === void 0 ? void 0 : _profile$requirements[teamId];
          if (requirement && typeof requirement === 'object' && !Array.isArray(requirement)) {
            var _requirement$minimumW;
            return (_requirement$minimumW = requirement.minimumWeeks) !== null && _requirement$minimumW !== void 0 ? _requirement$minimumW : '';
          }
          return requirement !== null && requirement !== void 0 ? requirement : '';
        };
        return /*#__PURE__*/React.createElement("div", {
          key: profile.id || "".concat(groupIdx, "-").concat(conditionIdx, "-").concat(profileIdx),
          className: "bg-white border border-indigo-100 rounded-xl shadow-sm p-4"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-start gap-3 mb-3"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex-1 min-w-[200px]"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
        }, "Nom du sc\xE9nario"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          value: profile.label || '',
          onChange: e => updateTimingProfileField(groupIdx, conditionIdx, profileIdx, 'label', e.target.value),
          className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500",
          placeholder: "Ex: Standard, Digital, Donn\xE9es de sant\xE9..."
        })), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => deleteTimingProfile(groupIdx, conditionIdx, profileIdx),
          className: "ml-auto text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-semibold"
        }, "Supprimer")), /*#__PURE__*/React.createElement("div", {
          className: "mb-4"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
        }, "Description (optionnel)"), /*#__PURE__*/React.createElement("textarea", {
          value: profile.description || '',
          onChange: e => updateTimingProfileField(groupIdx, conditionIdx, profileIdx, 'description', e.target.value),
          className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500",
          rows: 2,
          placeholder: "D\xE9crivez dans quel contexte appliquer ce sc\xE9nario..."
        })), /*#__PURE__*/React.createElement("div", {
          className: "mb-4"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center justify-between gap-2 mb-2"
        }, /*#__PURE__*/React.createElement("h5", {
          className: "text-xs font-semibold text-gray-600 uppercase tracking-wide"
        }, "Conditions d'application"), /*#__PURE__*/React.createElement("div", {
          className: "flex flex-wrap items-center gap-2"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[11px] font-semibold uppercase tracking-wide text-gray-500"
        }, "Logique"), /*#__PURE__*/React.createElement("select", {
          value: profile.conditionLogic || 'all',
          onChange: e => updateTimingProfileField(groupIdx, conditionIdx, profileIdx, 'conditionLogic', e.target.value === 'any' ? 'any' : 'all'),
          className: "px-2.5 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500"
        }, /*#__PURE__*/React.createElement("option", {
          value: "all"
        }, "Toutes (ET)"), /*#__PURE__*/React.createElement("option", {
          value: "any"
        }, "Au moins une (OU)")), /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => addTimingProfileCondition(groupIdx, conditionIdx, profileIdx),
          className: "flex items-center px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        }, /*#__PURE__*/React.createElement(Plus, {
          className: "w-3 h-3 mr-1"
        }), "Ajouter une condition"))), profile.conditions && profile.conditions.length > 0 ? /*#__PURE__*/React.createElement("div", {
          className: "space-y-2"
        }, profile.conditions.map((profileCondition, conditionIdx2) => {
          var conditionQuestion = questions.find(q => q.id === profileCondition.question);
          var conditionQuestionType = (conditionQuestion === null || conditionQuestion === void 0 ? void 0 : conditionQuestion.type) || 'choice';
          var conditionUsesOptions = ['choice', 'multi_choice'].includes(conditionQuestionType);
          var profileInputType = conditionQuestionType === 'number' ? 'number' : conditionQuestionType === 'date' ? 'date' : 'text';
          return /*#__PURE__*/React.createElement("div", {
            key: conditionIdx2,
            className: "grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 border border-gray-200 rounded-lg p-3"
          }, /*#__PURE__*/React.createElement("div", {
            className: "md:col-span-5"
          }, /*#__PURE__*/React.createElement("label", {
            className: "block text-xs font-medium text-gray-600 mb-1"
          }, "Question"), /*#__PURE__*/React.createElement("select", {
            value: profileCondition.question,
            onChange: e => updateTimingProfileCondition(groupIdx, conditionIdx, profileIdx, conditionIdx2, 'question', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
          }, /*#__PURE__*/React.createElement("option", {
            value: ""
          }, "S\xE9lectionner..."), questions.map(question => /*#__PURE__*/React.createElement("option", {
            key: question.id,
            value: question.id
          }, question.id, " - ", question.question.substring(0, 45), "...")))), /*#__PURE__*/React.createElement("div", {
            className: "md:col-span-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "block text-xs font-medium text-gray-600 mb-1"
          }, "Op\xE9rateur"), /*#__PURE__*/React.createElement("select", {
            value: profileCondition.operator,
            onChange: e => updateTimingProfileCondition(groupIdx, conditionIdx, profileIdx, conditionIdx2, 'operator', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
          }, /*#__PURE__*/React.createElement("option", {
            value: "equals"
          }, "Est \xE9gal \xE0 (=)"), /*#__PURE__*/React.createElement("option", {
            value: "not_equals"
          }, "Est diff\xE9rent de (\u2260)"), /*#__PURE__*/React.createElement("option", {
            value: "contains"
          }, "Contient"))), /*#__PURE__*/React.createElement("div", {
            className: "md:col-span-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "block text-xs font-medium text-gray-600 mb-1"
          }, "Valeur"), conditionUsesOptions ? /*#__PURE__*/React.createElement("select", {
            value: profileCondition.value,
            onChange: e => updateTimingProfileCondition(groupIdx, conditionIdx, profileIdx, conditionIdx2, 'value', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
          }, /*#__PURE__*/React.createElement("option", {
            value: ""
          }, "S\xE9lectionner..."), ((conditionQuestion === null || conditionQuestion === void 0 ? void 0 : conditionQuestion.options) || []).map((option, optionIdx) => /*#__PURE__*/React.createElement("option", {
            key: optionIdx,
            value: option
          }, option))) : /*#__PURE__*/React.createElement("input", {
            type: profileInputType,
            value: profileCondition.value,
            onChange: e => updateTimingProfileCondition(groupIdx, conditionIdx, profileIdx, conditionIdx2, 'value', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500",
            placeholder: profileInputType === 'number' ? 'Valeur numérique' : 'Valeur...'
          })), /*#__PURE__*/React.createElement("div", {
            className: "md:col-span-1 flex justify-end"
          }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => deleteTimingProfileCondition(groupIdx, conditionIdx, profileIdx, conditionIdx2),
            className: "text-red-500 hover:bg-red-50 px-2 py-1 rounded"
          }, /*#__PURE__*/React.createElement(Trash2, {
            className: "w-4 h-4"
          }))));
        })) : /*#__PURE__*/React.createElement("div", {
          className: "text-xs text-gray-500 italic"
        }, "Aucun crit\xE8re : ce sc\xE9nario s'applique par d\xE9faut.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
          className: "text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
        }, "D\xE9lais (en semaines) par \xE9quipe"), /*#__PURE__*/React.createElement("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-3"
        }, teams.map(team => {
          var requirementValue = requirementValueForTeam(team.id);
          return /*#__PURE__*/React.createElement("div", {
            key: team.id,
            className: "flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-sm font-medium text-gray-700 pr-3 flex-1"
          }, team.name), /*#__PURE__*/React.createElement("input", {
            type: "number",
            min: "0",
            value: requirementValue === undefined ? '' : requirementValue,
            onChange: e => updateTimingRequirement(groupIdx, conditionIdx, profileIdx, team.id, e.target.value),
            className: "w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500",
            placeholder: "Sem."
          }));
        })), /*#__PURE__*/React.createElement("p", {
          className: "text-[11px] text-gray-500 mt-2"
        }, "Laissez le champ vide pour indiquer qu'aucun d\xE9lai sp\xE9cifique n'est requis pour cette \xE9quipe dans ce sc\xE9nario."), requirementEntries.length === 0 && /*#__PURE__*/React.createElement("p", {
          className: "text-[11px] text-orange-600 mt-1"
        }, "Aucun d\xE9lai n'est d\xE9fini pour ce sc\xE9nario. Les \xE9quipes ne recevront pas d'exigence particuli\xE8re.")));
      })) : /*#__PURE__*/React.createElement("div", {
        className: "text-xs text-gray-600 italic"
      }, "Aucun sc\xE9nario configur\xE9. Ajoutez un profil pour personnaliser les d\xE9lais selon les \xE9quipes compliance."))) : /*#__PURE__*/React.createElement("div", {
        className: "bg-white border border-dashed border-indigo-200 rounded-lg p-4 text-sm text-indigo-700"
      }, "Ajoutez au moins deux questions de type date pour configurer cette condition temporelle.")) : /*#__PURE__*/React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-3"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Question"), /*#__PURE__*/React.createElement("select", {
        value: condition.question,
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'question', e.target.value),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "S\xE9lectionner..."), questions.map(q => /*#__PURE__*/React.createElement("option", {
        key: q.id,
        value: q.id
      }, q.id, " - ", q.question.substring(0, 30), "...")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Op\xE9rateur"), /*#__PURE__*/React.createElement("select", {
        value: condition.operator,
        onChange: e => updateConditionField(groupIdx, conditionIdx, 'operator', e.target.value),
        className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
      }, /*#__PURE__*/React.createElement("option", {
        value: "equals"
      }, "Est \xE9gal \xE0 (=)"), /*#__PURE__*/React.createElement("option", {
        value: "not_equals"
      }, "Est diff\xE9rent de (\u2260)"), /*#__PURE__*/React.createElement("option", {
        value: "contains"
      }, "Contient"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-xs font-medium text-gray-600 mb-1"
      }, "Valeur"), (() => {
        if (!condition.question) {
          return /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: condition.value,
            onChange: e => updateConditionField(groupIdx, conditionIdx, 'value', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
            placeholder: "Valeur (texte, date, etc.)"
          });
        }
        if (usesOptions) {
          return /*#__PURE__*/React.createElement("select", {
            value: condition.value,
            onChange: e => updateConditionField(groupIdx, conditionIdx, 'value', e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          }, /*#__PURE__*/React.createElement("option", {
            value: ""
          }, "S\xE9lectionner..."), ((selectedQuestion === null || selectedQuestion === void 0 ? void 0 : selectedQuestion.options) || []).map((opt, i) => /*#__PURE__*/React.createElement("option", {
            key: i,
            value: opt
          }, opt)));
        }
        return /*#__PURE__*/React.createElement("input", {
          type: inputType,
          value: condition.value,
          onChange: e => updateConditionField(groupIdx, conditionIdx, 'value', e.target.value),
          className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
          placeholder: placeholder
        });
      })())));
    }), /*#__PURE__*/React.createElement("div", {
      className: "pt-3 border-t border-indigo-100 flex justify-end"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => addConditionToGroup(groupIdx),
      className: "flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-4 h-4 mr-1"
    }), "Ajouter une condition")))));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "\uD83D\uDC65 \xC9quipes compliance \xE0 d\xE9clencher"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, teams.map(team => /*#__PURE__*/React.createElement("button", {
    key: team.id,
    onClick: () => toggleTeam(team.id),
    className: "p-4 rounded-lg border-2 text-left transition-all ".concat(editedRule.teams.includes(team.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300')
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ".concat(editedRule.teams.includes(team.id) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300')
  }, editedRule.teams.includes(team.id) && /*#__PURE__*/React.createElement(CheckCircle, {
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-gray-800"
  }, team.name), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500"
  }, team.id))))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800 mb-4"
  }, "\uD83D\uDCDD Questions \xE0 pr\xE9parer par \xE9quipe"), editedRule.teams.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-500 italic"
  }, "S\xE9lectionnez au moins une \xE9quipe pour d\xE9finir les questions.") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, editedRule.teams.map(teamId => {
    var _teams$find;
    return /*#__PURE__*/React.createElement("div", {
      key: teamId,
      className: "bg-gray-50 rounded-lg p-4 border border-gray-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-3"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-semibold text-gray-700"
    }, ((_teams$find = teams.find(team => team.id === teamId)) === null || _teams$find === void 0 ? void 0 : _teams$find.name) || teamId), /*#__PURE__*/React.createElement("button", {
      onClick: () => addQuestionForTeam(teamId),
      className: "flex items-center px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
    }, /*#__PURE__*/React.createElement(Plus, {
      className: "w-3 h-3 mr-1"
    }), "Ajouter une question")), (editedRule.questions[teamId] || []).length > 0 ? /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, (editedRule.questions[teamId] || []).map((questionText, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "flex items-center space-x-2"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: questionText,
      onChange: e => updateTeamQuestion(teamId, idx, e.target.value),
      className: "flex-1 px-3 py-2 border border-gray-300 rounded text-sm",
      placeholder: "Question pour l'\xE9quipe..."
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteTeamQuestion(teamId, idx),
      className: "p-2 text-red-600 hover:bg-red-50 rounded transition-all"
    }, /*#__PURE__*/React.createElement(Trash2, {
      className: "w-4 h-4"
    }))))) : /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-500 italic"
    }, "Aucune question d\xE9finie"));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-gray-800"
  }, "\u26A0\uFE0F Risques associ\xE9s"), /*#__PURE__*/React.createElement("button", {
    onClick: addRisk,
    className: "flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-1"
  }), "Ajouter un risque")), editedRule.risks.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-500 italic"
  }, "Aucun risque d\xE9fini pour cette r\xE8gle.") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, editedRule.risks.map((risk, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center mb-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-gray-700"
  }, "Risque ", idx + 1), /*#__PURE__*/React.createElement("button", {
    onClick: () => deleteRisk(idx),
    className: "p-1 text-red-600 hover:bg-red-50 rounded transition-all ml-auto"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "w-4 h-4"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-medium text-gray-600 mb-1"
  }, "Description du risque"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: risk.description,
    onChange: e => updateRisk(idx, 'description', e.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
    placeholder: "Ex: Non-conformit\xE9 RGPD sur les donn\xE9es de sant\xE9"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-medium text-gray-600 mb-1"
  }, "Niveau de criticit\xE9"), /*#__PURE__*/React.createElement("select", {
    value: risk.level,
    onChange: e => updateRisk(idx, 'level', e.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Faible"
  }, "\uD83D\uDFE2 Faible"), /*#__PURE__*/React.createElement("option", {
    value: "Moyen"
  }, "\uD83D\uDFE0 Moyen"), /*#__PURE__*/React.createElement("option", {
    value: "\xC9lev\xE9"
  }, "\uD83D\uDD34 \xC9lev\xE9"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-medium text-gray-600 mb-1"
  }, "Actions de mitigation"), /*#__PURE__*/React.createElement("textarea", {
    value: risk.mitigation,
    onChange: e => updateRisk(idx, 'mitigation', e.target.value),
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500",
    rows: "2",
    placeholder: "Ex: R\xE9aliser une DPIA et h\xE9berger sur un serveur HDS"
  }))))))))));
};