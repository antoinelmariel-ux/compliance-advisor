import React, { useMemo, useRef, useState } from '../react.js';
import {
  Plus,
  Target,
  Rocket,
  Compass,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  Sparkles,
  AlertTriangle,
  Edit,
  Save,
  Upload,
  Copy
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

const complexityBadges = {
  Faible: 'complexity-badge complexity-badge--faible',
  Modérée: 'complexity-badge complexity-badge--moderee',
  Élevée: 'complexity-badge complexity-badge--elevee'
};

const statusStyles = {
  draft: {
    label: 'Brouillon en cours',
    className: 'status-badge status-badge--draft'
  },
  submitted: {
    label: 'Synthèse finalisée',
    className: 'status-badge status-badge--submitted'
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
  onOpenPresentation,
  onImportProject,
  onOpenSynthesis,
  onDuplicateProject
}) => {
  const [ownerFilter, setOwnerFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const fileInputRef = useRef(null);

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

  const handleImportClick = () => {
    if (typeof onImportProject !== 'function') {
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    if (typeof onImportProject !== 'function') {
      return;
    }

    const file = event?.target?.files?.[0];
    if (file) {
      onImportProject(file);
    }

    if (event?.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen hv-background home-screen">
      <div className="max-w-6xl mx-auto section-stack">
        <header className="home-hero hv-surface" role="banner">
          <div className="space-y-6">
            <span className="home-hero__badge">
              <Target className="w-5 h-5" /> Votre copilote compliance
            </span>
            <h1 className="text-3xl sm:text-4xl leading-tight">
              Anticipez les besoins compliance de vos projets en quelques minutes
            </h1>
            <p className="text-lg hv-text-muted leading-relaxed max-w-2xl">
              Compliance Advisor vous guide pas à pas pour qualifier votre initiative, identifier les interlocuteurs à mobiliser et sécuriser vos délais réglementaires.
            </p>
            <div className="home-hero__actions" role="group" aria-label="Actions principales">
              <button
                type="button"
                onClick={onStartNewProject}
                className="hv-button hv-button-primary home-hero__button flex items-center justify-center px-6 py-3 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un nouveau projet
              </button>
              {hasProjects && (
                <button
                  type="button"
                  onClick={() => onOpenProject(sortedProjects[0]?.id)}
                  className="hv-button hv-button-outline home-hero__button flex items-center justify-center px-6 py-3 text-base"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Reprendre le dernier projet
                </button>
              )}
              {typeof onImportProject === 'function' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="hv-button hv-button-accent home-hero__button flex items-center justify-center px-6 py-3 text-base"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Charger un projet
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="home-hero__detail" role="listitem">
              <p className="home-hero__detail-title">
                <Rocket className="w-5 h-5" /> Démarrez simplement
              </p>
              <p className="mt-2 hv-text-muted leading-relaxed">
                Un questionnaire dynamique pour cadrer votre projet et qualifier les impacts compliance.
              </p>
            </div>
            <div className="home-hero__detail" role="listitem">
              <p className="home-hero__detail-title">
                <Compass className="w-5 h-5" /> Visualisez la feuille de route
              </p>
              <p className="mt-2 hv-text-muted leading-relaxed">
                Une synthèse claire avec le niveau de complexité, les équipes à mobiliser et les délais recommandés.
              </p>
            </div>
            <div className="home-hero__detail" role="listitem">
              <p className="home-hero__detail-title">
                <Users className="w-5 h-5" /> Collaborez efficacement
              </p>
              <p className="mt-2 hv-text-muted leading-relaxed">
                Partagez la synthèse avec les parties prenantes pour sécuriser vos points de passage.
              </p>
            </div>
            <div className="home-hero__detail" role="listitem">
              <p className="home-hero__detail-title">
                <Calendar className="w-5 h-5" /> Gardez une trace
              </p>
              <p className="mt-2 hv-text-muted leading-relaxed">
                Retrouvez à tout moment les projets déjà soumis et mettez-les à jour si nécessaire.
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="projects-heading" className="section-stack">
          <div className="home-section-heading">
            <div>
              <h2 id="projects-heading" className="text-2xl">
                Vos projets enregistrés
              </h2>
              <p className="hv-text-muted text-sm">
                Accédez aux brouillons et aux synthèses finalisées pour les reprendre à tout moment.
              </p>
            </div>
            <span className="home-section-counter">
              <CheckCircle className="w-4 h-4" /> {projects.length} projet{projects.length > 1 ? 's' : ''}
            </span>
          </div>

          {!hasProjects && (
            <div className="home-empty" role="status" aria-live="polite">
              <p className="text-lg font-medium">Aucun projet enregistré pour le moment.</p>
              <p className="mt-2 hv-text-muted">
                Lancez-vous dès maintenant pour préparer votre première synthèse compliance.
              </p>
              <button
                type="button"
                onClick={onStartNewProject}
                className="mt-4 hv-button hv-button-primary inline-flex items-center px-5 py-3 text-base"
              >
                <Plus className="w-4 h-4 mr-2" /> Créer un projet
              </button>
            </div>
          )}

          {hasProjects && (
            <div className="section-stack">
              <div className="home-filters hv-surface" role="region" aria-label="Filtres des projets">
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label htmlFor="owner-filter" className="filter-label">
                        Porteur de projet
                      </label>
                      <select
                        id="owner-filter"
                        className="filter-control"
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
                      <label htmlFor="target-filter" className="filter-label">
                        Cible prioritaire
                      </label>
                      <select
                        id="target-filter"
                        className="filter-control"
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
                      <label htmlFor="name-filter" className="filter-label">
                        Nom du projet
                      </label>
                      <input
                        id="name-filter"
                        type="search"
                        placeholder="Rechercher un projet"
                        className="filter-control"
                        value={nameFilter}
                        onChange={event => setNameFilter(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="hv-button hv-button-ghost px-5 py-2 text-sm"
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
                    const risksCount = project.analysis?.risks?.length ?? 0;
                    const projectStatus = statusStyles[project.status] || statusStyles.submitted;
                    const progress = computeProgress(project);
                    const isDraft = project.status === 'draft';
                    const answers = project.answers || {};
                    const relevantTeams = Array.isArray(project.analysis?.relevantTeams)
                      ? project.analysis.relevantTeams
                      : [];

                    const leadNameSource = [answers.teamLead, project.teamLead].find(value =>
                      typeof value === 'string' && value.trim().length > 0
                    );
                    const leadName = leadNameSource ? leadNameSource.trim() : '';

                    const resolveLeadTeam = () => {
                      const directTeamSource = [
                        answers.teamLeadTeam,
                        answers.projectLeadTeam,
                        answers.ownerTeam,
                        project.teamLeadTeam,
                        project.projectLeadTeam,
                        project.ownerTeam
                      ].find(value => typeof value === 'string' && value.trim().length > 0);

                      if (directTeamSource) {
                        return directTeamSource.trim();
                      }

                      const directTeamId = [
                        answers.teamLeadTeamId,
                        project.teamLeadTeamId,
                        answers.teamLeadDepartment,
                        project.teamLeadDepartment
                      ].find(value => typeof value === 'string' && value.trim().length > 0);

                      if (directTeamId) {
                        const matchingTeam = relevantTeams.find(team => {
                          const identifiers = [team.id, team.teamId, team.slug, team.code];
                          return identifiers.some(identifier => identifier === directTeamId);
                        });

                        if (matchingTeam) {
                          const teamName =
                            typeof matchingTeam.name === 'string' && matchingTeam.name.trim().length > 0
                              ? matchingTeam.name.trim()
                              : typeof matchingTeam.label === 'string' && matchingTeam.label.trim().length > 0
                                ? matchingTeam.label.trim()
                                : null;

                          if (teamName) {
                            return teamName;
                          }
                        }
                      }

                      if (relevantTeams.length === 1) {
                        const fallbackTeam = relevantTeams[0];
                        const fallbackName =
                          typeof fallbackTeam?.name === 'string' && fallbackTeam.name.trim().length > 0
                            ? fallbackTeam.name.trim()
                            : typeof fallbackTeam?.label === 'string' && fallbackTeam.label.trim().length > 0
                              ? fallbackTeam.label.trim()
                              : null;

                        if (fallbackName) {
                          return fallbackName;
                        }
                      }

                      return null;
                    };

                    const leadTeam = resolveLeadTeam();
                    const leadInformation = leadName
                      ? leadTeam
                        ? `${leadName} (${leadTeam})`
                        : leadName
                      : 'Lead non renseigné';

                    const extractTextValue = (value) => {
                      if (typeof value === 'string') {
                        const trimmed = value.trim();
                        return trimmed.length > 0 ? trimmed : null;
                      }

                      if (Array.isArray(value)) {
                        const entries = value
                          .map(item => (typeof item === 'string' ? item.trim() : ''))
                          .filter(item => item.length > 0);

                        return entries.length > 0 ? entries.join(', ') : null;
                      }

                      if (value && typeof value === 'object') {
                        const objectLabel =
                          typeof value.label === 'string' && value.label.trim().length > 0
                            ? value.label.trim()
                            : null;

                        if (objectLabel) {
                          return objectLabel;
                        }

                        const objectName =
                          typeof value.name === 'string' && value.name.trim().length > 0
                            ? value.name.trim()
                            : null;

                        if (objectName) {
                          return objectName;
                        }
                      }

                      return null;
                    };

                    const resolveProjectType = () => {
                      const candidates = [
                        answers.projectType,
                        answers.projectCategory,
                        answers.projectKind,
                        answers.projectFormat,
                        project.projectType,
                        project.projectCategory,
                        project.projectKind,
                        project.projectFormat,
                        project.meta?.projectType,
                        project.meta?.eyebrow,
                        project.meta?.badge,
                        project.analysis?.projectType,
                        project.analysis?.projectCategory,
                        project.analysis?.profile?.label,
                        project.analysis?.profile?.name
                      ];

                      for (const candidate of candidates) {
                        const text = extractTextValue(candidate);
                        if (text) {
                          return text;
                        }
                      }

                      return 'Type non renseigné';
                    };

                    const projectType = resolveProjectType();

                    return (
                      <article
                        key={project.id}
                        className="home-project-card hv-surface"
                        role="listitem"
                        aria-label={`Projet ${project.projectName || 'sans nom'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold flex items-center gap-2 flex-wrap">
                              <span>{project.projectName || 'Projet sans nom'}</span>
                              {project.isDemo && (
                                <span className="tag-soft">
                                  Projet démo
                                </span>
                              )}
                            </h3>
                            <p className="text-sm hv-text-muted mt-1">
                              Dernière mise à jour : {formatDate(project.lastUpdated || project.submittedAt)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={projectStatus.className}>
                              {projectStatus.label}
                            </span>
                            {complexity && (
                              <span className={complexityBadges[complexity] || 'complexity-badge'}>
                                {complexity}
                              </span>
                            )}
                          </div>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                          <div className="flex items-center gap-2 hv-text-muted">
                            <Users className="w-4 h-4" />
                            <span className="font-medium text-sm text-current">{leadInformation}</span>
                          </div>
                          <div className="flex items-center gap-2 hv-text-muted">
                            <Compass className="w-4 h-4" />
                            <span>{projectType}</span>
                          </div>
                          {progress !== null && (
                            <div className="flex items-center gap-2 hv-text-muted">
                              <Save className="w-4 h-4" />
                              <span>{progress}% du questionnaire complété</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 hv-text-muted">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{risksCount} risque{risksCount > 1 ? 's' : ''} identifié{risksCount > 1 ? 's' : ''}</span>
                          </div>
                        </dl>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof onOpenSynthesis === 'function') {
                                onOpenSynthesis(project.id);
                              } else if (typeof onOpenProject === 'function') {
                                onOpenProject(project.id);
                              }
                            }}
                            disabled={
                              !(
                                typeof onOpenSynthesis === 'function'
                                || typeof onOpenProject === 'function'
                              )
                            }
                            className="hv-button hv-button-primary inline-flex items-center px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Eye className="w-4 h-4 mr-2" /> Consulter la synthèse
                          </button>
                          {onOpenPresentation && (
                            <button
                              type="button"
                              onClick={() => onOpenPresentation(project.id)}
                              className="hv-button hv-button-outline inline-flex items-center px-5 py-2 text-sm"
                            >
                              <Sparkles className="w-4 h-4 mr-2" /> Présentation
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (isDraft && typeof onOpenProject === 'function') {
                                onOpenProject(project.id);
                              }

                              if (!isDraft && typeof onDuplicateProject === 'function') {
                                onDuplicateProject(project.id);
                              }
                            }}
                            disabled={
                              (isDraft && typeof onOpenProject !== 'function')
                              || (!isDraft && typeof onDuplicateProject !== 'function')
                            }
                            className={`hv-button inline-flex items-center px-5 py-2 text-sm ${
                              isDraft ? 'hv-button-accent disabled:opacity-50 disabled:cursor-not-allowed' : 'hv-button-outline disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {isDraft ? (
                              <Edit className="w-4 h-4 mr-2" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            {isDraft ? 'Modifier' : 'Dupliquer'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="home-empty" role="status" aria-live="polite">
                  <p className="text-lg font-medium">Aucun projet ne correspond aux filtres sélectionnés.</p>
                  <p className="mt-2 hv-text-muted">
                    Ajustez vos critères ou réinitialisez les filtres pour visualiser à nouveau l'ensemble des projets.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 hv-button hv-button-primary inline-flex items-center px-5 py-2 text-sm"
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
