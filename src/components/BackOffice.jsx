import React, { useState } from '../react.js';
import { Settings, Plus, Edit, Trash2, Eye, Info } from './icons.js';
import { QuestionEditor } from './QuestionEditor.jsx';
import { RuleEditor } from './RuleEditor.jsx';
import { renderTextWithLinks } from '../utils/linkify.js';
import { normalizeTimingRequirement } from '../utils/rules.js';

export const BackOffice = ({ questions, setQuestions, rules, setRules, teams, setTeams }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [editingRule, setEditingRule] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const tabDefinitions = [
    {
      id: 'questions',
      label: `Questions (${questions.length})`,
      panelId: 'backoffice-tabpanel-questions'
    },
    {
      id: 'rules',
      label: `Règles (${rules.length})`,
      panelId: 'backoffice-tabpanel-rules'
    },
    {
      id: 'teams',
      label: `Équipes (${teams.length})`,
      panelId: 'backoffice-tabpanel-teams'
    }
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      type: 'choice',
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2'],
      required: true,
      conditions: [],
      conditionLogic: 'all',
      guidance: {
        objective: '',
        details: '',
        tips: []
      }
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveQuestion = (updatedQuestion) => {
    const questionIndex = questions.findIndex(q => q.id === updatedQuestion.id);
    if (questionIndex >= 0) {
      const newQuestions = [...questions];
      newQuestions[questionIndex] = updatedQuestion;
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, updatedQuestion]);
    }
    setEditingQuestion(null);
  };

  const addRule = () => {
    const newRule = {
      id: `rule${rules.length + 1}`,
      name: 'Nouvelle règle',
      conditions: [],
      conditionLogic: 'all',
      teams: [],
      questions: {},
      risks: [],
      priority: 'Important'
    };
    setRules([...rules, newRule]);
    setEditingRule(newRule);
  };

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
    if (editingRule?.id === id) {
      setEditingRule(null);
    }
  };

  const saveRule = (updatedRule) => {
    const ruleIndex = rules.findIndex(r => r.id === updatedRule.id);
    if (ruleIndex >= 0) {
      const newRules = [...rules];
      newRules[ruleIndex] = updatedRule;
      setRules(newRules);
    } else {
      setRules([...rules, updatedRule]);
    }
    setEditingRule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 hv-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 hv-surface" role="region" aria-label="Back-office compliance">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
            <Settings className="w-10 h-10 mr-3 text-indigo-600" />
            Back-Office Compliance
          </h1>

          <div className="flex space-x-2 mb-8 border-b border-gray-200" role="tablist" aria-label="Gestion back-office">
            {tabDefinitions.map(tab => (
              <button
                key={tab.id}
                type="button"
                id={`backoffice-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tab.panelId}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all hv-focus-ring ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'questions' && (
            <div id="backoffice-tabpanel-questions" role="tabpanel" aria-labelledby="backoffice-tab-questions">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestion des questions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configurez les questions et leurs conditions d'affichage
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hv-button hv-button-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une question
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-indigo-300 transition-all hv-surface"
                    role="article"
                    aria-label={`Question ${q.id}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                            {q.id}
                          </span>
                          <span className="text-lg font-bold text-gray-800">{q.question}</span>
                          {(() => {
                            const type = q.type || 'choice';
                            const typeLabels = {
                              choice: 'Liste de choix',
                              date: 'Date',
                              multi_choice: 'Choix multiples',
                              number: 'Valeur numérique',
                              url: 'Lien URL',
                              file: 'Fichier',
                              text: 'Texte libre (1 ligne)',
                              long_text: 'Texte libre (plusieurs lignes)'
                            };
                            const badgeStyles = {
                              choice: 'bg-gray-50 border-gray-200 text-gray-600',
                              date: 'bg-blue-50 border-blue-200 text-blue-700',
                              multi_choice: 'bg-purple-50 border-purple-200 text-purple-700',
                              number: 'bg-green-50 border-green-200 text-green-700',
                              url: 'bg-amber-50 border-amber-200 text-amber-700',
                              file: 'bg-pink-50 border-pink-200 text-pink-700',
                              text: 'bg-sky-50 border-sky-200 text-sky-700',
                              long_text: 'bg-slate-50 border-slate-200 text-slate-700'
                            };
                            const badgeClass = badgeStyles[type] || badgeStyles.choice;

                            return (
                              <span className={`ml-3 text-xs px-2 py-1 rounded-full border ${badgeClass}`}>
                                Type : {typeLabels[type] || typeLabels.choice}
                              </span>
                            );
                          })()}
                          {q.required && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Obligatoire
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-3">
                          {(() => {
                            const type = q.type || 'choice';

                            if (type === 'choice' || type === 'multi_choice') {
                              return (
                                <>
                                  <p className="text-sm text-gray-600 font-medium">
                                    Options de réponse {type === 'multi_choice' ? '(sélection multiple possible)' : ''} :
                                  </p>
                                  {q.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-center text-sm text-gray-700">
                                      <span className="text-indigo-500 mr-2">•</span>
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </>
                              );
                            }

                            if (type === 'date') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">Réponse attendue : sélection d'une date</p>
                              );
                            }

                            if (type === 'text') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">
                                  Réponse attendue : saisie d'un texte court sur une ligne
                                </p>
                              );
                            }

                            if (type === 'long_text') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">
                                  Réponse attendue : saisie d'un texte libre sur plusieurs lignes
                                </p>
                              );
                            }

                            if (type === 'number') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">
                                  Réponse attendue : saisie d'une valeur numérique
                                </p>
                              );
                            }

                            if (type === 'url') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">
                                  Réponse attendue : saisie d'un lien URL complet
                                </p>
                              );
                            }

                            if (type === 'file') {
                              return (
                                <p className="text-sm text-gray-600 font-medium">
                                  Réponse attendue : téléversement d'un fichier
                                </p>
                              );
                            }

                            return null;
                          })()}
                        </div>

                        {q.conditions && q.conditions.length > 0 ? (
                          <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs font-semibold text-green-800 mb-1">
                              🎯 Conditions d'affichage ({q.conditionLogic === 'any' ? 'logique OU' : 'logique ET'})
                            </p>
                            <div className="space-y-1">
                              {q.conditions.map((cond, condIdx) => {
                                const refQuestion = questions.find(rq => rq.id === cond.question);
                                const connectorLabel = q.conditionLogic === 'any' ? 'OU' : 'ET';
                                return (
                                  <div key={condIdx} className="text-xs text-green-700">
                                    {condIdx > 0 && <strong>{connectorLabel} </strong>}
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">
                                      {refQuestion?.id || cond.question}{' '}
                                      {cond.operator === 'equals' ? '=' : cond.operator === 'not_equals' ? '≠' : 'contient'}{' '}
                                      "{cond.value}"
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-gray-500 italic">
                            Cette question s'affiche toujours
                          </div>
                        )}

                        {(() => {
                          const guidance = q.guidance || {};
                          const tips = Array.isArray(guidance.tips)
                            ? guidance.tips.filter(tip => typeof tip === 'string' && tip.trim() !== '')
                            : [];
                          const hasGuidance = Boolean(
                            (guidance.objective && guidance.objective.trim() !== '') ||
                              (guidance.details && guidance.details.trim() !== '') ||
                              tips.length > 0
                          );

                          if (!hasGuidance) {
                            return (
                              <div className="mt-3 text-xs text-gray-400 italic">
                                Aucun contenu de guidage contextuel n'est encore configuré.
                              </div>
                            );
                          }

                          return (
                            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <div className="flex items-start">
                                <Info className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                                <div className="space-y-2 text-xs text-gray-700">
                                  {guidance.objective && (
                                    <p>
                                      <span className="font-semibold text-indigo-700">Objectif :</span>{' '}
                                      {renderTextWithLinks(guidance.objective)}
                                    </p>
                                  )}
                                  {guidance.details && <p>{renderTextWithLinks(guidance.details)}</p>}
                                  {tips.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-indigo-700 text-[11px] uppercase tracking-wide">
                                        Conseils partagés
                                      </p>
                                      <ul className="mt-1 space-y-1 list-disc list-inside text-gray-700">
                                        {tips.map((tip, idx) => (
                                          <li key={idx}>{renderTextWithLinks(tip)}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => setEditingQuestion(q)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-all hv-button"
                          aria-label={`Modifier la question ${q.id}`}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(q.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-all hv-button"
                          aria-label={`Supprimer la question ${q.id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div id="backoffice-tabpanel-rules" role="tabpanel" aria-labelledby="backoffice-tab-rules">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestion des règles</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Définissez les déclencheurs et les risques associés
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addRule}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hv-button hv-button-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une règle
                </button>
              </div>

              <div className="space-y-4">
                {rules.map(ruleItem => (
                  <div
                    key={ruleItem.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hv-surface"
                    role="article"
                    aria-label={`Règle ${ruleItem.name}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                            {ruleItem.id}
                          </span>
                          <span className="text-lg font-bold text-gray-800">{ruleItem.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Priorité : {ruleItem.priority}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingRule(ruleItem)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-all hv-button"
                          aria-label={`Afficher la règle ${ruleItem.name}`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRule(ruleItem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-all hv-button"
                          aria-label={`Supprimer la règle ${ruleItem.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Conditions ({ruleItem.conditionLogic === 'any' ? 'logique OU' : 'logique ET'})
                        </h4>
                        <ul className="space-y-1">
                          {ruleItem.conditions.map((condition, idx) => {
                            const conditionType = condition.type || 'question';
                            const connectorLabel = ruleItem.conditionLogic === 'any' ? 'OU' : 'ET';

                            if (conditionType === 'timing') {
                              const startQuestion = questions.find(q => q.id === condition.startQuestion);
                              const endQuestion = questions.find(q => q.id === condition.endQuestion);
                              const startLabel = startQuestion ? startQuestion.question : condition.startQuestion || 'Date départ ?';
                              const endLabel = endQuestion ? endQuestion.question : condition.endQuestion || 'Date arrivée ?';
                              const constraints = [];

                              if (typeof condition.minimumWeeks === 'number') {
                                constraints.push(`≥ ${condition.minimumWeeks} sem.`);
                              }

                              if (typeof condition.maximumWeeks === 'number') {
                                constraints.push(`≤ ${condition.maximumWeeks} sem.`);
                              }

                              if (typeof condition.minimumDays === 'number') {
                                constraints.push(`≥ ${condition.minimumDays} j.`);
                              }

                              if (typeof condition.maximumDays === 'number') {
                                constraints.push(`≤ ${condition.maximumDays} j.`);
                              }

                              const profiles = Array.isArray(condition.complianceProfiles)
                                ? condition.complianceProfiles
                                : [];

                              return (
                                <li key={idx} className="flex items-start">
                                  <span className="text-indigo-500 mr-2">•</span>
                                  <div>
                                    {idx > 0 && (
                                      <span className="inline-flex items-center px-2 py-0.5 mb-2 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-indigo-100 text-indigo-700">
                                        {connectorLabel}
                                      </span>
                                    )}
                                    <div className="font-medium text-gray-800">
                                      Fenêtre entre « {startLabel} » et « {endLabel} »
                                    </div>

                                    {constraints.length > 0 && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        Contraintes générales : {constraints.join(' / ')}
                                      </div>
                                    )}

                                    {profiles.length > 0 ? (
                                      <div className="mt-3 space-y-2">
                                        {profiles.map((profile, profileIdx) => {
                                          const requirementEntries = Object.entries(profile.requirements || {});
                                          const profileKey = profile.id || `${idx}-${profileIdx}`;

                                          return (
                                            <div
                                              key={profileKey}
                                              className="bg-white border border-indigo-100 rounded-lg p-3 text-xs text-gray-700"
                                            >
                                              <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-800">
                                                  {profile.label || 'Scénario personnalisé'}
                                                </span>
                                                <span className="text-indigo-600 font-mono">
                                                  {profile.conditions && profile.conditions.length > 0
                                                    ? `${profile.conditions.length} condition(s) • ${profile.conditionLogic === 'any' ? 'OU' : 'ET'}`
                                                    : 'Par défaut'}
                                                </span>
                                              </div>

                                              {profile.description && (
                                                <p className="text-[11px] text-gray-500 mb-2">
                                                  {profile.description}
                                                </p>
                                              )}

                                              <div className="flex flex-wrap gap-2 mb-2">
                                                {requirementEntries.length > 0 ? (
                                                  requirementEntries.map(([teamId, value]) => {
                                                    const normalized = normalizeTimingRequirement(value);
                                                    const team = teams.find(t => t.id === teamId);
                                                    const labelParts = [];

                                                    if (normalized.minimumWeeks !== undefined) {
                                                      labelParts.push(`≥ ${normalized.minimumWeeks} sem.`);
                                                    }

                                                    if (normalized.minimumDays !== undefined) {
                                                      labelParts.push(`≥ ${normalized.minimumDays} j.`);
                                                    }

                                                    const requirementText = labelParts.length > 0
                                                      ? labelParts.join(' / ')
                                                      : 'Configuration personnalisée';

                                                    return (
                                                      <span
                                                        key={teamId}
                                                        className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-semibold"
                                                      >
                                                        {(team?.name || teamId)} : {requirementText}
                                                      </span>
                                                    );
                                                  })
                                                ) : (
                                                  <span className="text-gray-500 italic">
                                                    Aucun délai spécifique défini pour ce scénario.
                                                  </span>
                                                )}
                                              </div>

                                              {profile.conditions && profile.conditions.length > 0 && (
                                                <div className="text-[11px] text-gray-500 space-y-1">
                                                  {profile.conditions.map((cond, condIdx) => {
                                                    const refQuestion = questions.find(q => q.id === cond.question);
                                                    const operatorLabel = cond.operator === 'equals'
                                                      ? '='
                                                      : cond.operator === 'not_equals'
                                                        ? '≠'
                                                        : 'contient';

                                                    return (
                                                      <div key={condIdx}>
                                                        {condIdx === 0
                                                          ? 'Si '
                                                          : profile.conditionLogic === 'any'
                                                            ? 'ou '
                                                            : 'et '}
                                                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                                                          {refQuestion?.id || cond.question}
                                                        </span>{' '}
                                                        {operatorLabel} « {cond.value} »
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500 italic mt-2">
                                        Aucun scénario de délai spécifique n'a été configuré.
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            }

                            return (
                              <li key={idx} className="flex items-start">
                                <span className="text-indigo-500 mr-2">•</span>
                                <span>
                                  {idx > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 mr-2 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-indigo-100 text-indigo-700">
                                      {connectorLabel}
                                    </span>
                                  )}
                                  {condition.question} {condition.operator === 'equals' ? '=' : condition.operator === 'not_equals' ? '≠' : 'contient'} "{condition.value}"
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Équipes</h4>
                        <div className="flex flex-wrap gap-2">
                          {ruleItem.teams.map(teamId => (
                            <span key={teamId} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                              {teamId}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Risques</h4>
                        <ul className="space-y-1">
                          {ruleItem.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              <span>{risk.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div id="backoffice-tabpanel-teams" role="tabpanel" aria-labelledby="backoffice-tab-teams">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestion des équipes</h2>
                <button
                  type="button"
                  onClick={() => {
                    const newTeam = {
                      id: `team${teams.length + 1}`,
                      name: 'Nouvelle équipe',
                      contact: 'email@company.com',
                      expertise: "Domaine d'expertise"
                    };
                    setTeams([...teams, newTeam]);
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hv-button hv-button-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une équipe
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200 hv-surface"
                    role="article"
                    aria-label={`Équipe ${team.name}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => {
                          const updated = [...teams];
                          updated[idx].name = e.target.value;
                          setTeams(updated);
                        }}
                        className="text-lg font-bold text-gray-800 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none flex-1 hv-focus-ring"
                        />
                      <button
                        type="button"
                        onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-all hv-button"
                        aria-label={`Supprimer l'équipe ${team.name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={team.contact}
                      onChange={(e) => {
                        const updated = [...teams];
                        updated[idx].contact = e.target.value;
                        setTeams(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm hv-focus-ring"
                      placeholder="Email de contact"
                    />
                    <textarea
                      value={team.expertise}
                      onChange={(e) => {
                        const updated = [...teams];
                        updated[idx].expertise = e.target.value;
                        setTeams(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm hv-focus-ring"
                      rows="2"
                      placeholder="Domaine d'expertise"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onSave={saveQuestion}
          onCancel={() => setEditingQuestion(null)}
          allQuestions={questions}
        />
      )}

      {editingRule && (
        <RuleEditor
          rule={editingRule}
          onSave={saveRule}
          onCancel={() => setEditingRule(null)}
          questions={questions}
          teams={teams}
        />
      )}
    </div>
  );
};


