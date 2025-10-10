const { useState } = React;

const createIcon = (symbol) => {
  return ({ className = '', ...props }) => (
    <span
      className={`inline-flex items-center justify-center ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {symbol}
    </span>
  );
};

const ChevronRight = createIcon('›');
const ChevronLeft = createIcon('‹');
const AlertTriangle = createIcon('⚠️');
const CheckCircle = createIcon('✔️');
const Settings = createIcon('⚙️');
const FileText = createIcon('📄');
const Users = createIcon('👥');
const Calendar = createIcon('📅');
const Info = createIcon('ℹ️');
const Edit = createIcon('✏️');
const Plus = createIcon('➕');
const Trash2 = createIcon('🗑️');
const Eye = createIcon('👁️');
const GripVertical = createIcon('⋮⋮');

// ============================================
// DONNÉES DE CONFIGURATION INITIALES
// ============================================

const initialQuestions = [
  {
    id: 'q1',
    question: 'Quel est le périmètre de votre projet ?',
    options: [
      'Interne uniquement',
      'Externe (patients/public)',
      'Externe (professionnels de santé)',
      'Mixte'
    ],
    required: true,
    conditions: []
  },
  {
    id: 'q2',
    question: 'Le projet implique-t-il du digital ?',
    options: [
      'Oui - Application mobile',
      'Oui - Site web',
      'Oui - Plateforme en ligne',
      'Non'
    ],
    required: true,
    conditions: []
  },
  {
    id: 'q3',
    question: 'Des données personnelles seront-elles collectées ?',
    options: [
      'Oui - Données de santé',
      'Oui - Données personnelles standard',
      'Non'
    ],
    required: true,
    conditions: [
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ]
  },
  {
    id: 'q4',
    question: 'Le projet implique-t-il des prestataires externes ?',
    options: [
      'Oui',
      'Non',
      'Pas encore décidé'
    ],
    required: true,
    conditions: []
  }
];

// Fonction pour évaluer si une question doit être affichée
const shouldShowQuestion = (question, answers) => {
  if (!question.conditions || question.conditions.length === 0) {
    return true; // Pas de condition = toujours afficher
  }

  // Toutes les conditions doivent être remplies (logique ET)
  return question.conditions.every(condition => {
    const answer = answers[condition.question];
    if (!answer) return false;

    switch (condition.operator) {
      case 'equals':
        return answer === condition.value;
      case 'not_equals':
        return answer !== condition.value;
      case 'contains':
        return answer.includes(condition.value);
      default:
        return false;
    }
  });
};

const initialTeams = [
  {
    id: 'bpp',
    name: 'Bonnes Pratiques Promotionnelles',
    contact: 'bpp@company.com',
    expertise: 'Conformité réglementaire des communications professionnelles de santé'
  },
  {
    id: 'it',
    name: 'IT & Sécurité',
    contact: 'it-security@company.com',
    expertise: "Sécurité des systèmes d'information et protection des données"
  },
  {
    id: 'legal',
    name: 'Juridique',
    contact: 'legal@company.com',
    expertise: 'Conformité légale et contractuelle'
  },
  {
    id: 'privacy',
    name: 'Privacy & RGPD',
    contact: 'privacy@company.com',
    expertise: 'Protection des données personnelles et conformité RGPD'
  },
  {
    id: 'quality',
    name: 'Qualité & GxP',
    contact: 'quality@company.com',
    expertise: 'Bonnes pratiques pharmaceutiques et qualité'
  }
];

const initialRules = [
  {
    id: 'rule1',
    name: 'Projet externe digital avec professionnels de santé',
    conditions: [
      { question: 'q1', operator: 'equals', value: 'Externe (professionnels de santé)' },
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    teams: ['bpp', 'it', 'legal'],
    questions: {
      bpp: ['Le contenu a-t-il été validé médicalement ?', 'Les mentions légales sont-elles conformes ?'],
      it: ["Quelles sont les mesures de sécurité prévues pour l'hébergement ?", 'Un audit de sécurité est-il planifié ?'],
      legal: ['Les CGU/CGV sont-elles conformes au Code de la Santé Publique ?']
    },
    risks: [
      {
        description: 'Communication non conforme aux bonnes pratiques promotionnelles',
        level: 'Élevé',
        mitigation: 'Validation BPP avant tout déploiement'
      }
    ],
    priority: 'Critique'
  },
  {
    id: 'rule2',
    name: 'Projet avec données de santé',
    conditions: [
      { question: 'q3', operator: 'equals', value: 'Oui - Données de santé' }
    ],
    teams: ['privacy', 'it', 'quality', 'legal'],
    questions: {
      privacy: ['Une DPIA a-t-elle été réalisée ?', 'Le registre des traitements est-il à jour ?', 'Les consentements sont-ils conformes RGPD ?'],
      it: ["L'hébergement est-il certifié HDS ?", 'Le chiffrement des données est-il implémenté ?'],
      quality: ['Les processus respectent-ils les GxP applicables ?'],
      legal: ['Les clauses contractuelles incluent-elles les garanties RGPD ?']
    },
    risks: [
      {
        description: 'Non-conformité RGPD - Données de santé sensibles',
        level: 'Élevé',
        mitigation: 'DPIA obligatoire et hébergement HDS'
      },
      {
        description: 'Violation de données personnelles',
        level: 'Élevé',
        mitigation: 'Mesures de sécurité renforcées et chiffrement'
      }
    ],
    priority: 'Critique'
  },
  {
    id: 'rule3',
    name: 'Projet avec prestataires externes',
    conditions: [
      { question: 'q4', operator: 'equals', value: 'Oui' }
    ],
    teams: ['legal', 'quality'],
    questions: {
      legal: ['Les contrats incluent-ils les clauses de confidentialité ?', 'Les assurances sont-elles adéquates ?'],
      quality: ['Les prestataires sont-ils qualifiés selon nos standards ?', 'Un audit fournisseur est-il prévu ?']
    },
    risks: [
      {
        description: 'Risque contractuel avec prestataires',
        level: 'Moyen',
        mitigation: 'Validation juridique des contrats avant signature'
      }
    ],
    priority: 'Important'
  },
  {
    id: 'rule4',
    name: 'Projet digital externe (patients/public)',
    conditions: [
      { question: 'q1', operator: 'equals', value: 'Externe (patients/public)' },
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    teams: ['legal', 'it', 'privacy'],
    questions: {
      legal: ["Le site respecte-t-il les obligations d'information des consommateurs ?", "L'accessibilité numérique est-elle assurée ?"],
      it: ['Les standards de sécurité web sont-ils respectés ?'],
      privacy: ['Les cookies sont-ils conformes aux règles CNIL ?', 'La politique de confidentialité est-elle claire ?']
    },
    risks: [
      {
        description: 'Non-conformité accessibilité numérique',
        level: 'Moyen',
        mitigation: 'Audit accessibilité et remédiation'
      }
    ],
    priority: 'Important'
  }
];

// ============================================
// MOTEUR DE RÈGLES
// ============================================

const evaluateRule = (rule, answers) => {
  return rule.conditions.every(condition => {
    const answer = answers[condition.question];
    if (!answer) return false;

    switch (condition.operator) {
      case 'equals':
        return answer === condition.value;
      case 'not_equals':
        return answer !== condition.value;
      case 'contains':
        return answer.includes(condition.value);
      default:
        return false;
    }
  });
};

const analyzeAnswers = (answers, rules) => {
  const triggeredRules = rules.filter(rule => evaluateRule(rule, answers));

  const teamsSet = new Set();
  const allQuestions = {};
  const allRisks = [];

  triggeredRules.forEach(rule => {
    rule.teams.forEach(teamId => teamsSet.add(teamId));

    Object.entries(rule.questions).forEach(([teamId, questions]) => {
      if (!allQuestions[teamId]) {
        allQuestions[teamId] = [];
      }
      allQuestions[teamId].push(...questions);
    });

    allRisks.push(...rule.risks.map(risk => ({ ...risk, priority: rule.priority })));
  });

  const highRiskCount = allRisks.filter(r => r.level === 'Élevé').length;

  return {
    teams: Array.from(teamsSet),
    questions: allQuestions,
    risks: allRisks,
    complexity: highRiskCount > 2 ? 'Élevé' : highRiskCount > 0 ? 'Moyen' : 'Faible'
  };
};

// ============================================
// COMPOSANTS UI
// ============================================

const QuestionnaireScreen = ({ questions, currentIndex, answers, onAnswer, onNext, onBack }) => {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentIndex + 1} sur {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentIndex === 0 && (
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Certaines questions peuvent apparaître en fonction de vos réponses
              </p>
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(currentQuestion.id, option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQuestion.id] === option
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={onBack}
              disabled={currentIndex === 0}
              className="flex items-center px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </button>

            <button
              onClick={onNext}
              disabled={!answers[currentQuestion.id]}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentIndex === questions.length - 1 ? 'Voir la synthèse' : 'Suivant'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const SynthesisReport = ({ answers, analysis, teams, questions, onRestart }) => {
  const relevantTeams = teams.filter(team => analysis.teams.includes(team.id));

  const priorityColors = {
    Critique: 'bg-red-100 text-red-800 border-red-300',
    Important: 'bg-orange-100 text-orange-800 border-orange-300',
    Recommandé: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const riskColors = {
    Élevé: 'bg-red-50 border-red-300 text-red-900',
    Moyen: 'bg-orange-50 border-orange-300 text-orange-900',
    Faible: 'bg-green-50 border-green-300 text-green-900'
  };

  const complexityColors = {
    Élevé: 'text-red-600',
    Moyen: 'text-orange-600',
    Faible: 'text-green-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Rapport de Compliance</h1>
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all"
            >
              Nouveau projet
            </button>
          </div>

          {/* Vue d'ensemble */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-indigo-600" />
              Vue d'ensemble du projet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q =>
                answers[q.id] ? (
                  <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">{q.question}</p>
                    <p className="font-semibold text-gray-900">{answers[q.id]}</p>
                  </div>
                ) : null
              )}
            </div>
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
              <span className="font-medium text-gray-700">Niveau de complexité compliance :</span>
              <span className={`text-xl font-bold ${complexityColors[analysis.complexity]}`}>
                {analysis.complexity}
              </span>
            </div>
          </div>

          {/* Équipes à solliciter */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-indigo-600" />
              Équipes à solliciter ({relevantTeams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantTeams.map(team => {
                const teamPriority = analysis.risks.find(r => analysis.questions[team.id])?.priority || 'Recommandé';

                return (
                  <div key={team.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[teamPriority]}`}>
                        {teamPriority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{team.expertise}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>À solliciter en phase de conception</span>
                    </div>
                    <div className="mt-2 text-sm text-indigo-600 font-medium">
                      📧 {team.contact}
                    </div>

                    {analysis.questions[team.id] && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Points à préparer :</h4>
                        <ul className="space-y-1">
                          {analysis.questions[team.id].map((question, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risques identifiés */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
              Risques identifiés ({analysis.risks.length})
            </h2>
            <div className="space-y-3">
              {analysis.risks.map((risk, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${riskColors[risk.level]}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{risk.level}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[risk.priority]}`}>
                      {risk.priority}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{risk.description}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-gray-700">Mitigation :</span> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const QuestionEditor = ({ question, onSave, onCancel, allQuestions }) => {
  const [editedQuestion, setEditedQuestion] = useState({
    ...question,
    conditions: question.conditions || []
  });
  const [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const reorderOptions = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setEditedQuestion(prev => {
      const newOptions = [...prev.options];
      const [moved] = newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, moved);

      return {
        ...prev,
        options: newOptions
      };
    });
  };

  const handleDragStart = (event, index) => {
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
    setDraggedOptionIndex(index);
    setDragOverIndex(index);
  };

  const handleDragEnter = (index) => {
    if (draggedOptionIndex === null || draggedOptionIndex === index) return;
    reorderOptions(draggedOptionIndex, index);
    setDraggedOptionIndex(index);
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedOptionIndex(null);
    setDragOverIndex(null);
  };

  const addCondition = () => {
    setEditedQuestion({
      ...editedQuestion,
      conditions: [...editedQuestion.conditions, { question: '', operator: 'equals', value: '' }]
    });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...editedQuestion.conditions];
    newConditions[index][field] = value;
    setEditedQuestion({ ...editedQuestion, conditions: newConditions });
  };

  const deleteCondition = (index) => {
    setEditedQuestion({
      ...editedQuestion,
      conditions: editedQuestion.conditions.filter((_, i) => i !== index)
    });
  };

  const addOption = () => {
    setEditedQuestion({
      ...editedQuestion,
      options: [...editedQuestion.options, 'Nouvelle option']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const deleteOption = (index) => {
    if (editedQuestion.options.length > 1) {
      setEditedQuestion({
        ...editedQuestion,
        options: editedQuestion.options.filter((_, i) => i !== index)
      });
    }
  };

  // Filtrer les questions pour ne pas inclure la question en cours d'édition
  const availableQuestions = allQuestions.filter(q => q.id !== editedQuestion.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Édition de question</h2>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => onSave(editedQuestion)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Informations de base */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Informations de base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant de la question</label>
                <input
                  type="text"
                  value={editedQuestion.id}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'identifiant ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Texte de la question</label>
                <textarea
                  value={editedQuestion.question}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                  placeholder="Ex: Quel est le périmètre de votre projet ?"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedQuestion.required}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, required: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Question obligatoire
                </label>
              </div>
            </div>
          </div>

          {/* Options de réponse */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">✅ Options de réponse</h3>
              <button
                onClick={addOption}
                className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une option
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Glissez-déposez les options pour modifier leur ordre d'affichage.
            </p>

            <div className="space-y-2">
              {editedQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 rounded-lg border border-transparent bg-white p-2 transition-colors ${
                    dragOverIndex === idx ? 'border-indigo-200 bg-indigo-50 shadow' : 'shadow-sm'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(idx);
                  }}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (draggedOptionIndex !== idx) {
                      setDragOverIndex(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDragEnd();
                  }}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, idx)}
                    className="cursor-grab px-2 py-3 text-gray-400 hover:text-indigo-600 focus:outline-none"
                    aria-label={`Réordonner l'option ${idx + 1}`}
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <span className="text-gray-500 font-medium w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Texte de l'option..."
                  />
                  <button
                    onClick={() => deleteOption(idx)}
                    disabled={editedQuestion.options.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions d'affichage */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">🎯 Conditions d'affichage</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Définissez quand cette question doit apparaître dans le questionnaire
                </p>
              </div>
              <button
                onClick={addCondition}
                className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une condition
              </button>
            </div>

            {editedQuestion.conditions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-2">Cette question s'affiche toujours</p>
                <p className="text-sm text-gray-500">
                  Ajoutez une condition pour afficher cette question uniquement dans certains cas
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Logique :</strong> Cette question s'affichera si{' '}
                    <strong className="text-blue-700">toutes</strong> les conditions ci-dessous sont remplies (logique ET)
                  </p>
                </div>

                <div className="space-y-3">
                  {editedQuestion.conditions.map((condition, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-3 mb-3">
                        {idx > 0 && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ET
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-700">
                          Condition {idx + 1}
                        </span>
                        <button
                          onClick={() => deleteCondition(idx)}
                          className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Si la question
                          </label>
                          <select
                            value={condition.question}
                            onChange={(e) => updateCondition(idx, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Sélectionner...</option>
                            {availableQuestions.map(q => (
                              <option key={q.id} value={q.id}>
                                {q.id} - {q.question.substring(0, 30)}...
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Opérateur
                          </label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value="equals">Est égal à (=)</option>
                            <option value="not_equals">Est différent de (≠)</option>
                            <option value="contains">Contient</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Valeur
                          </label>
                          {condition.question ? (
                            <select
                              value={condition.value}
                              onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Sélectionner...</option>
                              {questions.find(q => q.id === condition.question)?.options.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              placeholder="Valeur..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const RuleEditor = ({ rule, onSave, onCancel, questions, teams }) => {
  const [editedRule, setEditedRule] = useState({
    ...rule,
    conditions: rule.conditions || [],
    questions: rule.questions || {},
    risks: rule.risks || []
  });

  const addCondition = () => {
    setEditedRule({
      ...editedRule,
      conditions: [...editedRule.conditions, { question: '', operator: 'equals', value: '' }]
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Édition de règle</h2>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => onSave(editedRule)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
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
                {editedRule.conditions.map((condition, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-2">
                      {idx > 0 && (
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          ET
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-700">
                        Condition {idx + 1}
                      </span>
                      <button
                        onClick={() => deleteCondition(idx)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

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
                        {condition.question ? (
                          <select
                            value={condition.value}
                            onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Sélectionner...</option>
                            {questions.find(q => q.id === condition.question)?.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            placeholder="Valeur..."
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
const BackOffice = ({ questions, setQuestions, rules, setRules, teams, setTeams }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [editingRule, setEditingRule] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2'],
      required: true,
      conditions: []
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
            <Settings className="w-10 h-10 mr-3 text-indigo-600" />
            Back-Office Compliance
          </h1>

          <div className="flex space-x-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'questions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'rules'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Règles ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'teams'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Équipes ({teams.length})
            </button>
          </div>

          {activeTab === 'questions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestion des questions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configurez les questions et leurs conditions d'affichage
                  </p>
                </div>
                <button
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une question
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                            {q.id}
                          </span>
                          <span className="text-lg font-bold text-gray-800">{q.question}</span>
                          {q.required && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Obligatoire
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600 font-medium">Options de réponse :</p>
                          {q.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center text-sm text-gray-700">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>

                        {q.conditions && q.conditions.length > 0 ? (
                          <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs font-semibold text-green-800 mb-1">
                              🎯 Conditions d'affichage :
                            </p>
                            <div className="space-y-1">
                              {q.conditions.map((cond, condIdx) => {
                                const refQuestion = questions.find(rq => rq.id === cond.question);
                                return (
                                  <div key={condIdx} className="text-xs text-green-700">
                                    {condIdx > 0 && <strong>ET </strong>}
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
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
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
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestion des règles</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Définissez les déclencheurs et les risques associés
                  </p>
                </div>
                <button
                  onClick={addRule}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une règle
                </button>
              </div>

              <div className="space-y-4">
                {rules.map(ruleItem => (
                  <div key={ruleItem.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
                          onClick={() => setEditingRule(ruleItem)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRule(ruleItem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Conditions</h4>
                        <ul className="space-y-1">
                          {ruleItem.conditions.map((condition, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>
                                {condition.question} {condition.operator === 'equals' ? '=' : condition.operator === 'not_equals' ? '≠' : 'contient'} "{condition.value}"
                              </span>
                            </li>
                          ))}
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
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestion des équipes</h2>
                <button
                  onClick={() => {
                    const newTeam = {
                      id: `team${teams.length + 1}`,
                      name: 'Nouvelle équipe',
                      contact: 'email@company.com',
                      expertise: "Domaine d'expertise"
                    };
                    setTeams([...teams, newTeam]);
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une équipe
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, idx) => (
                  <div key={team.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => {
                          const updated = [...teams];
                          updated[idx].name = e.target.value;
                          setTeams(updated);
                        }}
                        className="text-lg font-bold text-gray-800 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none flex-1"
                      />
                      <button
                        onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-all"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                      placeholder="Email de contact"
                    />
                    <textarea
                      value={team.expertise}
                      onChange={(e) => {
                        const updated = [...teams];
                        updated[idx].expertise = e.target.value;
                        setTeams(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
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

const ComplianceDecisionTool = () => {
  const [mode, setMode] = useState('user');
  const [screen, setScreen] = useState('questionnaire');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);

  const [questions, setQuestions] = useState(initialQuestions);
  const [rules, setRules] = useState(initialRules);
  const [teams, setTeams] = useState(initialTeams);

  const activeQuestions = questions.filter(q => shouldShowQuestion(q, answers));

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };

    const questionsToRemove = questions
      .filter(q => !shouldShowQuestion(q, newAnswers))
      .map(q => q.id);

    questionsToRemove.forEach(qId => {
      delete newAnswers[qId];
    });

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const result = analyzeAnswers(answers, rules);
      setAnalysis(result);
      setScreen('synthesis');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScreen('questionnaire');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Compliance Advisor</h1>
                <p className="text-xs text-gray-500">Outil d'aide à la décision</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setMode('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mode Chef de Projet
              </button>
              <button
                onClick={() => setMode('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back-Office
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mode === 'user' ? (
        screen === 'questionnaire' ? (
          <QuestionnaireScreen
            questions={activeQuestions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
          />
        ) : (
          <SynthesisReport
            answers={answers}
            analysis={analysis}
            teams={teams}
            questions={activeQuestions}
            onRestart={handleRestart}
          />
        )
      ) : (
        <BackOffice
          questions={questions}
          setQuestions={setQuestions}
          rules={rules}
          setRules={setRules}
          teams={teams}
          setTeams={setTeams}
        />
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<ComplianceDecisionTool />);
}
