import React, { useState } from '../react.js';
import { Plus, Trash2, CheckCircle } from './icons.js';

export const RuleEditor = ({ rule, onSave, onCancel, questions, teams }) => {
  const normalizeCondition = (condition) => {
    if (!condition) {
      return { type: 'question', question: '', operator: 'equals', value: '' };
    }

    if ((condition.type || 'question') === 'timing') {
      const toNumber = (value) => {
        if (value === undefined || value === null || value === '') return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      return {
        ...condition,
        type: 'timing',
        startQuestion: condition.startQuestion || '',
        endQuestion: condition.endQuestion || '',
        minimumWeeks: toNumber(condition.minimumWeeks),
        maximumWeeks: toNumber(condition.maximumWeeks),
        minimumDays: toNumber(condition.minimumDays),
        maximumDays: toNumber(condition.maximumDays),
        complianceProfiles: (condition.complianceProfiles || []).map(profile => ({
          id: profile.id || `profile_${Math.random().toString(36).slice(2, 8)}`,
          label: profile.label || '',
          description: profile.description || '',
          requirements: profile.requirements || {},
          conditions: (profile.conditions || []).map(cond => ({
            question: cond.question || '',
            operator: cond.operator || 'equals',
            value: cond.value || ''
          }))
        }))
      };
    }

    return {
      ...condition,
      type: 'question',
      question: condition.question || '',
      operator: condition.operator || 'equals',
      value: condition.value || ''
    };
  };

  const [editedRule, setEditedRule] = useState({
    ...rule,
    conditions: (rule.conditions || []).map(normalizeCondition),
    questions: rule.questions || {},
    risks: rule.risks || []
  });

  const addCondition = () => {
    setEditedRule({
      ...editedRule,
      conditions: [...editedRule.conditions, { type: 'question', question: '', operator: 'equals', value: '' }]
    });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...editedRule.conditions];
    newConditions[index][field] = value;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const deleteCondition = (index) => {
    setEditedRule({
      ...editedRule,
      conditions: editedRule.conditions.filter((_, i) => i !== index)
    });
  };

  const handleConditionTypeChange = (index, type) => {
    const newConditions = [...editedRule.conditions];
    if (type === 'timing') {
      newConditions[index] = {
        type: 'timing',
        startQuestion: '',
        endQuestion: '',
        minimumWeeks: undefined,
        maximumWeeks: undefined,
        minimumDays: undefined,
        maximumDays: undefined,
        complianceProfiles: []
      };
    } else {
      newConditions[index] = {
        type: 'question',
        question: '',
        operator: 'equals',
        value: ''
      };
    }
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const cloneTimingProfiles = (condition) => {
    return (condition.complianceProfiles || []).map(profile => ({
      ...profile,
      conditions: [...(profile.conditions || [])],
      requirements: { ...(profile.requirements || {}) }
    }));
  };

  const addTimingProfile = (conditionIndex) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    profiles.push({
      id: `profile_${Date.now()}_${profiles.length}`,
      label: 'Nouveau scénario',
      description: '',
      requirements: {},
      conditions: []
    });
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const updateTimingProfileField = (conditionIndex, profileIndex, field, value) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    profiles[profileIndex] = {
      ...profiles[profileIndex],
      [field]: value
    };
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const deleteTimingProfile = (conditionIndex, profileIndex) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition).filter((_, idx) => idx !== profileIndex);
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const addTimingProfileCondition = (conditionIndex, profileIndex) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    const profile = { ...profiles[profileIndex] };
    profile.conditions = [...(profile.conditions || []), { question: '', operator: 'equals', value: '' }];
    profiles[profileIndex] = profile;
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const updateTimingProfileCondition = (conditionIndex, profileIndex, conditionIdx, field, value) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    const profile = { ...profiles[profileIndex] };
    const profileConditions = [...(profile.conditions || [])];
    profileConditions[conditionIdx] = {
      ...profileConditions[conditionIdx],
      [field]: value
    };
    profile.conditions = profileConditions;
    profiles[profileIndex] = profile;
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const deleteTimingProfileCondition = (conditionIndex, profileIndex, conditionIdx) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    const profile = { ...profiles[profileIndex] };
    profile.conditions = (profile.conditions || []).filter((_, idx) => idx !== conditionIdx);
    profiles[profileIndex] = profile;
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const updateTimingRequirement = (conditionIndex, profileIndex, teamId, value) => {
    const newConditions = [...editedRule.conditions];
    const condition = { ...newConditions[conditionIndex] };
    const profiles = cloneTimingProfiles(condition);
    const profile = { ...profiles[profileIndex] };
    const requirements = { ...(profile.requirements || {}) };
    const currentRequirement = requirements[teamId];

    if (value === '') {
      delete requirements[teamId];
    } else {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        if (currentRequirement && typeof currentRequirement === 'object' && !Array.isArray(currentRequirement)) {
          requirements[teamId] = { ...currentRequirement, minimumWeeks: parsed };
        } else {
          requirements[teamId] = parsed;
        }
      }
    }

    profile.requirements = requirements;
    profiles[profileIndex] = profile;
    condition.complianceProfiles = profiles;
    newConditions[conditionIndex] = condition;
    setEditedRule({ ...editedRule, conditions: newConditions });
  };

  const toggleTeam = (teamId) => {
    const newTeams = editedRule.teams.includes(teamId)
      ? editedRule.teams.filter(t => t !== teamId)
      : [...editedRule.teams, teamId];
    setEditedRule({ ...editedRule, teams: newTeams });
  };

  const addQuestionForTeam = (teamId) => {
    setEditedRule({
      ...editedRule,
      questions: {
        ...editedRule.questions,
        [teamId]: [...(editedRule.questions[teamId] || []), '']
      }
    });
  };

  const updateTeamQuestion = (teamId, index, value) => {
    const newQuestions = { ...editedRule.questions };
    newQuestions[teamId][index] = value;
    setEditedRule({ ...editedRule, questions: newQuestions });
  };

  const deleteTeamQuestion = (teamId, index) => {
    const newQuestions = { ...editedRule.questions };
    newQuestions[teamId] = newQuestions[teamId].filter((_, i) => i !== index);
    setEditedRule({ ...editedRule, questions: newQuestions });
  };

  const addRisk = () => {
    setEditedRule({
      ...editedRule,
      risks: [...editedRule.risks, { description: '', level: 'Moyen', mitigation: '' }]
    });
  };

  const updateRisk = (index, field, value) => {
    const newRisks = [...editedRule.risks];
    newRisks[index][field] = value;
    setEditedRule({ ...editedRule, risks: newRisks });
  };

  const deleteRisk = (index) => {
    setEditedRule({
      ...editedRule,
      risks: editedRule.risks.filter((_, i) => i !== index)
    });
  };

  const dateQuestions = questions.filter(q => (q.type || 'choice') === 'date');
  const dialogTitleId = 'rule-editor-title';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" role="presentation">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto hv-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl hv-surface">
          <div className="flex justify-between items-center">
            <h2 id={dialogTitleId} className="text-3xl font-bold text-gray-800">Édition de règle</h2>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all hv-button"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => onSave(editedRule)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all hv-button hv-button-primary"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Informations générales */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Informations générales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la règle</label>
                <input
                  type="text"
                  value={editedRule.name}
                  onChange={(e) => setEditedRule({ ...editedRule, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Projet digital avec données de santé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de priorité</label>
                <select
                  value={editedRule.priority}
                  onChange={(e) => setEditedRule({ ...editedRule, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Critique">🔴 Critique</option>
                  <option value="Important">🟠 Important</option>
                  <option value="Recommandé">🔵 Recommandé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">🎯 Conditions de déclenchement</h3>
              <button
                onClick={addCondition}
                className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une condition
              </button>
            </div>

            {editedRule.conditions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                Aucune condition définie. Cliquez sur "Ajouter une condition" pour commencer.
              </div>
            ) : (
              <div className="space-y-3">
                {editedRule.conditions.map((condition, idx) => {
                  const conditionType = condition.type || 'question';
                  const selectedQuestion = questions.find(q => q.id === condition.question);
                  const selectedQuestionType = selectedQuestion?.type || 'choice';

                  return (
                    <div key={idx} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {idx > 0 && (
                          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ET
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-700">
                          Condition {idx + 1}
                        </span>
                        <select
                          value={conditionType}
                          onChange={(e) => handleConditionTypeChange(idx, e.target.value)}
                          className="px-3 py-2 border border-indigo-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="question">Basée sur une réponse</option>
                          <option value="timing">Comparaison de dates</option>
                        </select>
                        <button
                          onClick={() => deleteCondition(idx)}
                          className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {conditionType === 'timing' ? (
                        <div className="space-y-4">
                          {dateQuestions.length >= 2 ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Date de départ</label>
                                  <select
                                    value={condition.startQuestion}
                                    onChange={(e) => updateCondition(idx, 'startQuestion', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="">Sélectionner...</option>
                                    {dateQuestions.map(q => (
                                      <option key={q.id} value={q.id}>{q.id} - {q.question.substring(0, 40)}...</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Date d'arrivée</label>
                                  <select
                                    value={condition.endQuestion}
                                    onChange={(e) => updateCondition(idx, 'endQuestion', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="">Sélectionner...</option>
                                    {dateQuestions.map(q => (
                                      <option key={q.id} value={q.id}>{q.id} - {q.question.substring(0, 40)}...</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Durée minimale (semaines)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={condition.minimumWeeks ?? ''}
                                    onChange={(e) => updateCondition(idx, 'minimumWeeks', e.target.value === '' ? undefined : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ex: 8"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Durée maximale (semaines - optionnel)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={condition.maximumWeeks ?? ''}
                                    onChange={(e) => updateCondition(idx, 'maximumWeeks', e.target.value === '' ? undefined : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Laisser vide si non concerné"
                                  />
                                </div>
                              </div>

                              <p className="text-xs text-gray-500">
                                La règle sera valide si la durée entre les deux dates respecte les contraintes définies.
                              </p>

                              <div className="mt-4 border border-indigo-200 rounded-lg bg-white/60 p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-semibold text-gray-700">
                                    Scénarios de délais par compliance
                                  </h4>
                                  <button
                                    onClick={() => addTimingProfile(idx)}
                                    className="flex items-center px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Ajouter un scénario
                                  </button>
                                </div>

                                {condition.complianceProfiles && condition.complianceProfiles.length > 0 ? (
                                  <div className="space-y-4">
                                    {condition.complianceProfiles.map((profile, profileIdx) => {
                                      const requirementEntries = Object.entries(profile.requirements || {});
                                      const requirementValueForTeam = (teamId) => {
                                        const requirement = profile.requirements?.[teamId];
                                        if (requirement && typeof requirement === 'object' && !Array.isArray(requirement)) {
                                          return requirement.minimumWeeks ?? '';
                                        }
                                        return requirement ?? '';
                                      };

                                      return (
                                        <div
                                          key={profile.id || `${idx}-${profileIdx}`}
                                          className="bg-white border border-indigo-100 rounded-xl shadow-sm p-4"
                                        >
                                          <div className="flex flex-wrap items-start gap-3 mb-3">
                                            <div className="flex-1 min-w-[200px]">
                                              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                                Nom du scénario
                                              </label>
                                              <input
                                                type="text"
                                                value={profile.label || ''}
                                                onChange={(e) => updateTimingProfileField(idx, profileIdx, 'label', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Ex: Standard, Digital, Données de santé..."
                                              />
                                            </div>

                                            <button
                                              onClick={() => deleteTimingProfile(idx, profileIdx)}
                                              className="ml-auto text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-semibold"
                                            >
                                              Supprimer
                                            </button>
                                          </div>

                                          <div className="mb-4">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                              Description (optionnel)
                                            </label>
                                            <textarea
                                              value={profile.description || ''}
                                              onChange={(e) => updateTimingProfileField(idx, profileIdx, 'description', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                              rows={2}
                                              placeholder="Décrivez dans quel contexte appliquer ce scénario..."
                                            />
                                          </div>

                                          <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Conditions d'application
                                              </h5>
                                              <button
                                                onClick={() => addTimingProfileCondition(idx, profileIdx)}
                                                className="flex items-center px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                              >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Ajouter une condition
                                              </button>
                                            </div>

                                            {profile.conditions && profile.conditions.length > 0 ? (
                                              <div className="space-y-2">
                                                {profile.conditions.map((profileCondition, conditionIdx) => {
                                                  const conditionQuestion = questions.find(q => q.id === profileCondition.question);
                                                  const conditionType = conditionQuestion?.type || 'choice';
                                                  const usesOptions = ['choice', 'multi_choice'].includes(conditionType);
                                                  const inputType = conditionType === 'number'
                                                    ? 'number'
                                                    : conditionType === 'date'
                                                      ? 'date'
                                                      : 'text';

                                                  return (
                                                    <div
                                                      key={conditionIdx}
                                                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 border border-gray-200 rounded-lg p-3"
                                                    >
                                                      <div className="md:col-span-5">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                                                        <select
                                                          value={profileCondition.question}
                                                          onChange={(e) => updateTimingProfileCondition(idx, profileIdx, conditionIdx, 'question', e.target.value)}
                                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                          <option value="">Sélectionner...</option>
                                                          {questions.map(question => (
                                                            <option key={question.id} value={question.id}>
                                                              {question.id} - {question.question.substring(0, 45)}...
                                                            </option>
                                                          ))}
                                                        </select>
                                                      </div>

                                                      <div className="md:col-span-3">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Opérateur</label>
                                                        <select
                                                          value={profileCondition.operator}
                                                          onChange={(e) => updateTimingProfileCondition(idx, profileIdx, conditionIdx, 'operator', e.target.value)}
                                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                          <option value="equals">Est égal à (=)</option>
                                                          <option value="not_equals">Est différent de (≠)</option>
                                                          <option value="contains">Contient</option>
                                                        </select>
                                                      </div>

                                                      <div className="md:col-span-3">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Valeur</label>
                                                        {usesOptions ? (
                                                          <select
                                                            value={profileCondition.value}
                                                            onChange={(e) => updateTimingProfileCondition(idx, profileIdx, conditionIdx, 'value', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                          >
                                                            <option value="">Sélectionner...</option>
                                                            {(conditionQuestion?.options || []).map((option, optionIdx) => (
                                                              <option key={optionIdx} value={option}>{option}</option>
                                                            ))}
                                                          </select>
                                                        ) : (
                                                          <input
                                                            type={inputType}
                                                            value={profileCondition.value}
                                                            onChange={(e) => updateTimingProfileCondition(idx, profileIdx, conditionIdx, 'value', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                            placeholder={inputType === 'number' ? 'Valeur numérique' : 'Valeur...'}
                                                          />
                                                        )}
                                                      </div>

                                                      <div className="md:col-span-1 flex justify-end">
                                                        <button
                                                          onClick={() => deleteTimingProfileCondition(idx, profileIdx, conditionIdx)}
                                                          className="text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                                                        >
                                                          <Trash2 className="w-4 h-4" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="text-xs text-gray-500 italic">
                                                Aucun critère : ce scénario s'applique par défaut.
                                              </div>
                                            )}
                                          </div>

                                          <div>
                                            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                              Délais (en semaines) par équipe
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {teams.map(team => {
                                                const requirementValue = requirementValueForTeam(team.id);
                                                return (
                                                  <div
                                                    key={team.id}
                                                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                                                  >
                                                    <span className="text-sm font-medium text-gray-700 pr-3 flex-1">
                                                      {team.name}
                                                    </span>
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      value={requirementValue === undefined ? '' : requirementValue}
                                                      onChange={(e) => updateTimingRequirement(idx, profileIdx, team.id, e.target.value)}
                                                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                                      placeholder="Sem."
                                                    />
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-2">
                                              Laissez le champ vide pour indiquer qu'aucun délai spécifique n'est requis pour cette équipe dans ce scénario.
                                            </p>
                                            {requirementEntries.length === 0 && (
                                              <p className="text-[11px] text-orange-600 mt-1">
                                                Aucun délai n'est défini pour ce scénario. Les équipes ne recevront pas d'exigence particulière.
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-600 italic">
                                    Aucun scénario configuré. Ajoutez un profil pour personnaliser les délais selon les équipes compliance.
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                              Ajoutez au moins deux questions de type "Date" dans le questionnaire pour configurer cette condition temporelle.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                            <select
                              value={condition.question}
                              onChange={(e) => updateCondition(idx, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Sélectionner...</option>
                              {questions.map(q => (
                                <option key={q.id} value={q.id}>{q.id} - {q.question.substring(0, 30)}...</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Opérateur</label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="equals">Est égal à (=)</option>
                              <option value="not_equals">Est différent de (≠)</option>
                              <option value="contains">Contient</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Valeur</label>
                            {(() => {
                              if (!condition.question) {
                                return (
                                  <input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Valeur (texte, date, etc.)"
                                  />
                                );
                              }

                              const usesOptions = ['choice', 'multi_choice'].includes(selectedQuestionType);

                              if (usesOptions) {
                                return (
                                  <select
                                    value={condition.value}
                                    onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="">Sélectionner...</option>
                                    {(selectedQuestion?.options || []).map((opt, i) => (
                                      <option key={i} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                );
                              }

                              const inputType = selectedQuestionType === 'number' ? 'number' : 'text';
                              const placeholder =
                                selectedQuestionType === 'date'
                                  ? 'AAAA-MM-JJ'
                                  : selectedQuestionType === 'url'
                                    ? 'https://...'
                                    : 'Valeur (texte, date, etc.)';

                              return (
                                <input
                                  type={inputType}
                                  value={condition.value}
                                  onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                  placeholder={placeholder}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Équipes à déclencher */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Équipes compliance à déclencher</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    editedRule.teams.includes(team.id)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      editedRule.teams.includes(team.id)
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {editedRule.teams.includes(team.id) && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.id}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions par équipe */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Questions à préparer par équipe</h3>
            {editedRule.teams.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                Sélectionnez au moins une équipe pour définir les questions.
              </div>
            ) : (
              <div className="space-y-4">
                {editedRule.teams.map(teamId => (
                  <div key={teamId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {teams.find(team => team.id === teamId)?.name || teamId}
                      </h4>
                      <button
                        onClick={() => addQuestionForTeam(teamId)}
                        className="flex items-center px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter une question
                      </button>
                    </div>
                    {(editedRule.questions[teamId] || []).length > 0 ? (
                      <div className="space-y-2">
                        {(editedRule.questions[teamId] || []).map((questionText, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={questionText}
                              onChange={(e) => updateTeamQuestion(teamId, idx, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="Question pour l'équipe..."
                            />
                            <button
                              onClick={() => deleteTeamQuestion(teamId, idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucune question définie</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risques */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">⚠️ Risques associés</h3>
              <button
                onClick={addRisk}
                className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un risque
              </button>
            </div>

            {editedRule.risks.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                Aucun risque défini pour cette règle.
              </div>
            ) : (
              <div className="space-y-3">
                {editedRule.risks.map((risk, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Risque {idx + 1}</span>
                      <button
                        onClick={() => deleteRisk(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-all ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description du risque</label>
                        <input
                          type="text"
                          value={risk.description}
                          onChange={(e) => updateRisk(idx, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ex: Non-conformité RGPD sur les données de santé"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Niveau de criticité</label>
                        <select
                          value={risk.level}
                          onChange={(e) => updateRisk(idx, 'level', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Faible">🟢 Faible</option>
                          <option value="Moyen">🟠 Moyen</option>
                          <option value="Élevé">🔴 Élevé</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Actions de mitigation</label>
                        <textarea
                          value={risk.mitigation}
                          onChange={(e) => updateRisk(idx, 'mitigation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          rows="2"
                          placeholder="Ex: Réaliser une DPIA et héberger sur un serveur HDS"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

