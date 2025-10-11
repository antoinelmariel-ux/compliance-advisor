import React, { useEffect, useMemo } from '../react.js';
import {
  Sparkles,
  Target,
  Rocket,
  Users,
  Calendar,
  AlertTriangle,
  Close,
  CheckCircle
} from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';

const pickSpotlightAnswers = (questions, answers, limit = 3) => {
  if (!Array.isArray(questions) || !answers) {
    return [];
  }

  const highlightedIds = new Set([
    'projectName',
    'projectSummary',
    'projectObjective',
    'impacts',
    'strategicGoals',
    'targetAudience'
  ]);

  const spotlight = [];

  questions.forEach(question => {
    if (!question || spotlight.length >= limit) {
      return;
    }

    const hasPriorityId = highlightedIds.has(question.id);
    const answer = answers[question.id];

    const hasAnswer = Array.isArray(answer)
      ? answer.length > 0
      : typeof answer === 'string'
        ? answer.trim().length > 0
        : Boolean(answer);

    if (!hasAnswer) {
      return;
    }

    if (hasPriorityId) {
      spotlight.push({ question, answer });
      return;
    }

    if (spotlight.length < limit) {
      spotlight.push({ question, answer });
    }
  });

  return spotlight.slice(0, limit);
};

const getPrimaryRisk = (analysis) => {
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  if (risks.length === 0) {
    return null;
  }

  const priorityWeight = { Critique: 3, Important: 2, Recommandé: 1 };

  return risks.reduce((acc, risk) => {
    if (!acc) {
      return risk;
    }

    const currentWeight = priorityWeight[risk.priority] || 0;
    const bestWeight = priorityWeight[acc.priority] || 0;

    if (currentWeight > bestWeight) {
      return risk;
    }

    return acc;
  }, null);
};

const extractNextMilestones = (timelineDetails, limit = 3) => {
  if (!Array.isArray(timelineDetails)) {
    return [];
  }

  return timelineDetails
    .filter(detail => Boolean(detail?.diff))
    .slice(0, limit)
    .map(detail => ({
      id: detail.ruleId,
      title: detail.ruleName,
      status: detail.satisfied ? 'À jour' : 'À prioriser',
      diffWeeks: detail.diff?.diffInWeeks,
      diffDays: detail.diff?.diffInDays,
      profiles: detail.profiles || []
    }));
};

const SPOTLIGHT_LABELS = {
  projectSummary: 'Pitch express',
  projectObjective: 'Objectif phare',
  impacts: 'Impact attendu',
  strategicGoals: 'Alignement stratégique',
  targetAudience: 'Cibles clés',
  differentiators: 'Facteur différenciant'
};

const formatSpotlightTitle = (question) => {
  if (!question) {
    return 'Point clé';
  }

  if (SPOTLIGHT_LABELS[question.id]) {
    return SPOTLIGHT_LABELS[question.id];
  }

  const rawLabel = (question.question || '').replace(/\?+$/, '').trim();

  if (!rawLabel) {
    return 'Point clé';
  }

  if (rawLabel.length <= 48) {
    return rawLabel;
  }

  return `${rawLabel.slice(0, 45).trim()}…`;
};

const extractTagline = (answers) => {
  if (!answers) {
    return '';
  }

  const raw = [answers.projectSummary, answers.projectObjective, answers.projectName]
    .find(value => typeof value === 'string' && value.trim().length > 0);

  if (!raw) {
    return '';
  }

  const cleaned = raw.trim().replace(/\s+/g, ' ');
  const sentenceMatch = cleaned.match(/([^.!?]+[.!?])/);

  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }

  return cleaned.length > 140 ? `${cleaned.slice(0, 137)}…` : cleaned;
};

export const ProjectShowcase = ({
  projectName,
  onClose,
  analysis,
  relevantTeams,
  questions,
  answers,
  timelineDetails
}) => {
  const safeProjectName = projectName?.trim().length ? projectName.trim() : 'Votre projet';
  const complexity = analysis?.complexity || 'Modérée';
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const normalizedTeams = Array.isArray(relevantTeams) ? relevantTeams : [];
  const teamCount = normalizedTeams.length;
  const tagline = extractTagline(answers);

  const spotlightAnswers = useMemo(
    () => pickSpotlightAnswers(questions, answers, 3),
    [questions, answers]
  );

  const primaryRisk = useMemo(() => getPrimaryRisk(analysis), [analysis]);
  const upcomingMilestones = useMemo(
    () => extractNextMilestones(timelineDetails, 3),
    [timelineDetails]
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-10 pb-16 sm:items-center sm:pt-0"
      role="dialog"
      aria-modal="true"
      aria-label="Vitrine du projet"
    >
      <button
        type="button"
        className="absolute inset-0 bg-gray-900 bg-opacity-60"
        aria-label="Fermer la vitrine"
        onClick={onClose}
      />
      <div className="relative w-full max-w-6xl px-4 py-10 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-90 shadow-2xl border border-white border-opacity-50">
          <div
            className="absolute -top-40 -right-32 h-72 w-72 rounded-full bg-indigo-200 opacity-60"
            style={{ filter: 'blur(80px)' }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-200 opacity-60"
            style={{ filter: 'blur(80px)' }}
            aria-hidden="true"
          />

          <div className="relative px-6 pt-8 pb-6 sm:px-12 sm:pt-12 sm:pb-10">
            <div className="flex flex-col gap-8 rounded-3xl bg-gradient-to-br from-indigo-600/10 via-white to-blue-100/40 p-8 sm:p-10">
              <div className="flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                    <Sparkles className="mr-2" />
                    Pitch de lancement
                  </p>
                  <h2 className="mt-4 text-4xl sm:text-5xl font-black text-gray-900">
                    {safeProjectName}
                  </h2>
                  {tagline && (
                    <p className="mt-3 text-lg font-medium text-indigo-600">
                      {renderTextWithLinks(tagline)}
                    </p>
                  )}
                  <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-600">
                    Propulsez votre initiative compliance comme un produit phare : clarifiez la vision, mettez en avant la proposition de valeur et embarquez les sponsors en un clin d'œil.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-indigo-500"
                    >
                      Télécharger le one-pager
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full border border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:-translate-y-1 hover:bg-indigo-50"
                    >
                      Organiser la session pitch
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center self-end rounded-full border border-gray-200 bg-white bg-opacity-80 p-3 text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
                  aria-label="Fermer la vitrine du projet"
                >
                  <Close className="text-base" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 text-sm text-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Positionnement</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{complexity}</p>
                  <p className="mt-2 text-sm text-gray-500">Cadrez l'ambition et les exigences de conformité associées.</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 text-sm text-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Squad mobilisée</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{teamCount}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {teamCount > 0
                      ? 'Équipe pluridisciplinaire prête à accélérer la mise en œuvre.'
                      : 'Identifiez vos relais clés pour sécuriser la livraison.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 text-sm text-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Risques monitorés</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{risks.length}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {risks.length > 0
                      ? 'Plan de remédiation priorisé pour sécuriser la trajectoire.'
                      : 'Pas de blocant identifié à ce stade : restez en alerte.'}
                  </p>
                </div>
              </div>
            </div>

            {teamCount > 0 && (
              <div className="mt-8 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">Dream team</span>
                  <Users className="text-lg text-indigo-500" />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Un collectif mobilisé pour transformer l'essai :
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {normalizedTeams.map(team => (
                    <p key={team.id} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="mr-2 text-indigo-500" />
                      {team.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {spotlightAnswers.length > 0 && (
              <section className="mt-12">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Promesse produit</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {spotlightAnswers.map(({ question, answer }) => (
                    <div
                      key={question.id}
                      className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white bg-opacity-90 p-6 shadow-xl"
                    >
                      <div className="flex items-center text-sm font-semibold uppercase tracking-widest text-indigo-500">
                        <Target className="mr-2" />
                        {formatSpotlightTitle(question)}
                      </div>
                      <div className="mt-4 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                        {renderTextWithLinks(formatAnswer(question, answer))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {upcomingMilestones.length > 0 && (
              <section className="mt-12 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-500 p-0.5">
                <div className="h-full w-full rounded-3xl bg-white bg-opacity-90 px-6 py-8 sm:px-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Feuille de route</p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">Les prochaines étapes à rythmer</h3>
                    </div>
                    <Rocket className="text-2xl text-indigo-500" />
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {upcomingMilestones.map(milestone => (
                      <div key={milestone.id} className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5">
                        <p className="text-sm font-semibold text-indigo-500">{milestone.title}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {milestone.diffWeeks !== undefined
                            ? `${Math.round(milestone.diffWeeks)} sem.`
                            : milestone.diffDays !== undefined
                              ? `${Math.round(milestone.diffDays)} j.`
                              : 'Planification'}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{milestone.status}</p>
                        {milestone.profiles.length > 0 && (
                          <ul className="mt-3 space-y-1 text-sm text-gray-600">
                            {milestone.profiles.map(profile => (
                              <li key={profile.id} className="flex items-center">
                                <Calendar className="mr-2 text-xs" />
                                {profile.label}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {primaryRisk && (
              <section className="mt-12 rounded-3xl border border-yellow-200 bg-yellow-50 px-6 py-8 sm:px-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-yellow-600">À sécuriser en priorité</p>
                    <h3 className="mt-2 text-2xl font-bold text-yellow-900">{primaryRisk.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-yellow-800">
                      {primaryRisk.description}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-yellow-200 bg-white bg-opacity-90 px-6 py-4 text-center shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">Priorité</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-900">{primaryRisk.priority}</p>
                  </div>
                </div>
              </section>
            )}

            <div className="mt-14 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-10 text-white sm:px-12 sm:py-12">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">Prêt pour la suite ?</p>
                  <h3 className="mt-2 text-3xl font-bold">Transformez la compliance en levier de performance</h3>
                  <p className="mt-3 max-w-2xl text-sm text-indigo-100">
                    Animez vos comités, diffusez une vision partagée et pilotez la mise en œuvre grâce à cette vitrine.
                    Téléchargez le rapport détaillé ou lancez un atelier collectif dès maintenant.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transform transition hover:-translate-y-1"
                  >
                    Télécharger la plaquette
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:bg-opacity-10"
                  >
                    Programmer un workshop
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

