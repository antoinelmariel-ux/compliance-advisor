import { initialQuestions } from './questions.js';
import { initialRules } from './rules.js';
import { analyzeAnswers } from '../utils/rules.js';

export const DEMO_PROJECT_BADGE = 'Projet de démonstration';
export const DEMO_SHOWCASE_VERSION = '0.1.4';
const DEMO_SHOWCASE_STATUS = 'Données showcase complétées';

const demoProjectAnswers = {
  projectName: 'Campagne Aura',
  projectSlogan: 'Illuminer chaque lancement produit',
  targetAudience: [
    'Grand public / clients finaux',
    'Investisseurs',
    'Partenaires ou prescripteurs'
  ],
  problemPainPoints:
    '• Les équipes perdent 3 semaines à aligner leur message sur plusieurs canaux.\n• Les preuves clients sont dispersées et difficiles à valoriser.\n• Les partenaires ne disposent pas des bons outils pour activer leur réseau.',
  solutionDescription:
    "Nous construisons une narration immersive combinant démonstrations live, contenus interactifs et preuves sociales activables par chaque équipe locale.",
  solutionBenefits:
    '• +35 % d’intention d’achat mesurée lors des tests pré-lancement.\n• Bibliothèque d’assets localisés livrée en 4 semaines.\n• Plan média multi-pays orchestré avec les partenaires retail.',
  solutionComparison:
    'Contrairement aux campagnes précédentes, Aura intègre dès le départ les besoins des partenaires et un plan de preuves dynamique, évitant les validations tardives.',
  innovationProcess:
    '1. Sprint storytelling de 5 jours pour cadrer le pitch.\n2. Production collaborative des assets avec validations hebdomadaires.\n3. Activation omnicanale pilotée par un cockpit partagé.',
  visionStatement:
    'En 2025, chaque lancement majeur du groupe proposera une expérience Aura pour générer engagement, confiance et ventes durables.',
  campaignKickoffDate: '2024-01-15',
  launchDate: '2024-04-15',
  teamLead: 'Clara Dupont — Head of Narrative Design',
  teamCoreMembers:
    'Lina Morel — Product marketing lead\nHugo Martin — Data & Growth strategist\nNoémie Laurent — Partnerships manager',
};

const DEMO_TIMESTAMP = '2024-04-18T09:00:00.000Z';
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const DEMO_OPPORTUNITIES = [
  {
    id: 'opportunity-social-proof',
    title: 'Renforcer la preuve sociale',
    description:
      'Transformer les +35 % d’intention d’achat observés en plan de conversion suivi par Growth & Impact après lancement.'
  },
  {
    id: 'opportunity-retail-partners',
    title: 'Co-activer les partenaires retail',
    description:
      'Déployer la bibliothèque d’assets localisés pour signer des opérations co-brandées en magasin et en ligne.'
  },
  {
    id: 'opportunity-cockpit',
    title: 'Industrialiser le cockpit Aura',
    description:
      'Faire du cockpit partagé un outil récurrent pour coordonner les futurs lancements multi-pays.'
  }
];

const FALLBACK_TIMELINE_PROFILES = [
  {
    id: 'standard_story',
    label: 'Narratif prêt',
    description: 'Temps minimal pour construire la narration et les assets essentiels.',
    requirements: {
      story: { minimumWeeks: 4 },
      product: { minimumWeeks: 4 }
    }
  },
  {
    id: 'public_launch',
    label: 'Diffusion grand public',
    description: 'Prévoir un buffer supplémentaire pour orchestrer la communication externe.',
    requirements: {
      story: { minimumWeeks: 6 },
      press: { minimumWeeks: 6 }
    }
  },
  {
    id: 'investor_roadshow',
    label: 'Roadshow investisseurs',
    description: 'Temps recommandé pour consolider les éléments financiers et partenariaux.',
    requirements: {
      growth: { minimumWeeks: 7 },
      partners: { minimumWeeks: 7 }
    }
  }
];

const enhanceDemoAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== 'object') {
    return analysis;
  }

  const kickoff = new Date(demoProjectAnswers.campaignKickoffDate);
  const launch = new Date(demoProjectAnswers.launchDate);
  const hasValidDates = !Number.isNaN(kickoff.getTime()) && !Number.isNaN(launch.getTime());
  const diffMs = hasValidDates ? launch.getTime() - kickoff.getTime() : null;
  const diffInDays = diffMs !== null && diffMs >= 0 ? diffMs / DAY_IN_MS : null;
  const diffInWeeks = diffInDays !== null ? diffInDays / 7 : null;

  const fallbackDiff = diffInWeeks !== null
    ? {
        startDate: kickoff,
        endDate: launch,
        diffInDays,
        diffInWeeks
      }
    : null;

  const timelineDetails = Array.isArray(analysis.timeline?.details)
    ? analysis.timeline.details.map(detail => ({ ...detail }))
    : [];

  const runwayIndex = timelineDetails.findIndex(detail => detail && detail.ruleId === 'rule_launch_runway');
  const existingRunwayDetail = runwayIndex >= 0 ? timelineDetails[runwayIndex] : null;

  const resolvedProfiles = (() => {
    const source = Array.isArray(existingRunwayDetail?.profiles) && existingRunwayDetail.profiles.length > 0
      ? existingRunwayDetail.profiles
      : FALLBACK_TIMELINE_PROFILES;

    return source.map(profile => ({
      id: typeof profile.id === 'string' && profile.id.trim().length > 0
        ? profile.id
        : `timeline-profile-${profile.label || profile.name || 'fallback'}`,
      label: profile.label || profile.name || 'Profil de timing',
      description: profile.description || '',
      requirements: profile.requirements || {}
    }));
  })();

  const resolvedDiff = (() => {
    if (existingRunwayDetail && existingRunwayDetail.diff && typeof existingRunwayDetail.diff === 'object') {
      return {
        startDate: existingRunwayDetail.diff.startDate || (fallbackDiff ? fallbackDiff.startDate : undefined),
        endDate: existingRunwayDetail.diff.endDate || (fallbackDiff ? fallbackDiff.endDate : undefined),
        diffInDays: typeof existingRunwayDetail.diff.diffInDays === 'number'
          ? existingRunwayDetail.diff.diffInDays
          : (fallbackDiff ? fallbackDiff.diffInDays : undefined),
        diffInWeeks: typeof existingRunwayDetail.diff.diffInWeeks === 'number'
          ? existingRunwayDetail.diff.diffInWeeks
          : (fallbackDiff ? fallbackDiff.diffInWeeks : undefined)
      };
    }

    return fallbackDiff ? { ...fallbackDiff } : null;
  })();

  const resolvedRunwayDetail = {
    ruleId: existingRunwayDetail?.ruleId || 'rule_launch_runway',
    ruleName: existingRunwayDetail?.ruleName || 'Runway avant lancement',
    satisfied: typeof existingRunwayDetail?.satisfied === 'boolean'
      ? existingRunwayDetail.satisfied
      : (diffMs !== null ? diffMs >= 0 : true),
    diff: resolvedDiff,
    profiles: resolvedProfiles
  };

  const normalizedTimelineDetails = runwayIndex >= 0
    ? timelineDetails.map((detail, index) => (index === runwayIndex ? resolvedRunwayDetail : detail))
    : [...timelineDetails, resolvedRunwayDetail];

  const timelineSummary = resolvedRunwayDetail.diff
    ? {
        ruleId: resolvedRunwayDetail.ruleId,
        ruleName: resolvedRunwayDetail.ruleName,
        satisfied: resolvedRunwayDetail.satisfied,
        weeks: Math.round(
          resolvedRunwayDetail.diff.diffInWeeks !== undefined
            ? resolvedRunwayDetail.diff.diffInWeeks
            : diffInWeeks || 0
        ),
        days: Math.round(
          resolvedRunwayDetail.diff.diffInDays !== undefined
            ? resolvedRunwayDetail.diff.diffInDays
            : diffInDays || 0
        ),
        profiles: resolvedRunwayDetail.profiles
      }
    : null;

  const criticalRisk = Array.isArray(analysis.risks)
    ? analysis.risks.find(risk => risk.priority === 'Critique')
    : null;

  const opportunities = Array.isArray(analysis.opportunities) && analysis.opportunities.length > 0
    ? analysis.opportunities
    : DEMO_OPPORTUNITIES;

  const dateFormatter = hasValidDates
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const enrichedTimeline = {
    ...analysis.timeline,
    details: normalizedTimelineDetails,
    summary: timelineSummary,
    status: 'Runway suffisant pour activer les relais.'
  };

  if (hasValidDates && dateFormatter) {
    enrichedTimeline.window = {
      start: demoProjectAnswers.campaignKickoffDate,
      end: demoProjectAnswers.launchDate,
      label: `du ${dateFormatter.format(kickoff)} au ${dateFormatter.format(launch)}`
    };
  }

  return {
    ...analysis,
    summary:
      analysis.summary
      || 'Runway de 13 semaines validé : narration, partenaires et plan média sont alignés. Finaliser le dossier investisseurs reste la priorité critique.',
    opportunities: opportunities
      .map((opportunity, index) => {
        if (!opportunity || typeof opportunity !== 'object') {
          return null;
        }

        const fallback = DEMO_OPPORTUNITIES[index] || {};
        const title = typeof opportunity.title === 'string' && opportunity.title.trim().length > 0
          ? opportunity.title.trim()
          : (typeof fallback.title === 'string' ? fallback.title : '');

        if (!title) {
          return null;
        }

        const description = typeof opportunity.description === 'string' && opportunity.description.trim().length > 0
          ? opportunity.description.trim()
          : (typeof fallback.description === 'string' ? fallback.description : '');

        const id = typeof opportunity.id === 'string' && opportunity.id.trim().length > 0
          ? opportunity.id
          : (typeof fallback.id === 'string' ? fallback.id : `opportunity-${index}`);

        return { id, title, description };
      })
      .filter(Boolean),
    timeline: enrichedTimeline,
    primaryRisk: analysis.primaryRisk || criticalRisk || null
  };
};

export const createDemoProject = ({ questions = initialQuestions, rules = initialRules } = {}) => {
  const rawAnalysis = analyzeAnswers(demoProjectAnswers, rules);
  const analysis = enhanceDemoAnalysis(rawAnalysis);
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
    isDemo: true,
    meta: {
      badge: 'Showcase Aura',
      eyebrow: DEMO_PROJECT_BADGE,
      version: {
        label: demoProjectAnswers.projectName,
        number: DEMO_SHOWCASE_VERSION,
        status: DEMO_SHOWCASE_STATUS
      }
    }
  };
};

export const demoProjectAnswersSnapshot = { ...demoProjectAnswers };
