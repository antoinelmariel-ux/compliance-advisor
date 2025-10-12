import { initialQuestions } from './questions.js';
import { initialRules } from './rules.js';
import { analyzeAnswers } from '../utils/rules.js';

const demoProjectAnswers = {
  projectName: 'Campagne Aura',
  projectSlogan: 'Illuminer chaque lancement produit',
  valueProposition:
    "Aura est une campagne de lancement orchestrée en 6 semaines pour transformer un prototype connecté en expérience incontournable pour le grand public et les investisseurs.",
  targetAudience: [
    'Grand public / clients finaux',
    'Investisseurs',
    'Partenaires ou prescripteurs'
  ],
  problemInsight:
    '68 % des lancements produits B2C échouent faute de narration claire et de preuves sociales tangibles (source : Observatoire Retail 2023).',
  problemPainPoints:
    '• Les équipes perdent 3 semaines à aligner leur message sur plusieurs canaux.\n• Les preuves clients sont dispersées et difficiles à valoriser.\n• Les partenaires ne disposent pas des bons outils pour activer leur réseau.',
  problemTestimonial:
    '« Avant Aura, nous annoncions nos nouveautés sans savoir quoi mettre en avant. Cette fois-ci, nous voulons un récit fédérateur qui embarque toute l’entreprise. » — Claire, Directrice marketing Europe.',
  solutionDescription:
    "Nous construisons une narration immersive combinant démonstrations live, contenus interactifs et preuves sociales activables par chaque équipe locale.",
  solutionBenefits:
    '• +35 % d’intention d’achat mesurée lors des tests pré-lancement.\n• Bibliothèque d’assets localisés livrée en 4 semaines.\n• Plan média multi-pays orchestré avec les partenaires retail.',
  solutionExperience:
    'Prototype interactif Figma + vidéo 3D de 90 secondes réalisée avec le studio interne.',
  solutionComparison:
    'Contrairement aux campagnes précédentes, Aura intègre dès le départ les besoins des partenaires et un plan de preuves dynamique, évitant les validations tardives.',
  innovationSecret:
    "Aura s’appuie sur une matrice narrative pilotée par l’IA qui sélectionne en temps réel les meilleures preuves à mettre en avant selon l’audience et le canal.",
  innovationProcess:
    '1. Sprint storytelling de 5 jours pour cadrer le pitch.\n2. Production collaborative des assets avec validations hebdomadaires.\n3. Activation omnicanale pilotée par un cockpit partagé.',
  marketSize:
    'Marché des objets connectés premium estimé à 2,5 Md€ en 2026 (+18 % CAGR).',
  tractionSignals:
    '• 12 distributeurs engagés pour le reveal.\n• Score NPS bêta-testers : 56.\n• Mention presse dans Tech&Co (janvier 2024).',
  visionStatement:
    'En 2025, chaque lancement majeur du groupe proposera une expérience Aura pour générer engagement, confiance et ventes durables.',
  campaignKickoffDate: '2024-01-15',
  launchDate: '2024-04-15',
  teamLead: 'Clara Dupont — Head of Narrative Design',
  teamCoreMembers:
    'Lina Morel — Product marketing lead\nHugo Martin — Data & Growth strategist\nNoémie Laurent — Partnerships manager',
  teamValues: 'Audace responsable\nTransparence proactive\nGoût du détail'
};

const DEMO_TIMESTAMP = '2024-04-18T09:00:00.000Z';

export const createDemoProject = ({ questions = initialQuestions, rules = initialRules } = {}) => {
  const analysis = analyzeAnswers(demoProjectAnswers, rules);
  const totalQuestions = Array.isArray(questions) ? questions.length : Object.keys(demoProjectAnswers).length;
  const sanitizedTotal = totalQuestions > 0 ? totalQuestions : Object.keys(demoProjectAnswers).length;

  return {
    id: 'demo-project',
    projectName: demoProjectAnswers.projectName,
    answers: { ...demoProjectAnswers },
    analysis,
    status: 'submitted',
    lastUpdated: DEMO_TIMESTAMP,
    submittedAt: DEMO_TIMESTAMP,
    lastQuestionIndex: sanitizedTotal > 0 ? sanitizedTotal - 1 : 0,
    totalQuestions: sanitizedTotal,
    answeredQuestions: sanitizedTotal,
    isDemo: true
  };
};

export const demoProjectAnswersSnapshot = { ...demoProjectAnswers };
