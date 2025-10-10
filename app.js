const { useState, useEffect } = React;

const STORAGE_KEY = 'complianceAdvisorState';

const loadPersistedState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Impossible de charger l\'état sauvegardé :', error);
    return null;
  }
};

const persistState = (state) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Impossible de sauvegarder l\'état :', error);
  }
};

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
    type: 'choice',
    question: 'Quel est le périmètre de votre projet ?',
    options: [
      'Interne uniquement',
      'Externe (patients/public)',
      'Externe (professionnels de santé)',
      'Mixte'
    ],
    required: true,
    conditions: [],
    guidance: {
      objective: 'Identifier l\'exposition du projet pour adapter le parcours compliance.',
      details: 'Selon le public ciblé, différentes règles de communication, de consentement et de sécurité s\'appliquent. Cette information permet d\'activer les bons contrôles dès le départ.',
      tips: [
        'Sélectionnez la réponse correspondant au public final le plus exposé.',
        'Si plusieurs cibles sont prévues, choisissez "Mixte" et précisez les nuances dans vos notes de projet.'
      ]
    }
  },
  {
    id: 'q2',
    type: 'choice',
    question: 'Le projet implique-t-il du digital ?',
    options: [
      'Oui - Application mobile',
      'Oui - Site web',
      'Oui - Plateforme en ligne',
      'Non'
    ],
    required: true,
    conditions: [],
    guidance: {
      objective: 'Confirmer la présence d\'un canal digital nécessitant des validations techniques et réglementaires.',
      details: 'Les supports digitaux déclenchent l\'intervention des équipes IT, Juridique et BPP pour vérifier sécurité, mentions légales et conformité marketing.',
      tips: [
        'Choisissez le support principal si plusieurs dispositifs digitaux sont envisagés.',
        'En cas de doute, optez pour l\'option la plus proche et précisez vos intentions dans le dossier.'
      ]
    }
  },
  {
    id: 'q3',
    type: 'choice',
    question: 'Des données personnelles seront-elles collectées ?',
    options: [
      'Oui - Données de santé',
      'Oui - Données personnelles standard',
      'Non'
    ],
    required: true,
    conditions: [
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    guidance: {
      objective: 'Qualifier la nature des données personnelles manipulées.',
      details: 'Les données de santé impliquent une analyse d\'impact renforcée (DPIA), un hébergement certifié HDS et des clauses contractuelles spécifiques.',
      tips: [
        'Identifiez la catégorie la plus sensible de données que vous collecterez.',
        'Si la collecte est incertaine, retenez l\'hypothèse la plus protectrice pour planifier les validations.'
      ]
    }
  },
  {
    id: 'q4',
    type: 'choice',
    question: 'Le projet implique-t-il des prestataires externes ?',
    options: [
      'Oui',
      'Non',
      'Pas encore décidé'
    ],
    required: true,
    conditions: [],
    guidance: {
      objective: 'Anticiper l\'implication de prestataires externes et les contrôles associés.',
      details: 'Les partenariats imposent une revue juridique des contrats, la vérification des assurances et parfois un audit qualité des fournisseurs.',
      tips: [
        'Sélectionnez "Pas encore décidé" si un appel d\'offres est en cours.',
        'Notez les prestataires pressentis pour faciliter la revue par les équipes concernées.'
      ]
    }
  },
  {
    id: 'q5',
    type: 'date',
    question: 'Quelle est la date de soumission du projet ?',
    options: [],
    required: true,
    conditions: [],
    guidance: {
      objective: 'Caler le point de départ du calendrier compliance.',
      details: 'Cette date sert de référence pour estimer le temps disponible afin de mobiliser les experts et réaliser les validations obligatoires.',
      tips: [
        'Renseignez la date à laquelle le dossier complet sera transmis pour revue.',
        'Mettez à jour cette information si la soumission est décalée.'
      ]
    }
  },
  {
    id: 'q6',
    type: 'date',
    question: 'Quelle est la date de lancement souhaitée ?',
    options: [],
    required: true,
    conditions: [],
    guidance: {
      objective: 'Projeter la fenêtre de lancement afin de vérifier la faisabilité du planning.',
      details: 'Le moteur calcule l\'écart entre soumission et lancement et le compare aux délais minimaux recommandés pour chaque équipe compliance.',
      tips: [
        'Indiquez la première date de mise en service ou de diffusion prévue.',
        'Si le planning n\'est pas figé, fournissez l\'estimation la plus réaliste pour sécuriser les ressources.'
      ]
    }
  }
];

// Fonction pour évaluer si une question doit être affichée
const normalizeAnswerForComparison = (answer) => {
  if (Array.isArray(answer)) {
    return answer;
  }

  if (answer && typeof answer === 'object') {
    if (typeof answer.value !== 'undefined') {
      return answer.value;
    }

    if (typeof answer.name !== 'undefined') {
      return answer.name;
    }
  }

  return answer;
};

const shouldShowQuestion = (question, answers) => {
  if (!question.conditions || question.conditions.length === 0) {
    return true; // Pas de condition = toujours afficher
  }

  // Toutes les conditions doivent être remplies (logique ET)
  return question.conditions.every(condition => {
    const rawAnswer = answers[condition.question];
    if (Array.isArray(rawAnswer) && rawAnswer.length === 0) return false;
    if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') return false;

    const answer = normalizeAnswerForComparison(rawAnswer);

    switch (condition.operator) {
      case 'equals':
        if (Array.isArray(answer)) {
          return answer.includes(condition.value);
        }
        return answer === condition.value;
      case 'not_equals':
        if (Array.isArray(answer)) {
          return !answer.includes(condition.value);
        }
        return answer !== condition.value;
      case 'contains':
        if (Array.isArray(answer)) {
          return answer.includes(condition.value);
        }
        if (typeof answer === 'string') {
          return answer.includes(condition.value);
        }
        return false;
      default:
        return false;
    }
  });
};

const formatAnswer = (question, answer) => {
  if (answer === null || answer === undefined) {
    return '';
  }

  const questionType = (question && question.type) || 'choice';

  if (questionType === 'date') {
    const parsed = new Date(answer);
    if (Number.isNaN(parsed.getTime())) {
      return String(answer);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(parsed);
  }

  if (questionType === 'multi_choice' && Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (questionType === 'file' && answer && typeof answer === 'object') {
    const size = typeof answer.size === 'number' ? ` (${Math.round(answer.size / 1024)} Ko)` : '';
    return `${answer.name || 'Fichier joint'}${size}`;
  }

  return Array.isArray(answer) ? answer.join(', ') : String(answer);
};

const matchesCondition = (condition, answers) => {
  if (!condition || !condition.question) {
    return true;
  }

  const rawAnswer = answers[condition.question];
  if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') {
    return false;
  }

  const answer = normalizeAnswerForComparison(rawAnswer);
  const operator = condition.operator || 'equals';
  const expected = condition.value;

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

const matchesConditionGroup = (conditions, answers) => {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every(condition => matchesCondition(condition, answers));
};

const computeTimingDiff = (condition, answers) => {
  if (!condition.startQuestion || !condition.endQuestion) {
    return null;
  }

  const startAnswer = answers[condition.startQuestion];
  const endAnswer = answers[condition.endQuestion];

  if (!startAnswer || !endAnswer) {
    return null;
  }

  const startDate = new Date(startAnswer);
  const endDate = new Date(endAnswer);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diffInMs = endDate.getTime() - startDate.getTime();
  if (diffInMs < 0) {
    return null;
  }

  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return {
    startDate,
    endDate,
    diffInDays,
    diffInWeeks: diffInDays / 7
  };
};

const normalizeTimingRequirement = (value) => {
  if (value === undefined || value === null || value === '') {
    return {};
  }

  if (typeof value === 'number') {
    return { minimumWeeks: value };
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? {} : { minimumWeeks: parsed };
  }

  if (typeof value === 'object') {
    const result = {};

    if (typeof value.minimumWeeks === 'number') {
      result.minimumWeeks = value.minimumWeeks;
    } else if (typeof value.minimumWeeks === 'string' && value.minimumWeeks.trim() !== '') {
      const parsed = Number(value.minimumWeeks);
      if (!Number.isNaN(parsed)) {
        result.minimumWeeks = parsed;
      }
    }

    if (typeof value.minimumDays === 'number') {
      result.minimumDays = value.minimumDays;
    } else if (typeof value.minimumDays === 'string' && value.minimumDays.trim() !== '') {
      const parsed = Number(value.minimumDays);
      if (!Number.isNaN(parsed)) {
        result.minimumDays = parsed;
      }
    }

    return result;
  }

  return {};
};

const getActiveTimelineProfiles = (condition, answers) => {
  const profiles = Array.isArray(condition.complianceProfiles)
    ? condition.complianceProfiles
    : [];

  if (profiles.length === 0) {
    return [];
  }

  const matching = profiles.filter(profile => matchesConditionGroup(profile.conditions, answers));

  if (matching.length > 0) {
    return matching;
  }

  return profiles.filter(profile => !profile.conditions || profile.conditions.length === 0);
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
  },
  {
    id: 'rule5',
    name: 'Respect du délai de préparation projet',
    conditions: [
      {
        type: 'timing',
        startQuestion: 'q5',
        endQuestion: 'q6',
        complianceProfiles: [
          {
            id: 'standard_preparation',
            label: 'Préparation standard',
            description: 'Délai minimal recommandé pour préparer les contributions compliance.',
            requirements: {
              bpp: 6,
              it: 6,
              legal: 6,
              privacy: 7,
              quality: 8
            }
          },
          {
            id: 'digital_public_launch',
            label: 'Projet digital grand public',
            description: 'Projets digitaux externes nécessitent davantage de coordination.',
            conditions: [
              { question: 'q1', operator: 'equals', value: 'Externe (patients/public)' },
              { question: 'q2', operator: 'not_equals', value: 'Non' }
            ],
            requirements: {
              bpp: 8,
              it: 9,
              legal: 8,
              privacy: 8,
              quality: 10
            }
          },
          {
            id: 'health_data_launch',
            label: 'Projet avec données de santé',
            description: 'Les projets manipulant des données de santé demandent un délai renforcé.',
            conditions: [
              { question: 'q3', operator: 'equals', value: 'Oui - Données de santé' }
            ],
            requirements: {
              it: 9,
              legal: 9,
              privacy: 12,
              quality: 10
            }
          }
        ]
      }
    ],
    teams: ['quality'],
    questions: {
      quality: [
        'Le rétroplanning intègre-t-il toutes les validations compliance ?',
        'Le lancement tient-il compte des actions préalables obligatoires ?'
      ]
    },
    risks: [
      {
        description: 'Lancement prévu sans délai suffisant pour les revues compliance',
        level: 'Moyen',
        mitigation: 'Reprogrammer le lancement ou accélérer les jalons de validation'
      }
    ],
    priority: 'Important'
  }
];

// ============================================
// MOTEUR DE RÈGLES
// ============================================

const evaluateRule = (rule, answers) => {
  const timingContexts = [];

  const triggered = rule.conditions.every(condition => {
    const conditionType = condition.type || 'question';

    if (conditionType === 'timing') {
      const diff = computeTimingDiff(condition, answers);

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

      const activeProfiles = getActiveTimelineProfiles(condition, answers);
      const normalizedProfiles = activeProfiles.map(profile => ({
        id: profile.id || `profile_${Date.now()}`,
        label: profile.label || 'Exigence de timing',
        description: profile.description || '',
        requirements: Object.fromEntries(
          Object.entries(profile.requirements || {}).map(([teamId, value]) => [
            teamId,
            normalizeTimingRequirement(value)
          ])
        )
      }));

      let satisfied = true;

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
    }

    return matchesCondition(condition, answers);
  });

  return { triggered, timingContexts };
};

const analyzeAnswers = (answers, rules) => {
  const evaluations = rules.map(rule => ({ rule, evaluation: evaluateRule(rule, answers) }));

  const teamsSet = new Set();
  const allQuestions = {};
  const allRisks = [];
  const timelineByTeam = {};
  const timingDetails = [];

  evaluations.forEach(({ rule, evaluation }) => {
    if (evaluation.triggered) {
      rule.teams.forEach(teamId => teamsSet.add(teamId));

      Object.entries(rule.questions).forEach(([teamId, questions]) => {
        if (!allQuestions[teamId]) {
          allQuestions[teamId] = [];
        }
        allQuestions[teamId].push(...questions);
      });

      allRisks.push(...rule.risks.map(risk => ({ ...risk, priority: rule.priority })));
    }

    evaluation.timingContexts.forEach(context => {
      if (!context || !context.diff) {
        timingDetails.push({
          ruleId: rule.id,
          ruleName: rule.name,
          satisfied: context?.satisfied ?? false,
          diff: null,
          profiles: []
        });
        return;
      }

      const { diff } = context;
      const contextEntry = {
        ruleId: rule.id,
        ruleName: rule.name,
        satisfied: context.satisfied,
        diff,
        profiles: context.profiles
      };

      timingDetails.push(contextEntry);

      context.profiles.forEach(profile => {
        Object.entries(profile.requirements || {}).forEach(([teamId, requirement]) => {
          if (!teamId) return;

          const normalized = normalizeTimingRequirement(requirement);
          const hasRequirement =
            normalized.minimumWeeks !== undefined || normalized.minimumDays !== undefined;

          if (!hasRequirement) {
            return;
          }

          if (!timelineByTeam[teamId]) {
            timelineByTeam[teamId] = [];
          }

          const meetsWeeks =
            normalized.minimumWeeks === undefined || diff.diffInWeeks >= normalized.minimumWeeks;
          const meetsDays =
            normalized.minimumDays === undefined || diff.diffInDays >= normalized.minimumDays;

          timelineByTeam[teamId].push({
            ruleId: rule.id,
            ruleName: rule.name,
            profileId: profile.id,
            profileLabel: profile.label,
            description: profile.description,
            requiredWeeks: normalized.minimumWeeks,
            requiredDays: normalized.minimumDays,
            actualWeeks: diff.diffInWeeks,
            actualDays: diff.diffInDays,
            satisfied: context.satisfied && meetsWeeks && meetsDays
          });
        });
      });
    });
  });

  const highRiskCount = allRisks.filter(r => r.level === 'Élevé').length;

  return {
    triggeredRules: evaluations.filter(item => item.evaluation.triggered).map(item => item.rule),
    teams: Array.from(teamsSet),
    questions: allQuestions,
    risks: allRisks,
    complexity: highRiskCount > 2 ? 'Élevé' : highRiskCount > 0 ? 'Moyen' : 'Faible',
    timeline: {
      byTeam: timelineByTeam,
      details: timingDetails
    }
  };
};

// ============================================
// COMPOSANTS UI
// ============================================

const QuestionnaireScreen = ({ questions, currentIndex, answers, onAnswer, onNext, onBack, allQuestions }) => {
  const currentQuestion = questions[currentIndex];
  const questionBank = allQuestions || questions;

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const questionType = currentQuestion.type || 'choice';
  const currentAnswer = answers[currentQuestion.id];
  const multiSelection = Array.isArray(currentAnswer) ? currentAnswer : [];
  const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer;
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    setShowGuidance(false);
  }, [currentQuestion.id]);

  const guidance = currentQuestion.guidance || {};
  const guidanceTips = Array.isArray(guidance.tips)
    ? guidance.tips.filter(tip => typeof tip === 'string' && tip.trim() !== '')
    : [];

  const operatorLabels = {
    equals: 'est égal à',
    not_equals: 'est différent de',
    contains: 'contient'
  };

  const conditionSummaries = (currentQuestion.conditions || []).map(condition => {
    const referenceQuestion = questionBank.find(q => q.id === condition.question);
    const label = referenceQuestion?.question || `Question ${condition.question}`;
    const formattedAnswer = formatAnswer(referenceQuestion, answers[condition.question]);

    return {
      label,
      operator: operatorLabels[condition.operator] || condition.operator,
      value: condition.value,
      answer: formattedAnswer
    };
  });

  const hasGuidanceContent = Boolean(
    (typeof guidance.objective === 'string' && guidance.objective.trim() !== '') ||
      (typeof guidance.details === 'string' && guidance.details.trim() !== '') ||
      guidanceTips.length > 0 ||
      conditionSummaries.length > 0
  );

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

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-800">{currentQuestion.question}</h2>
              {hasGuidanceContent && (
                <button
                  onClick={() => setShowGuidance(prev => !prev)}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    showGuidance
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showGuidance ? "Masquer l'aide" : 'Comprendre cette question'}
                </button>
              )}
            </div>

            {hasGuidanceContent && showGuidance && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5 text-indigo-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-indigo-700">Guidage contextuel</h3>
                      {guidance.objective && (
                        <p className="mt-1 text-gray-700">{guidance.objective}</p>
                      )}
                    </div>

                    {guidance.details && (
                      <p className="text-gray-700 leading-relaxed">{guidance.details}</p>
                    )}

                    {conditionSummaries.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Pourquoi cette question apparaît</h4>
                        <ul className="mt-2 space-y-2">
                          {conditionSummaries.map((item, idx) => (
                            <li
                              key={`${item.label}-${idx}`}
                              className="bg-white border border-indigo-100 rounded-xl p-3"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                • {item.label} {item.operator} "{item.value}"
                              </p>
                              {item.answer && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Votre réponse :{' '}
                                  <span className="font-medium text-gray-700">{item.answer}</span>
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guidanceTips.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Conseils pratiques</h4>
                        <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-gray-700">
                          {guidanceTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {questionType === 'date' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Sélectionnez une date
                </span>
              </label>
              <input
                type="date"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez le sélecteur ou le format AAAA-MM-JJ pour garantir une analyse correcte.
              </p>
            </div>
          )}

          {questionType === 'choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => onAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {questionType === 'multi_choice' && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = multiSelection.includes(option);

                const toggleOption = () => {
                  if (isSelected) {
                    onAnswer(
                      currentQuestion.id,
                      multiSelection.filter(item => item !== option)
                    );
                  } else {
                    onAnswer(currentQuestion.id, [...multiSelection, option]);
                  }
                };

                return (
                  <label
                    key={idx}
                    className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={toggleOption}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 font-medium">{option}</span>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  </label>
                );
              })}
            </div>
          )}

          {questionType === 'number' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Renseignez une valeur numérique
              </label>
              <input
                type="number"
                value={currentAnswer ?? ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Vous pouvez saisir un nombre entier ou décimal.
              </p>
            </div>
          )}

          {questionType === 'url' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Indiquez une adresse URL
              </label>
              <input
                type="url"
                value={currentAnswer || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                placeholder="https://exemple.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Incluez le protocole (https://) pour une URL valide.
              </p>
            </div>
          )}

          {questionType === 'file' && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Téléversez un fichier de référence
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    onAnswer(currentQuestion.id, {
                      name: file.name,
                      size: file.size,
                      type: file.type
                    });
                  } else {
                    onAnswer(currentQuestion.id, null);
                  }
                }}
                className="w-full"
              />
              {currentAnswer && (
                <p className="text-xs text-gray-500 mt-2">
                  {(() => {
                    const size = typeof currentAnswer.size === 'number'
                      ? ` (${Math.round(currentAnswer.size / 1024)} Ko)`
                      : '';
                    return `Fichier sélectionné : ${currentAnswer.name}${size}`;
                  })()}
                </p>
              )}
            </div>
          )}

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
                disabled={!hasAnswer}
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

  const timelineByTeam = analysis?.timeline?.byTeam || {};
  const timelineDetails = analysis?.timeline?.details || [];
  const firstTimelineDetail = timelineDetails.find(detail => detail.diff);

  const hasTimelineData =
    Object.keys(timelineByTeam).length > 0 || Boolean(firstTimelineDetail);

  const formatNumber = (value, options = {}) => {
    return Number(value).toLocaleString('fr-FR', options);
  };

  const formatWeeksValue = (weeks) => {
    if (weeks === undefined || weeks === null) {
      return '-';
    }

    const rounded = Math.round(weeks * 10) / 10;
    const hasDecimal = Math.abs(rounded - Math.round(rounded)) > 0.0001;

    return `${formatNumber(rounded, {
      minimumFractionDigits: hasDecimal ? 1 : 0,
      maximumFractionDigits: hasDecimal ? 1 : 0
    })} sem.`;
  };

  const formatDaysValue = (days) => {
    if (days === undefined || days === null) {
      return '-';
    }

    return `${formatNumber(Math.round(days))} j.`;
  };

  const formatRequirementValue = (requirement) => {
    if (requirement.requiredWeeks !== undefined) {
      return `${formatNumber(requirement.requiredWeeks)} sem.`;
    }

    if (requirement.requiredDays !== undefined) {
      return `${formatNumber(requirement.requiredDays)} j.`;
    }

    return '-';
  };

  const computeTeamTimeline = (teamId) => {
    const entries = timelineByTeam[teamId] || [];
    if (entries.length === 0) {
      return null;
    }

    const actualWeeks = entries[0].actualWeeks;
    const actualDays = entries[0].actualDays;
    const meetsAll = entries.every(entry => entry.satisfied);
    const strictestRequirement = entries.reduce((acc, entry) => {
      const requirementWeeks =
        entry.requiredWeeks !== undefined
          ? entry.requiredWeeks
          : entry.requiredDays !== undefined
            ? entry.requiredDays / 7
            : 0;

      return requirementWeeks > acc ? requirementWeeks : acc;
    }, 0);

    return {
      entries,
      actualWeeks,
      actualDays,
      meetsAll,
      strictestRequirement
    };
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
                    <p className="font-semibold text-gray-900">{formatAnswer(q, answers[q.id])}</p>
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

          {hasTimelineData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                Délais compliance recommandés
              </h2>
              {firstTimelineDetail?.diff ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Buffer projet calculé :</span>{' '}
                  {formatWeeksValue(firstTimelineDetail.diff.diffInWeeks)}
                  {' '}({formatDaysValue(firstTimelineDetail.diff.diffInDays)}) entre la soumission et le lancement.
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
                  Les dates projet ne sont pas complètes. Les exigences de délais sont indiquées à titre informatif.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantTeams.map(team => {
                  const timelineInfo = computeTeamTimeline(team.id);

                  if (!timelineInfo) {
                    return (
                      <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            Pas d'exigence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Aucun délai spécifique n'a été configuré pour cette équipe dans le back-office.
                        </p>
                      </div>
                    );
                  }

                  const statusClasses = timelineInfo.meetsAll
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <p className="text-xs text-gray-500">{team.expertise}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses}`}>
                          {timelineInfo.meetsAll ? 'Délai suffisant' : 'Délai insuffisant'}
                        </span>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">Buffer actuel</span>
                          <span>{formatWeeksValue(timelineInfo.actualWeeks)} ({formatDaysValue(timelineInfo.actualDays)})</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">Exigence la plus stricte</span>
                          <span>{formatWeeksValue(timelineInfo.strictestRequirement)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {timelineInfo.entries.map(entry => {
                          const requirementLabel = formatRequirementValue(entry);
                          return (
                            <div
                              key={`${entry.profileId}-${entry.requiredWeeks ?? entry.requiredDays ?? 'req'}`}
                              className={`border rounded-lg p-3 text-sm ${entry.satisfied ? 'border-green-200 bg-green-50 text-green-800' : 'border-orange-200 bg-orange-50 text-orange-800'}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">{entry.profileLabel}</span>
                                <span className="font-mono text-xs">{requirementLabel}</span>
                              </div>
                              {entry.description && (
                                <p className="text-xs opacity-80">{entry.description}</p>
                              )}
                              <div className="mt-2 text-xs font-semibold">
                                {entry.satisfied ? '✅ Délai respecté' : '⚠️ Prévoir un délai supplémentaire'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
  const ensureGuidance = (guidance) => {
    if (!guidance || typeof guidance !== 'object') {
      return { objective: '', details: '', tips: [] };
    }

    return {
      objective: guidance.objective || '',
      details: guidance.details || '',
      tips: Array.isArray(guidance.tips) ? guidance.tips : []
    };
  };

  const [editedQuestion, setEditedQuestion] = useState({
    ...question,
    type: question.type || 'choice',
    options: question.options || [],
    conditions: question.conditions || [],
    guidance: ensureGuidance(question.guidance)
  });
  const [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const questionType = editedQuestion.type || 'choice';
  const typeUsesOptions = questionType === 'choice' || questionType === 'multi_choice';
  const normalizedGuidance = ensureGuidance(editedQuestion.guidance);

  const updateGuidanceField = (field, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      guidance: {
        ...ensureGuidance(prev.guidance),
        [field]: value
      }
    }));
  };

  const addGuidanceTip = () => {
    setEditedQuestion(prev => {
      const current = ensureGuidance(prev.guidance);
      return {
        ...prev,
        guidance: {
          ...current,
          tips: [...current.tips, '']
        }
      };
    });
  };

  const updateGuidanceTip = (index, value) => {
    setEditedQuestion(prev => {
      const current = ensureGuidance(prev.guidance);
      const newTips = [...current.tips];
      newTips[index] = value;
      return {
        ...prev,
        guidance: {
          ...current,
          tips: newTips
        }
      };
    });
  };

  const deleteGuidanceTip = (index) => {
    setEditedQuestion(prev => {
      const current = ensureGuidance(prev.guidance);
      return {
        ...prev,
        guidance: {
          ...current,
          tips: current.tips.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleTypeChange = (newType) => {
    if (newType === 'choice' || newType === 'multi_choice') {
      setEditedQuestion(prev => ({
        ...prev,
        type: newType,
        options:
          prev.options && prev.options.length > 0
            ? prev.options
            : ['Option 1', 'Option 2']
      }));
      return;
    }

    setEditedQuestion(prev => ({
      ...prev,
      type: newType,
      options: []
    }));
  };

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de question</label>
                <select
                  value={questionType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="choice">Liste de choix</option>
                  <option value="date">Date</option>
                  <option value="multi_choice">Choix multiples</option>
                  <option value="number">Valeur numérique</option>
                  <option value="url">Lien URL</option>
                  <option value="file">Fichier</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choisissez le format adapté : liste simple ou multiple, date, valeur numérique, URL ou ajout de fichier.
                </p>
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
            {typeUsesOptions ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {questionType === 'multi_choice' ? '✅ Options de sélection multiple' : '✅ Options de réponse'}
                  </h3>
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
                  {questionType === 'multi_choice' && ' Les répondants pourront sélectionner plusieurs valeurs.'}
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
              </>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-700">
                Ce type de question ne nécessite pas de liste d'options prédéfinies.
              </div>
            )}
          </div>

          {/* Guidage contextuel */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">🧭 Guidage contextuel</h3>
            <p className="text-sm text-gray-600 mb-4">
              Renseignez les informations d'aide affichées au chef de projet pour expliquer la question.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objectif pédagogique</label>
                <input
                  type="text"
                  value={normalizedGuidance.objective}
                  onChange={(e) => updateGuidanceField('objective', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Pourquoi cette question est posée..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message principal</label>
                <textarea
                  value={normalizedGuidance.details}
                  onChange={(e) => updateGuidanceField('details', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Précisez le contexte, les impacts compliance ou les attentes..."
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Conseils pratiques</span>
                <button
                  type="button"
                  onClick={addGuidanceTip}
                  className="flex items-center px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter un conseil
                </button>
              </div>

              {normalizedGuidance.tips.length === 0 ? (
                <p className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                  Ajoutez un ou plusieurs conseils opérationnels pour aider le chef de projet à répondre correctement.
                </p>
              ) : (
                <div className="space-y-2">
                  {normalizedGuidance.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateGuidanceTip(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Conseil pratique..."
                      />
                      <button
                        type="button"
                        onClick={() => deleteGuidanceTip(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                          {(() => {
                            if (!condition.question) {
                              return (
                                <input
                                  type="text"
                                  value={condition.value}
                                  onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                  placeholder="Valeur..."
                                />
                              );
                            }

                            const selectedQuestion = questions.find(q => q.id === condition.question);
                            const selectedType = selectedQuestion?.type || 'choice';
                            const usesOptions = ['choice', 'multi_choice'].includes(selectedType);

                            if (usesOptions) {
                              return (
                                <select
                                  value={condition.value}
                                  onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="">Sélectionner...</option>
                                  {(selectedQuestion?.options || []).map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              );
                            }

                            const inputType = selectedType === 'number' ? 'number' : 'text';
                            const placeholder =
                              selectedType === 'date'
                                ? 'AAAA-MM-JJ'
                                : selectedType === 'url'
                                  ? 'https://...'
                                  : 'Valeur...';

                            return (
                              <input
                                type={inputType}
                                value={condition.value}
                                onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                placeholder={placeholder}
                              />
                            );
                          })()}
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
const BackOffice = ({ questions, setQuestions, rules, setRules, teams, setTeams }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [editingRule, setEditingRule] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      type: 'choice',
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2'],
      required: true,
      conditions: [],
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
                          {(() => {
                            const type = q.type || 'choice';
                            const typeLabels = {
                              choice: 'Liste de choix',
                              date: 'Date',
                              multi_choice: 'Choix multiples',
                              number: 'Valeur numérique',
                              url: 'Lien URL',
                              file: 'Fichier'
                            };
                            const badgeStyles = {
                              choice: 'bg-gray-50 border-gray-200 text-gray-600',
                              date: 'bg-blue-50 border-blue-200 text-blue-700',
                              multi_choice: 'bg-purple-50 border-purple-200 text-purple-700',
                              number: 'bg-green-50 border-green-200 text-green-700',
                              url: 'bg-amber-50 border-amber-200 text-amber-700',
                              file: 'bg-pink-50 border-pink-200 text-pink-700'
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
                                      <span className="font-semibold text-indigo-700">Objectif :</span> {guidance.objective}
                                    </p>
                                  )}
                                  {guidance.details && <p>{guidance.details}</p>}
                                  {tips.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-indigo-700 text-[11px] uppercase tracking-wide">
                                        Conseils partagés
                                      </p>
                                      <ul className="mt-1 space-y-1 list-disc list-inside text-gray-700">
                                        {tips.map((tip, idx) => (
                                          <li key={idx}>{tip}</li>
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
                          {ruleItem.conditions.map((condition, idx) => {
                            const conditionType = condition.type || 'question';

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
                                                    ? `${profile.conditions.length} condition(s)`
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
                                                        {condIdx === 0 ? 'Si ' : 'et '}
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = loadPersistedState();
    if (!savedState) {
      setIsHydrated(true);
      return;
    }

    if (savedState.mode) setMode(savedState.mode);
    if (savedState.screen) setScreen(savedState.screen);
    if (typeof savedState.currentQuestionIndex === 'number' && savedState.currentQuestionIndex >= 0) {
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
    }
    if (savedState.answers && typeof savedState.answers === 'object') setAnswers(savedState.answers);
    if (typeof savedState.analysis !== 'undefined') setAnalysis(savedState.analysis);
    if (Array.isArray(savedState.questions)) setQuestions(savedState.questions);
    if (Array.isArray(savedState.rules)) setRules(savedState.rules);
    if (Array.isArray(savedState.teams)) setTeams(savedState.teams);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    persistState({
      mode,
      screen,
      currentQuestionIndex,
      answers,
      analysis,
      questions,
      rules,
      teams
    });
  }, [mode, screen, currentQuestionIndex, answers, analysis, questions, rules, teams, isHydrated]);

  const activeQuestions = questions.filter(q => shouldShowQuestion(q, answers));

  useEffect(() => {
    if (!isHydrated) return;
    if (activeQuestions.length === 0) return;
    if (currentQuestionIndex >= activeQuestions.length) {
      setCurrentQuestionIndex(activeQuestions.length - 1);
    }
  }, [activeQuestions.length, currentQuestionIndex, isHydrated]);

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
            allQuestions={questions}
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
