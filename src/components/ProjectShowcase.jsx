import React, { useEffect, useMemo } from '../react.js';
import {
  Sparkles,
  Target,
  Rocket,
  Users,
  Calendar,
  AlertTriangle,
  Close,
  CheckCircle,
  Compass
} from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';

const findQuestionById = (questions, id) => {
  if (!Array.isArray(questions)) {
    return null;
  }

  return questions.find(question => question?.id === id) || null;
};

const getFormattedAnswer = (questions, answers, id) => {
  const question = findQuestionById(questions, id);
  if (!question) {
    return '';
  }

  return formatAnswer(question, answers?.[id]);
};

const getRawAnswer = (answers, id) => {
  if (!answers) {
    return undefined;
  }

  return answers[id];
};

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const parseListAnswer = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(item => hasText(String(item)));
  }

  const normalized = String(value)
    .split(/\r?\n|·|•|;|,/)
    .map(entry => entry.replace(/^[-•\s]+/, '').trim())
    .filter(entry => entry.length > 0);

  return normalized;
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed);
};

const computeRunway = (answers) => {
  const startRaw = answers?.campaignKickoffDate;
  const endRaw = answers?.launchDate;

  if (!startRaw || !endRaw) {
    return null;
  }

  const start = new Date(startRaw);
  const end = new Date(endRaw);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return null;
  }

  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffWeeks = diffDays / 7;

  return {
    start,
    end,
    diffDays,
    diffWeeks,
    startLabel: formatDate(start),
    endLabel: formatDate(end),
    weeksLabel: `${Math.round(diffWeeks)} sem.`,
    daysLabel: `${Math.round(diffDays)} j.`
  };
};

const computeTimelineSummary = (timelineDetails) => {
  if (!Array.isArray(timelineDetails)) {
    return null;
  }

  const detailWithDiff = timelineDetails.find(detail => Boolean(detail?.diff));
  if (!detailWithDiff) {
    return null;
  }

  const diff = detailWithDiff.diff;
  const weeks = Math.round(diff.diffInWeeks);
  const days = Math.round(diff.diffInDays);

  return {
    ruleName: detailWithDiff.ruleName,
    satisfied: detailWithDiff.satisfied,
    weeks,
    days,
    profiles: Array.isArray(detailWithDiff.profiles) ? detailWithDiff.profiles : []
  };
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

const buildHeroHighlights = ({ targetAudience, marketSize, runway, tractionSignalsCount }) => {
  const highlights = [];

  if (hasText(targetAudience)) {
    highlights.push({
      id: 'audience',
      label: 'Audience principale',
      value: targetAudience,
      caption: 'Les personas qui verront la promesse en premier.'
    });
  }

  if (hasText(marketSize)) {
    highlights.push({
      id: 'market',
      label: 'Potentiel de marché',
      value: marketSize,
      caption: 'La taille ou la dynamique qui crédibilise l\'opportunité.'
    });
  }

  if (runway) {
    highlights.push({
      id: 'runway',
      label: 'Runway avant lancement',
      value: `${runway.weeksLabel} (${runway.daysLabel})`,
      caption: `Du ${runway.startLabel} au ${runway.endLabel}.`
    });
  } else if (tractionSignalsCount > 0) {
    highlights.push({
      id: 'traction',
      label: 'Signaux de traction',
      value: `${tractionSignalsCount} preuve${tractionSignalsCount > 1 ? 's' : ''}`,
      caption: 'Retours ou chiffres prêts à être mis en lumière.'
    });
  }

  return highlights;
};

const renderList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-600">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <CheckCircle className="mt-0.5 text-xs text-indigo-500" />
          <span>{renderTextWithLinks(item)}</span>
        </li>
      ))}
    </ul>
  );
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
  const safeProjectName = hasText(projectName) ? projectName.trim() : 'Votre projet';
  const normalizedTeams = Array.isArray(relevantTeams) ? relevantTeams : [];
  const complexity = analysis?.complexity || 'Modérée';

  const slogan = getFormattedAnswer(questions, answers, 'projectSlogan');
  const valueProposition = getFormattedAnswer(questions, answers, 'valueProposition');
  const targetAudience = getFormattedAnswer(questions, answers, 'targetAudience');
  const marketSize = getFormattedAnswer(questions, answers, 'marketSize');

  const problemInsight = getFormattedAnswer(questions, answers, 'problemInsight');
  const problemPainPoints = parseListAnswer(getRawAnswer(answers, 'problemPainPoints'));
  const problemTestimonial = getFormattedAnswer(questions, answers, 'problemTestimonial');

  const solutionDescription = getFormattedAnswer(questions, answers, 'solutionDescription');
  const solutionBenefits = parseListAnswer(getRawAnswer(answers, 'solutionBenefits'));
  const solutionExperience = getFormattedAnswer(questions, answers, 'solutionExperience');
  const solutionComparison = getFormattedAnswer(questions, answers, 'solutionComparison');

  const innovationSecret = getFormattedAnswer(questions, answers, 'innovationSecret');
  const innovationProcess = getFormattedAnswer(questions, answers, 'innovationProcess');

  const tractionSignals = parseListAnswer(getRawAnswer(answers, 'tractionSignals'));
  const visionStatement = getFormattedAnswer(questions, answers, 'visionStatement');

  const teamLead = getFormattedAnswer(questions, answers, 'teamLead');
  const teamCoreMembers = parseListAnswer(getRawAnswer(answers, 'teamCoreMembers'));
  const teamValues = parseListAnswer(getRawAnswer(answers, 'teamValues'));

  const runway = useMemo(() => computeRunway(answers), [answers]);
  const timelineSummary = useMemo(() => computeTimelineSummary(timelineDetails), [timelineDetails]);
  const primaryRisk = useMemo(() => getPrimaryRisk(analysis), [analysis]);

  const heroHighlights = useMemo(
    () =>
      buildHeroHighlights({
        targetAudience,
        marketSize,
        runway,
        tractionSignalsCount: tractionSignals.length
      }),
    [targetAudience, marketSize, runway, tractionSignals.length]
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/70 pt-10 pb-16 sm:items-center sm:pt-0"
      role="dialog"
      aria-modal="true"
      aria-label="Vitrine marketing du projet"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Fermer la vitrine"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl px-4 py-10 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
          <div
            className="absolute -top-40 -right-24 h-72 w-72 rounded-full bg-indigo-200/70"
            style={{ filter: 'blur(90px)' }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-200/70"
            style={{ filter: 'blur(80px)' }}
            aria-hidden="true"
          />

          <div className="relative px-6 pt-8 pb-12 sm:px-12 sm:pt-12 sm:pb-16">
            <header className="rounded-3xl bg-gradient-to-br from-indigo-600/10 via-white to-blue-100/50 p-8 sm:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                    <Sparkles className="mr-2" />
                    One-page marketing
                  </p>
                  <h2 className="mt-4 text-4xl font-black text-gray-900 sm:text-5xl">{safeProjectName}</h2>
                  {hasText(slogan) && (
                    <p className="mt-3 text-xl font-semibold text-indigo-600">
                      {renderTextWithLinks(slogan)}
                    </p>
                  )}
                  {hasText(valueProposition) && (
                    <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                      {renderTextWithLinks(valueProposition)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 p-3 text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
                  aria-label="Fermer la vitrine du projet"
                >
                  <Close className="text-base" />
                </button>
              </div>

              {heroHighlights.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {heroHighlights.map(highlight => (
                    <div
                      key={highlight.id}
                      className="rounded-2xl border border-indigo-100 bg-white/90 p-5 text-sm text-gray-600 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">{highlight.label}</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{highlight.value}</p>
                      <p className="mt-2 text-xs text-gray-500">{highlight.caption}</p>
                    </div>
                  ))}
                </div>
              )}
            </header>

            <section className="mt-12 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Le problème</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">Pourquoi ce projet doit exister</h3>
                  {hasText(problemInsight) && (
                    <p className="mt-4 text-base font-semibold text-indigo-600">
                      {renderTextWithLinks(problemInsight)}
                    </p>
                  )}
                  {renderList(problemPainPoints)}
                </div>
                {hasText(problemTestimonial) && (
                  <aside className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-sm leading-relaxed text-indigo-800">
                    <Target className="mb-3 text-xl text-indigo-500" />
                    <p>{renderTextWithLinks(problemTestimonial)}</p>
                  </aside>
                )}
              </div>
            </section>

            <section className="mt-12 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-0.5">
              <div className="h-full w-full rounded-[22px] bg-white/95 px-8 py-10 sm:px-12">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">La solution</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">Comment nous changeons la donne</h3>
                  </div>
                  <Rocket className="text-3xl text-indigo-500" />
                </div>
                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {hasText(solutionDescription) && (
                    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6">
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Expérience proposée</p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {renderTextWithLinks(solutionDescription)}
                      </p>
                    </div>
                  )}
                  {solutionBenefits.length > 0 && (
                    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6">
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Bénéfices clés</p>
                      {renderList(solutionBenefits)}
                    </div>
                  )}
                  {hasText(solutionExperience) && (
                    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6">
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Preuve immersive</p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {renderTextWithLinks(solutionExperience)}
                      </p>
                    </div>
                  )}
                  {hasText(solutionComparison) && (
                    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6">
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Pourquoi c'est différent</p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {renderTextWithLinks(solutionComparison)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-8 sm:p-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Innovation</p>
                  <h3 className="mt-2 text-2xl font-bold text-indigo-900">Ce qui rend l'approche unique</h3>
                  {hasText(innovationSecret) && (
                    <p className="mt-4 text-sm leading-relaxed text-indigo-800">
                      {renderTextWithLinks(innovationSecret)}
                    </p>
                  )}
                </div>
                {hasText(innovationProcess) && (
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm leading-relaxed text-gray-600">
                    <Compass className="mb-3 text-xl text-indigo-500" />
                    {renderTextWithLinks(innovationProcess)}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl sm:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Potentiel & impact</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">Les preuves qui donnent envie d'y croire</h3>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {hasText(marketSize) && (
                      <div className="rounded-2xl border border-gray-200 bg-white/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Taille d'opportunité</p>
                        <p className="mt-2 text-xl font-bold text-gray-900">{marketSize}</p>
                        <p className="mt-2 text-xs text-gray-500">Projection marché ou segment prioritaire.</p>
                      </div>
                    )}
                    {timelineSummary && (
                      <div className="rounded-2xl border border-gray-200 bg-white/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Préparation au lancement</p>
                        <p className="mt-2 text-xl font-bold text-gray-900">{`${timelineSummary.weeks} sem.`}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          {timelineSummary.satisfied ? 'Runway suffisant pour activer les relais.' : 'Runway à renforcer pour sécuriser la diffusion.'}
                        </p>
                      </div>
                    )}
                    <div className="rounded-2xl border border-gray-200 bg-white/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Complexité estimée</p>
                      <p className="mt-2 text-xl font-bold text-gray-900">{complexity}</p>
                      <p className="mt-2 text-xs text-gray-500">Basée sur les points de vigilance identifiés.</p>
                    </div>
                  </div>
                  {tractionSignals.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
                      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">Signaux de traction</p>
                      {renderList(tractionSignals)}
                    </div>
                  )}
                  {hasText(visionStatement) && (
                    <p className="mt-6 text-base italic text-gray-600">
                      “{renderTextWithLinks(visionStatement)}”
                    </p>
                  )}
                </div>
                {primaryRisk && (
                  <aside className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-sm leading-relaxed text-yellow-900">
                    <AlertTriangle className="mb-3 text-xl text-yellow-500" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">Point de vigilance</p>
                    <h4 className="mt-2 text-lg font-semibold text-yellow-900">{primaryRisk.title || 'Vigilance prioritaire'}</h4>
                    <p className="mt-3 text-yellow-800">{renderTextWithLinks(primaryRisk.description)}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-yellow-600">Priorité : {primaryRisk.priority}</p>
                  </aside>
                )}
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl sm:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">L'équipe</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">Les talents derrière la vision</h3>
                  <div className="mt-6 space-y-4 text-sm text-gray-600">
                    {hasText(teamLead) && (
                      <p>
                        <strong className="text-gray-900">Lead du projet :</strong>{' '}
                        {renderTextWithLinks(teamLead)}
                      </p>
                    )}
                    {teamCoreMembers.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Collectif moteur</p>
                        {renderList(teamCoreMembers)}
                      </div>
                    )}
                    {teamValues.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Nos valeurs de collaboration</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {teamValues.map((value, index) => (
                            <span
                              key={`${value}-${index}`}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {normalizedTeams.length > 0 && (
                  <aside className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-sm text-indigo-900">
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Alliés activés</p>
                    <div className="mt-4 space-y-3">
                      {normalizedTeams.map(team => (
                        <div key={team.id} className="flex items-start gap-2">
                          <Users className="mt-0.5 text-base text-indigo-500" />
                          <div>
                            <p className="text-sm font-semibold text-indigo-900">{team.name}</p>
                            <p className="text-xs text-indigo-700">{team.expertise}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </aside>
                )}
              </div>
            </section>

            {(runway || timelineSummary) && (
              <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-8 sm:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Prochaines étapes</p>
                    <h3 className="mt-2 text-2xl font-bold text-indigo-900">Orchestrer la narration jusqu'au lancement</h3>
                    {runway && (
                      <p className="mt-3 text-sm text-indigo-800">
                        Runway prévu de <strong>{runway.weeksLabel}</strong> ({runway.daysLabel}) entre le {runway.startLabel} et le {runway.endLabel}.
                      </p>
                    )}
                  </div>
                  <Calendar className="text-3xl text-indigo-500" />
                </div>
                {timelineSummary?.profiles?.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {timelineSummary.profiles.map(profile => (
                      <div key={profile.id} className="rounded-2xl border border-white/60 bg-white/80 p-5">
                        <p className="text-sm font-semibold text-gray-900">{profile.label}</p>
                        {profile.description && (
                          <p className="mt-2 text-xs text-gray-600">{profile.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

