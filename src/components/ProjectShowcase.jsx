import React, { useEffect, useMemo } from '../react.js';
import {
  Sparkles,
  Target,
  Rocket,
  Compass,
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
      className="fixed inset-0 z-50 flex items-center justify-center"
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  <Sparkles className="mr-2" />
                  Vitrine du projet
                </p>
                <h2 className="mt-4 text-4xl sm:text-5xl font-black text-gray-900">
                  {safeProjectName}
                </h2>
                <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-600">
                  Une vision immersive et engageante de votre initiative compliance. Présentez les éléments clés,
                  mobilisez les équipes et inspirez vos parties prenantes avec une expérience contemporaine.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center self-end rounded-full border border-gray-200 bg-white bg-opacity-80 p-3 text-gray-500 transition hover:border-gray-300 hover:text-gray-900 sm:mt-0"
                aria-label="Fermer la vitrine du projet"
              >
                <Close className="text-base" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 p-0.5">
                <div className="h-full w-full rounded-3xl bg-white bg-opacity-90 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-600">Niveau de maturité</span>
                    <Compass className="text-lg" />
                  </div>
                  <p className="mt-6 text-3xl font-bold text-gray-900">{complexity}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Positionnez le projet et anticipez les exigences de conformité clés.
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white bg-opacity-90 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Équipes impliquées</span>
                  <Users className="text-lg" />
                </div>
                <p className="mt-6 text-3xl font-bold text-gray-900">{teamCount}</p>
                <div className="mt-3 space-y-1">
                  {teamCount > 0 ? (
                    normalizedTeams.map(team => (
                      <p key={team.id} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="mr-2 text-indigo-500" />
                        {team.name}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Constituez une squad dédiée pour accélérer.</p>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Risques identifiés</span>
                  <AlertTriangle className="text-lg" />
                </div>
                <p className="mt-6 text-3xl font-bold text-gray-900">{risks.length}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {risks.length > 0
                    ? 'Priorisez les leviers de remédiation pour sécuriser la mise en conformité.'
                    : 'Aucun risque majeur détecté – restez vigilant sur les prochaines étapes.'}
                </p>
              </div>
            </div>

            {spotlightAnswers.length > 0 && (
              <section className="mt-12">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Essence du projet</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {spotlightAnswers.map(({ question, answer }) => (
                    <div
                      key={question.id}
                      className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white bg-opacity-90 p-6 shadow-xl"
                    >
                      <div className="flex items-center text-sm font-medium text-indigo-500">
                        <Target className="mr-2" />
                        {question.question}
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
                    <p className="text-sm font-semibold uppercase tracking-widest text-yellow-600">Point de vigilance</p>
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

