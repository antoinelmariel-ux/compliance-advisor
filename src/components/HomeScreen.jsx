import React, { useMemo, useState } from '../react.js';
import {
  Plus,
  Target,
  Rocket,
  Compass,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  Sparkles,
  AlertTriangle,
  Edit,
  Save
} from './icons.js';

const formatDate = (isoDate) => {
  if (!isoDate) {
    return 'Date inconnue';
  }

  try {
    return new Date(isoDate).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Date inconnue';
  }
};

const complexityColors = {
  Faible: 'text-green-600',
  Modérée: 'text-yellow-600',
  Élevée: 'text-red-600'
};

const statusStyles = {
  draft: {
    label: 'Brouillon en cours',
    className: 'bg-amber-50 border-amber-200 text-amber-600'
  },
  submitted: {
    label: 'Synthèse finalisée',
    className: 'bg-emerald-50 border-emerald-200 text-emerald-600'
  }
};

const computeProgress = (project) => {
  if (!project || typeof project.totalQuestions !== 'number' || project.totalQuestions <= 0) {
    return null;
  }

  const answeredCountRaw =
    typeof project.answeredQuestions === 'number'
      ? project.answeredQuestions
      : Math.max((project.lastQuestionIndex ?? 0) + 1, 0);

  const answeredCount = Math.min(answeredCountRaw, project.totalQuestions);

  return Math.round((answeredCount / project.totalQuestions) * 100);
};

export const HomeScreen = ({
  projects = [],
  onStartNewProject,
  onOpenProject,
  onDeleteProject,
  onOpenPresentation
}) => {
  const [ownerFilter, setOwnerFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const hasProjects = projects.length > 0;

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [projects]);

  const filterOptions = useMemo(() => {
    const ownersSet = new Set();
    const targetsSet = new Set();

    projects.forEach(project => {
      const answers = project.answers || {};
      const owner = answers.teamLead || project.teamLead;
      if (typeof owner === 'string' && owner.trim().length > 0) {
        ownersSet.add(owner.trim());
      }

      const rawTargets = answers.targetAudience || project.targetAudience;
      const targetsArray = Array.isArray(rawTargets)
        ? rawTargets
        : typeof rawTargets === 'string' && rawTargets.trim().length > 0
          ? [rawTargets]
          : [];

      targetsArray.forEach(target => {
        if (typeof target === 'string' && target.trim().length > 0) {
          targetsSet.add(target.trim());
        }
      });
    });

    return {
      owners: Array.from(ownersSet).sort((a, b) => a.localeCompare(b, 'fr')), 
      targets: Array.from(targetsSet).sort((a, b) => a.localeCompare(b, 'fr'))
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const nameFilterValue = nameFilter.trim().toLowerCase();

    return sortedProjects.filter(project => {
      const answers = project.answers || {};

      const projectName = (project.projectName || answers.projectName || '').toLowerCase();
      const owner = (answers.teamLead || project.teamLead || '').trim();
      const ownerMatches = ownerFilter ? owner === ownerFilter : true;

      const rawTargets = answers.targetAudience || project.targetAudience;
      const targetsArray = Array.isArray(rawTargets)
        ? rawTargets
        : typeof rawTargets === 'string' && rawTargets.trim().length > 0
          ? [rawTargets]
          : [];

      const targetMatches = targetFilter
        ? targetsArray.some(target => typeof target === 'string' && target.trim() === targetFilter)
        : true;

      const nameMatches = nameFilterValue.length > 0
        ? projectName.includes(nameFilterValue)
        : true;

      return ownerMatches && targetMatches && nameMatches;
    });
  }, [sortedProjects, ownerFilter, targetFilter, nameFilter]);

  const hasFilteredProjects = filteredProjects.length > 0;

  const resetFilters = () => {
    setOwnerFilter('');
    setTargetFilter('');
    setNameFilter('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8 sm:px-8 hv-background">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="bg-white border border-indigo-100 rounded-3xl shadow-xl p-6 sm:p-10 hv-surface" role="banner">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full border border-indigo-200">
                <Target className="w-4 h-4 mr-2" /> Votre copilote compliance
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Anticipez les besoins compliance de vos projets en quelques minutes
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                Compliance Advisor vous guide pas à pas pour qualifier votre initiative, identifier les interlocuteurs à mobiliser et sécuriser vos délais réglementaires.
              </p>
              <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="Actions principales">
                <button
                  type="button"
                  onClick={onStartNewProject}
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hv-button hv-button-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un nouveau projet
                </button>
                {hasProjects && (
                  <button
                    type="button"
                    onClick={() => onOpenProject(sortedProjects[0]?.id)}
                    className="inline-flex items-center justify-center px-5 py-3 text-base font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-all hv-button hv-focus-ring"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Reprendre le dernier projet
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-gray-600">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 hv-surface" role="listitem">
                <p className="font-semibold text-gray-800 flex items-center">
                  <Rocket className="w-5 h-5 mr-2" /> Démarrez simplement
                </p>
                <p className="mt-2 leading-relaxed">
                  Un questionnaire dynamique pour cadrer votre projet et qualifier les impacts compliance.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 hv-surface" role="listitem">
                <p className="font-semibold text-gray-800 flex items-center">
                  <Compass className="w-5 h-5 mr-2" /> Visualisez la feuille de route
                </p>
                <p className="mt-2 leading-relaxed">
                  Une synthèse claire avec le niveau de complexité, les équipes à mobiliser et les délais recommandés.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 hv-surface" role="listitem">
                <p className="font-semibold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2" /> Collaborez efficacement
                </p>
                <p className="mt-2 leading-relaxed">
                  Partagez la synthèse avec les parties prenantes pour sécuriser vos points de passage.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 hv-surface" role="listitem">
                <p className="font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" /> Gardez une trace
                </p>
                <p className="mt-2 leading-relaxed">
                  Retrouvez à tout moment les projets déjà soumis et mettez-les à jour si nécessaire.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="projects-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="projects-heading" className="text-2xl font-bold text-gray-900">
                Vos projets enregistrés
              </h2>
              <p className="text-sm text-gray-600">
                Accédez aux brouillons et aux synthèses finalisées pour les reprendre à tout moment.
              </p>
            </div>
            <span className="inline-flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" /> {projects.length} projet{projects.length > 1 ? 's' : ''}
            </span>
          </div>

          {!hasProjects && (
            <div className="bg-white border border-dashed border-indigo-200 rounded-3xl p-8 text-center text-gray-600 hv-surface" role="status" aria-live="polite">
              <p className="text-lg font-medium text-gray-800">Aucun projet enregistré pour le moment.</p>
              <p className="mt-2">Lancez-vous dès maintenant pour préparer votre première synthèse compliance.</p>
              <button
                type="button"
                onClick={onStartNewProject}
                className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-all hv-button hv-button-primary"
              >
                <Plus className="w-4 h-4 mr-2" /> Créer un projet
              </button>
            </div>
          )}

          {hasProjects && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hv-surface" role="region" aria-label="Filtres des projets">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label htmlFor="owner-filter" className="text-sm font-semibold text-gray-700">
                        Porteur de projet
                      </label>
                      <select
                        id="owner-filter"
                        className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={ownerFilter}
                        onChange={event => setOwnerFilter(event.target.value)}
                      >
                        <option value="">Tous les porteurs</option>
                        {filterOptions.owners.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="target-filter" className="text-sm font-semibold text-gray-700">
                        Cible prioritaire
                      </label>
                      <select
                        id="target-filter"
                        className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={targetFilter}
                        onChange={event => setTargetFilter(event.target.value)}
                      >
                        <option value="">Toutes les cibles</option>
                        {filterOptions.targets.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="name-filter" className="text-sm font-semibold text-gray-700">
                        Nom du projet
                      </label>
                      <input
                        id="name-filter"
                        type="search"
                        placeholder="Rechercher un projet"
                        className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={nameFilter}
                        onChange={event => setNameFilter(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                      disabled={!ownerFilter && !targetFilter && nameFilter.trim().length === 0}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              </div>

              {hasFilteredProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                  {filteredProjects.map(project => {
                    const complexity = project.analysis?.complexity;
                    const teamsCount = project.analysis?.relevantTeams?.length ?? 0;
                    const risksCount = project.analysis?.risks?.length ?? 0;
                    const projectStatus = statusStyles[project.status] || statusStyles.submitted;
                    const progress = computeProgress(project);
                    const isDraft = project.status === 'draft';

                    return (
                      <article
                        key={project.id}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hv-surface"
                        role="listitem"
                        aria-label={`Projet ${project.projectName || 'sans nom'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                              <span>{project.projectName || 'Projet sans nom'}</span>
                              {project.isDemo && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full">
                                  Projet démo
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Dernière mise à jour : {formatDate(project.lastUpdated || project.submittedAt)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border hv-badge ${projectStatus.className}`.trim()}
                            >
                              {projectStatus.label}
                            </span>
                            {complexity && (
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border hv-badge ${complexityColors[complexity] || 'text-indigo-600'}`}>
                                {complexity}
                              </span>
                            )}
                          </div>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium text-gray-700">{Object.keys(project.answers || {}).length} réponse{Object.keys(project.answers || {}).length > 1 ? 's' : ''}</span>
                          </div>
                          {progress !== null && (
                            <div className="flex items-center gap-2">
                              <Save className="w-4 h-4" />
                              <span>{progress}% du questionnaire complété</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{teamsCount} équipe{teamsCount > 1 ? 's' : ''} recommandée{teamsCount > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{risksCount} risque{risksCount > 1 ? 's' : ''} identifié{risksCount > 1 ? 's' : ''}</span>
                          </div>
                        </dl>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => onOpenProject(project.id)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold transition-all hv-button ${
                              isDraft
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hv-button-primary'
                            }`}
                          >
                            {isDraft ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {isDraft ? 'Continuer le questionnaire' : 'Consulter la synthèse'}
                          </button>
                          {onOpenPresentation && (
                            <button
                              type="button"
                              onClick={() => onOpenPresentation(project.id)}
                              className="inline-flex items-center px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all hv-button hv-focus-ring"
                            >
                              <Sparkles className="w-4 h-4 mr-2" /> Présentation
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-indigo-200 rounded-3xl p-8 text-center text-gray-600 hv-surface" role="status" aria-live="polite">
                  <p className="text-lg font-medium text-gray-800">Aucun projet ne correspond aux filtres sélectionnés.</p>
                  <p className="mt-2">Ajustez vos critères ou réinitialisez les filtres pour visualiser à nouveau l'ensemble des projets.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-all hv-button hv-button-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
