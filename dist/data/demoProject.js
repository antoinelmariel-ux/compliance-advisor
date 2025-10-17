function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { initialQuestions } from './questions.js';
import { initialRules } from './rules.js';
import { analyzeAnswers } from '../utils/rules.js';
export var DEMO_PROJECT_BADGE = 'Projet de démonstration';
export var DEMO_SHOWCASE_VERSION = '0.1.5';
var DEMO_SHOWCASE_STATUS = 'Données showcase alignées avec l’application';
var demoProjectAnswers = {
  projectName: 'Campagne Aura',
  projectSlogan: 'Une expérience immersive qui transforme le storytelling en engagement mesurable.',
  targetAudience: ['Grand public / clients finaux', 'Investisseurs', 'Partenaires ou prescripteurs'],
  problemPainPoints: '• Trois semaines en moyenne sont nécessaires pour aligner la narration entre le siège et les marchés.\n• Les témoignages, chiffres clés et démos restent fragmentés, limitant leur réutilisation dans les temps forts.\n• Les partenaires retail et médias manquent d’outils prêts à l’emploi pour amplifier le récit.',
  solutionDescription: "Une narration clé en main qui combine vision produit, expérience live et arsenal d’assets activables.",
  solutionBenefits: '• +35 % d’intention d’achat observée lors des tests pré-lancement.\n• Kit d’assets localisés produit en 4 semaines pour les équipes locales.\n• Activation coordonnée sur 91 jours avec les partenaires retail.\n• Satisfaction moyenne de 9,2/10 sur les immersions Aura.',
  solutionComparison: 'Contrairement aux campagnes précédentes, Aura couple un cockpit de preuves dynamique et un suivi d’impact partagé, évitant les validations tardives.',
  campaignKickoffDate: '2024-01-15',
  launchDate: '2024-04-15',
  teamLead: 'Clara Dupont — Head of Narrative Design',
  teamCoreMembers: 'Lina Morel — Product marketing lead\nHugo Martin — Data & Growth strategist\nNoémie Laurent — Partnerships manager'
};
var DEMO_TIMESTAMP = '2024-04-18T09:00:00.000Z';
var DAY_IN_MS = 1000 * 60 * 60 * 24;
var DEMO_OPPORTUNITIES = [{
  id: 'opportunity-social-proof',
  title: 'Renforcer la preuve sociale',
  description: 'Transformer les +35 % d’intention d’achat observés en plan de conversion suivi par Growth & Impact après lancement.'
}, {
  id: 'opportunity-retail-partners',
  title: 'Co-activer les partenaires retail',
  description: 'Déployer la bibliothèque d’assets localisés pour signer des opérations co-brandées en magasin et en ligne.'
}, {
  id: 'opportunity-cockpit',
  title: 'Industrialiser le cockpit Aura',
  description: 'Faire du cockpit partagé un outil récurrent pour coordonner les futurs lancements multi-pays.'
}];
var FALLBACK_TIMELINE_PROFILES = [{
  id: 'standard_story',
  label: 'Narratif prêt',
  description: 'Temps minimal pour construire la narration et les assets essentiels.',
  requirements: {
    story: {
      minimumWeeks: 4
    },
    product: {
      minimumWeeks: 4
    }
  }
}, {
  id: 'public_launch',
  label: 'Diffusion grand public',
  description: 'Prévoir un buffer supplémentaire pour orchestrer la communication externe.',
  requirements: {
    story: {
      minimumWeeks: 6
    },
    press: {
      minimumWeeks: 6
    }
  }
}, {
  id: 'investor_roadshow',
  label: 'Roadshow investisseurs',
  description: 'Temps recommandé pour consolider les éléments financiers et partenariaux.',
  requirements: {
    growth: {
      minimumWeeks: 7
    },
    partners: {
      minimumWeeks: 7
    }
  }
}];
var enhanceDemoAnalysis = analysis => {
  var _analysis$timeline;
  if (!analysis || typeof analysis !== 'object') {
    return analysis;
  }
  var kickoff = new Date(demoProjectAnswers.campaignKickoffDate);
  var launch = new Date(demoProjectAnswers.launchDate);
  var hasValidDates = !Number.isNaN(kickoff.getTime()) && !Number.isNaN(launch.getTime());
  var diffMs = hasValidDates ? launch.getTime() - kickoff.getTime() : null;
  var diffInDays = diffMs !== null && diffMs >= 0 ? diffMs / DAY_IN_MS : null;
  var diffInWeeks = diffInDays !== null ? diffInDays / 7 : null;
  var fallbackDiff = diffInWeeks !== null ? {
    startDate: kickoff,
    endDate: launch,
    diffInDays,
    diffInWeeks
  } : null;
  var timelineDetails = Array.isArray((_analysis$timeline = analysis.timeline) === null || _analysis$timeline === void 0 ? void 0 : _analysis$timeline.details) ? analysis.timeline.details.map(detail => _objectSpread({}, detail)) : [];
  var runwayIndex = timelineDetails.findIndex(detail => detail && detail.ruleId === 'rule_launch_runway');
  var existingRunwayDetail = runwayIndex >= 0 ? timelineDetails[runwayIndex] : null;
  var resolvedProfiles = (() => {
    var source = Array.isArray(existingRunwayDetail === null || existingRunwayDetail === void 0 ? void 0 : existingRunwayDetail.profiles) && existingRunwayDetail.profiles.length > 0 ? existingRunwayDetail.profiles : FALLBACK_TIMELINE_PROFILES;
    return source.map(profile => ({
      id: typeof profile.id === 'string' && profile.id.trim().length > 0 ? profile.id : "timeline-profile-".concat(profile.label || profile.name || 'fallback'),
      label: profile.label || profile.name || 'Profil de timing',
      description: profile.description || '',
      requirements: profile.requirements || {}
    }));
  })();
  var resolvedDiff = (() => {
    if (existingRunwayDetail && existingRunwayDetail.diff && typeof existingRunwayDetail.diff === 'object') {
      return {
        startDate: existingRunwayDetail.diff.startDate || (fallbackDiff ? fallbackDiff.startDate : undefined),
        endDate: existingRunwayDetail.diff.endDate || (fallbackDiff ? fallbackDiff.endDate : undefined),
        diffInDays: typeof existingRunwayDetail.diff.diffInDays === 'number' ? existingRunwayDetail.diff.diffInDays : fallbackDiff ? fallbackDiff.diffInDays : undefined,
        diffInWeeks: typeof existingRunwayDetail.diff.diffInWeeks === 'number' ? existingRunwayDetail.diff.diffInWeeks : fallbackDiff ? fallbackDiff.diffInWeeks : undefined
      };
    }
    return fallbackDiff ? _objectSpread({}, fallbackDiff) : null;
  })();
  var resolvedRunwayDetail = {
    ruleId: (existingRunwayDetail === null || existingRunwayDetail === void 0 ? void 0 : existingRunwayDetail.ruleId) || 'rule_launch_runway',
    ruleName: (existingRunwayDetail === null || existingRunwayDetail === void 0 ? void 0 : existingRunwayDetail.ruleName) || 'Runway avant lancement',
    satisfied: typeof (existingRunwayDetail === null || existingRunwayDetail === void 0 ? void 0 : existingRunwayDetail.satisfied) === 'boolean' ? existingRunwayDetail.satisfied : diffMs !== null ? diffMs >= 0 : true,
    diff: resolvedDiff,
    profiles: resolvedProfiles
  };
  var normalizedTimelineDetails = runwayIndex >= 0 ? timelineDetails.map((detail, index) => index === runwayIndex ? resolvedRunwayDetail : detail) : [...timelineDetails, resolvedRunwayDetail];
  var timelineSummary = resolvedRunwayDetail.diff ? {
    ruleId: resolvedRunwayDetail.ruleId,
    ruleName: resolvedRunwayDetail.ruleName,
    satisfied: resolvedRunwayDetail.satisfied,
    weeks: Math.round(resolvedRunwayDetail.diff.diffInWeeks !== undefined ? resolvedRunwayDetail.diff.diffInWeeks : diffInWeeks || 0),
    days: Math.round(resolvedRunwayDetail.diff.diffInDays !== undefined ? resolvedRunwayDetail.diff.diffInDays : diffInDays || 0),
    profiles: resolvedRunwayDetail.profiles
  } : null;
  var criticalRisk = Array.isArray(analysis.risks) ? analysis.risks.find(risk => risk.priority === 'Critique') : null;
  var opportunities = Array.isArray(analysis.opportunities) && analysis.opportunities.length > 0 ? analysis.opportunities : DEMO_OPPORTUNITIES;
  var dateFormatter = hasValidDates ? new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : null;
  var enrichedTimeline = _objectSpread(_objectSpread({}, analysis.timeline), {}, {
    details: normalizedTimelineDetails,
    summary: timelineSummary,
    status: 'Runway suffisant pour activer les relais.'
  });
  if (hasValidDates && dateFormatter) {
    enrichedTimeline.window = {
      start: demoProjectAnswers.campaignKickoffDate,
      end: demoProjectAnswers.launchDate,
      label: "du ".concat(dateFormatter.format(kickoff), " au ").concat(dateFormatter.format(launch))
    };
  }
  return _objectSpread(_objectSpread({}, analysis), {}, {
    summary: analysis.summary || 'Runway de 13 semaines validé : narration, partenaires et plan média sont alignés. Finaliser le dossier investisseurs reste la priorité critique.',
    opportunities: opportunities.map((opportunity, index) => {
      if (!opportunity || typeof opportunity !== 'object') {
        return null;
      }
      var fallback = DEMO_OPPORTUNITIES[index] || {};
      var title = typeof opportunity.title === 'string' && opportunity.title.trim().length > 0 ? opportunity.title.trim() : typeof fallback.title === 'string' ? fallback.title : '';
      if (!title) {
        return null;
      }
      var description = typeof opportunity.description === 'string' && opportunity.description.trim().length > 0 ? opportunity.description.trim() : typeof fallback.description === 'string' ? fallback.description : '';
      var id = typeof opportunity.id === 'string' && opportunity.id.trim().length > 0 ? opportunity.id : typeof fallback.id === 'string' ? fallback.id : "opportunity-".concat(index);
      return {
        id,
        title,
        description
      };
    }).filter(Boolean),
    timeline: enrichedTimeline,
    primaryRisk: analysis.primaryRisk || criticalRisk || null
  });
};
export var createDemoProject = function createDemoProject() {
  var {
    questions = initialQuestions,
    rules = initialRules
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var rawAnalysis = analyzeAnswers(demoProjectAnswers, rules);
  var analysis = enhanceDemoAnalysis(rawAnalysis);
  var totalQuestions = Array.isArray(questions) ? questions.length : Object.keys(demoProjectAnswers).length;
  var sanitizedTotal = totalQuestions > 0 ? totalQuestions : Object.keys(demoProjectAnswers).length;
  return {
    id: 'demo-project',
    projectName: demoProjectAnswers.projectName,
    answers: _objectSpread({}, demoProjectAnswers),
    analysis,
    status: 'submitted',
    lastUpdated: DEMO_TIMESTAMP,
    submittedAt: DEMO_TIMESTAMP,
    lastQuestionIndex: sanitizedTotal > 0 ? sanitizedTotal - 1 : 0,
    totalQuestions: sanitizedTotal,
    answeredQuestions: sanitizedTotal,
    isDemo: true,
    meta: {
      badge: 'Campagne Aura',
      eyebrow: DEMO_PROJECT_BADGE,
      version: {
        label: demoProjectAnswers.projectName,
        number: DEMO_SHOWCASE_VERSION,
        status: DEMO_SHOWCASE_STATUS
      }
    }
  };
};
export var demoProjectAnswersSnapshot = _objectSpread({}, demoProjectAnswers);