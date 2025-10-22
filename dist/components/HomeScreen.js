import React, { useMemo, useRef, useState } from '../react.js';
import { Plus, Target, Rocket, Compass, Users, Calendar, CheckCircle, Eye, Sparkles, AlertTriangle, Edit, Save, Upload, Copy } from './icons.js';
var formatDate = isoDate => {
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
var complexityBadges = {
  Faible: 'complexity-badge complexity-badge--faible',
  Modérée: 'complexity-badge complexity-badge--moderee',
  Élevée: 'complexity-badge complexity-badge--elevee'
};
var statusStyles = {
  draft: {
    label: 'Brouillon en cours',
    className: 'status-badge status-badge--draft'
  },
  submitted: {
    label: 'Synthèse finalisée',
    className: 'status-badge status-badge--submitted'
  }
};
var computeProgress = project => {
  var _project$lastQuestion;
  if (!project || typeof project.totalQuestions !== 'number' || project.totalQuestions <= 0) {
    return null;
  }
  var answeredCountRaw = typeof project.answeredQuestions === 'number' ? project.answeredQuestions : Math.max(((_project$lastQuestion = project.lastQuestionIndex) !== null && _project$lastQuestion !== void 0 ? _project$lastQuestion : 0) + 1, 0);
  var answeredCount = Math.min(answeredCountRaw, project.totalQuestions);
  return Math.round(answeredCount / project.totalQuestions * 100);
};
export var HomeScreen = _ref => {
  var {
    projects = [],
    onStartNewProject,
    onOpenProject,
    onDeleteProject,
    onOpenPresentation,
    onImportProject,
    onOpenSynthesis,
    onDuplicateProject
  } = _ref;
  var [ownerFilter, setOwnerFilter] = useState('');
  var [targetFilter, setTargetFilter] = useState('');
  var [nameFilter, setNameFilter] = useState('');
  var fileInputRef = useRef(null);
  var hasProjects = projects.length > 0;
  var sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      var dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      var dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [projects]);
  var filterOptions = useMemo(() => {
    var ownersSet = new Set();
    var targetsSet = new Set();
    projects.forEach(project => {
      var answers = project.answers || {};
      var owner = answers.teamLead || project.teamLead;
      if (typeof owner === 'string' && owner.trim().length > 0) {
        ownersSet.add(owner.trim());
      }
      var rawTargets = answers.targetAudience || project.targetAudience;
      var targetsArray = Array.isArray(rawTargets) ? rawTargets : typeof rawTargets === 'string' && rawTargets.trim().length > 0 ? [rawTargets] : [];
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
  var filteredProjects = useMemo(() => {
    var nameFilterValue = nameFilter.trim().toLowerCase();
    return sortedProjects.filter(project => {
      var answers = project.answers || {};
      var projectName = (project.projectName || answers.projectName || '').toLowerCase();
      var owner = (answers.teamLead || project.teamLead || '').trim();
      var ownerMatches = ownerFilter ? owner === ownerFilter : true;
      var rawTargets = answers.targetAudience || project.targetAudience;
      var targetsArray = Array.isArray(rawTargets) ? rawTargets : typeof rawTargets === 'string' && rawTargets.trim().length > 0 ? [rawTargets] : [];
      var targetMatches = targetFilter ? targetsArray.some(target => typeof target === 'string' && target.trim() === targetFilter) : true;
      var nameMatches = nameFilterValue.length > 0 ? projectName.includes(nameFilterValue) : true;
      return ownerMatches && targetMatches && nameMatches;
    });
  }, [sortedProjects, ownerFilter, targetFilter, nameFilter]);
  var hasFilteredProjects = filteredProjects.length > 0;
  var resetFilters = () => {
    setOwnerFilter('');
    setTargetFilter('');
    setNameFilter('');
  };
  var handleImportClick = () => {
    if (typeof onImportProject !== 'function') {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };
  var handleFileChange = event => {
    var _event$target;
    if (typeof onImportProject !== 'function') {
      return;
    }
    var file = event === null || event === void 0 || (_event$target = event.target) === null || _event$target === void 0 || (_event$target = _event$target.files) === null || _event$target === void 0 ? void 0 : _event$target[0];
    if (file) {
      onImportProject(file);
    }
    if (event !== null && event !== void 0 && event.target) {
      event.target.value = '';
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen hv-background home-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto section-stack"
  }, /*#__PURE__*/React.createElement("header", {
    className: "home-hero hv-surface",
    role: "banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "home-hero__badge"
  }, /*#__PURE__*/React.createElement(Target, {
    className: "w-5 h-5"
  }), " Votre copilote compliance"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl sm:text-4xl leading-tight"
  }, "Anticipez les besoins compliance de vos projets en quelques minutes"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg hv-text-muted leading-relaxed max-w-2xl"
  }, "Compliance Advisor vous guide pas \xE0 pas pour qualifier votre initiative, identifier les interlocuteurs \xE0 mobiliser et s\xE9curiser vos d\xE9lais r\xE9glementaires."), /*#__PURE__*/React.createElement("div", {
    className: "home-hero__actions",
    role: "group",
    "aria-label": "Actions principales"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onStartNewProject,
    className: "hv-button hv-button-primary home-hero__button flex items-center justify-center px-6 py-3 text-base"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-5 h-5 mr-2"
  }), "Cr\xE9er un nouveau projet"), hasProjects && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      var _sortedProjects$;
      return onOpenProject((_sortedProjects$ = sortedProjects[0]) === null || _sortedProjects$ === void 0 ? void 0 : _sortedProjects$.id);
    },
    className: "hv-button hv-button-outline home-hero__button flex items-center justify-center px-6 py-3 text-base"
  }, /*#__PURE__*/React.createElement(Eye, {
    className: "w-5 h-5 mr-2"
  }), "Reprendre le dernier projet"), typeof onImportProject === 'function' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "application/json",
    onChange: handleFileChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleImportClick,
    className: "hv-button hv-button-accent home-hero__button flex items-center justify-center px-6 py-3 text-base"
  }, /*#__PURE__*/React.createElement(Upload, {
    className: "w-5 h-5 mr-2"
  }), "Charger un projet")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero__detail",
    role: "listitem"
  }, /*#__PURE__*/React.createElement("p", {
    className: "home-hero__detail-title"
  }, /*#__PURE__*/React.createElement(Rocket, {
    className: "w-5 h-5"
  }), " D\xE9marrez simplement"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted leading-relaxed"
  }, "Un questionnaire dynamique pour cadrer votre projet et qualifier les impacts compliance.")), /*#__PURE__*/React.createElement("div", {
    className: "home-hero__detail",
    role: "listitem"
  }, /*#__PURE__*/React.createElement("p", {
    className: "home-hero__detail-title"
  }, /*#__PURE__*/React.createElement(Compass, {
    className: "w-5 h-5"
  }), " Visualisez la feuille de route"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted leading-relaxed"
  }, "Une synth\xE8se claire avec le niveau de complexit\xE9, les \xE9quipes \xE0 mobiliser et les d\xE9lais recommand\xE9s.")), /*#__PURE__*/React.createElement("div", {
    className: "home-hero__detail",
    role: "listitem"
  }, /*#__PURE__*/React.createElement("p", {
    className: "home-hero__detail-title"
  }, /*#__PURE__*/React.createElement(Users, {
    className: "w-5 h-5"
  }), " Collaborez efficacement"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted leading-relaxed"
  }, "Partagez la synth\xE8se avec les parties prenantes pour s\xE9curiser vos points de passage.")), /*#__PURE__*/React.createElement("div", {
    className: "home-hero__detail",
    role: "listitem"
  }, /*#__PURE__*/React.createElement("p", {
    className: "home-hero__detail-title"
  }, /*#__PURE__*/React.createElement(Calendar, {
    className: "w-5 h-5"
  }), " Gardez une trace"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted leading-relaxed"
  }, "Retrouvez \xE0 tout moment les projets d\xE9j\xE0 soumis et mettez-les \xE0 jour si n\xE9cessaire.")))), /*#__PURE__*/React.createElement("section", {
    "aria-labelledby": "projects-heading",
    className: "section-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-section-heading"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    id: "projects-heading",
    className: "text-2xl"
  }, "Vos projets enregistr\xE9s"), /*#__PURE__*/React.createElement("p", {
    className: "hv-text-muted text-sm"
  }, "Acc\xE9dez aux brouillons et aux synth\xE8ses finalis\xE9es pour les reprendre \xE0 tout moment.")), /*#__PURE__*/React.createElement("span", {
    className: "home-section-counter"
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    className: "w-4 h-4"
  }), " ", projects.length, " projet", projects.length > 1 ? 's' : '')), !hasProjects && /*#__PURE__*/React.createElement("div", {
    className: "home-empty",
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-medium"
  }, "Aucun projet enregistr\xE9 pour le moment."), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted"
  }, "Lancez-vous d\xE8s maintenant pour pr\xE9parer votre premi\xE8re synth\xE8se compliance."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onStartNewProject,
    className: "mt-4 hv-button hv-button-primary inline-flex items-center px-5 py-3 text-base"
  }, /*#__PURE__*/React.createElement(Plus, {
    className: "w-4 h-4 mr-2"
  }), " Cr\xE9er un projet")), hasProjects && /*#__PURE__*/React.createElement("div", {
    className: "section-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-filters hv-surface",
    role: "region",
    "aria-label": "Filtres des projets"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "owner-filter",
    className: "filter-label"
  }, "Porteur de projet"), /*#__PURE__*/React.createElement("select", {
    id: "owner-filter",
    className: "filter-control",
    value: ownerFilter,
    onChange: event => setOwnerFilter(event.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous les porteurs"), filterOptions.owners.map(option => /*#__PURE__*/React.createElement("option", {
    key: option,
    value: option
  }, option)))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "target-filter",
    className: "filter-label"
  }, "Cible prioritaire"), /*#__PURE__*/React.createElement("select", {
    id: "target-filter",
    className: "filter-control",
    value: targetFilter,
    onChange: event => setTargetFilter(event.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Toutes les cibles"), filterOptions.targets.map(option => /*#__PURE__*/React.createElement("option", {
    key: option,
    value: option
  }, option)))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "name-filter",
    className: "filter-label"
  }, "Nom du projet"), /*#__PURE__*/React.createElement("input", {
    id: "name-filter",
    type: "search",
    placeholder: "Rechercher un projet",
    className: "filter-control",
    value: nameFilter,
    onChange: event => setNameFilter(event.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: resetFilters,
    className: "hv-button hv-button-ghost px-5 py-2 text-sm",
    disabled: !ownerFilter && !targetFilter && nameFilter.trim().length === 0
  }, "R\xE9initialiser les filtres")))), hasFilteredProjects ? /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
    role: "list"
  }, filteredProjects.map(project => {
    var _project$analysis, _project$analysis$ris, _project$analysis2, _project$analysis3;
    var complexity = (_project$analysis = project.analysis) === null || _project$analysis === void 0 ? void 0 : _project$analysis.complexity;
    var risksCount = (_project$analysis$ris = (_project$analysis2 = project.analysis) === null || _project$analysis2 === void 0 || (_project$analysis2 = _project$analysis2.risks) === null || _project$analysis2 === void 0 ? void 0 : _project$analysis2.length) !== null && _project$analysis$ris !== void 0 ? _project$analysis$ris : 0;
    var projectStatus = statusStyles[project.status] || statusStyles.submitted;
    var progress = computeProgress(project);
    var isDraft = project.status === 'draft';
    var answers = project.answers || {};
    var relevantTeams = Array.isArray((_project$analysis3 = project.analysis) === null || _project$analysis3 === void 0 ? void 0 : _project$analysis3.relevantTeams) ? project.analysis.relevantTeams : [];
    var leadNameSource = [answers.teamLead, project.teamLead].find(value => typeof value === 'string' && value.trim().length > 0);
    var leadName = leadNameSource ? leadNameSource.trim() : '';
    var resolveLeadTeam = () => {
      var directTeamSource = [answers.teamLeadTeam, answers.projectLeadTeam, answers.ownerTeam, project.teamLeadTeam, project.projectLeadTeam, project.ownerTeam].find(value => typeof value === 'string' && value.trim().length > 0);
      if (directTeamSource) {
        return directTeamSource.trim();
      }
      var directTeamId = [answers.teamLeadTeamId, project.teamLeadTeamId, answers.teamLeadDepartment, project.teamLeadDepartment].find(value => typeof value === 'string' && value.trim().length > 0);
      if (directTeamId) {
        var matchingTeam = relevantTeams.find(team => {
          var identifiers = [team.id, team.teamId, team.slug, team.code];
          return identifiers.some(identifier => identifier === directTeamId);
        });
        if (matchingTeam) {
          var teamName = typeof matchingTeam.name === 'string' && matchingTeam.name.trim().length > 0 ? matchingTeam.name.trim() : typeof matchingTeam.label === 'string' && matchingTeam.label.trim().length > 0 ? matchingTeam.label.trim() : null;
          if (teamName) {
            return teamName;
          }
        }
      }
      if (relevantTeams.length === 1) {
        var fallbackTeam = relevantTeams[0];
        var fallbackName = typeof (fallbackTeam === null || fallbackTeam === void 0 ? void 0 : fallbackTeam.name) === 'string' && fallbackTeam.name.trim().length > 0 ? fallbackTeam.name.trim() : typeof (fallbackTeam === null || fallbackTeam === void 0 ? void 0 : fallbackTeam.label) === 'string' && fallbackTeam.label.trim().length > 0 ? fallbackTeam.label.trim() : null;
        if (fallbackName) {
          return fallbackName;
        }
      }
      return null;
    };
    var leadTeam = resolveLeadTeam();
    var leadInformation = leadName ? leadTeam ? "".concat(leadName, " (").concat(leadTeam, ")") : leadName : 'Lead non renseigné';
    var extractTextValue = value => {
      if (typeof value === 'string') {
        var trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (Array.isArray(value)) {
        var entries = value.map(item => typeof item === 'string' ? item.trim() : '').filter(item => item.length > 0);
        return entries.length > 0 ? entries.join(', ') : null;
      }
      if (value && typeof value === 'object') {
        var objectLabel = typeof value.label === 'string' && value.label.trim().length > 0 ? value.label.trim() : null;
        if (objectLabel) {
          return objectLabel;
        }
        var objectName = typeof value.name === 'string' && value.name.trim().length > 0 ? value.name.trim() : null;
        if (objectName) {
          return objectName;
        }
      }
      return null;
    };
    var resolveProjectType = () => {
      var _project$meta, _project$meta2, _project$meta3, _project$analysis4, _project$analysis5, _project$analysis6, _project$analysis7;
      var candidates = [answers.projectType, answers.projectCategory, answers.projectKind, answers.projectFormat, project.projectType, project.projectCategory, project.projectKind, project.projectFormat, (_project$meta = project.meta) === null || _project$meta === void 0 ? void 0 : _project$meta.projectType, (_project$meta2 = project.meta) === null || _project$meta2 === void 0 ? void 0 : _project$meta2.eyebrow, (_project$meta3 = project.meta) === null || _project$meta3 === void 0 ? void 0 : _project$meta3.badge, (_project$analysis4 = project.analysis) === null || _project$analysis4 === void 0 ? void 0 : _project$analysis4.projectType, (_project$analysis5 = project.analysis) === null || _project$analysis5 === void 0 ? void 0 : _project$analysis5.projectCategory, (_project$analysis6 = project.analysis) === null || _project$analysis6 === void 0 || (_project$analysis6 = _project$analysis6.profile) === null || _project$analysis6 === void 0 ? void 0 : _project$analysis6.label, (_project$analysis7 = project.analysis) === null || _project$analysis7 === void 0 || (_project$analysis7 = _project$analysis7.profile) === null || _project$analysis7 === void 0 ? void 0 : _project$analysis7.name];
      for (var candidate of candidates) {
        var text = extractTextValue(candidate);
        if (text) {
          return text;
        }
      }
      return 'Type non renseigné';
    };
    var projectType = resolveProjectType();
    return /*#__PURE__*/React.createElement("article", {
      key: project.id,
      className: "home-project-card hv-surface",
      role: "listitem",
      "aria-label": "Projet ".concat(project.projectName || 'sans nom')
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-semibold flex items-center gap-2 flex-wrap"
    }, /*#__PURE__*/React.createElement("span", null, project.projectName || 'Projet sans nom'), project.isDemo && /*#__PURE__*/React.createElement("span", {
      className: "tag-soft"
    }, "Projet d\xE9mo")), /*#__PURE__*/React.createElement("p", {
      className: "text-sm hv-text-muted mt-1"
    }, "Derni\xE8re mise \xE0 jour : ", formatDate(project.lastUpdated || project.submittedAt))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-end gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: projectStatus.className
    }, projectStatus.label), complexity && /*#__PURE__*/React.createElement("span", {
      className: complexityBadges[complexity] || 'complexity-badge'
    }, complexity))), /*#__PURE__*/React.createElement("dl", {
      className: "mt-4 grid grid-cols-1 gap-3 text-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 hv-text-muted"
    }, /*#__PURE__*/React.createElement(Users, {
      className: "w-4 h-4"
    }), /*#__PURE__*/React.createElement("span", {
      className: "font-medium text-sm text-current"
    }, leadInformation)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 hv-text-muted"
    }, /*#__PURE__*/React.createElement(Compass, {
      className: "w-4 h-4"
    }), /*#__PURE__*/React.createElement("span", null, projectType)), progress !== null && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 hv-text-muted"
    }, /*#__PURE__*/React.createElement(Save, {
      className: "w-4 h-4"
    }), /*#__PURE__*/React.createElement("span", null, progress, "% du questionnaire compl\xE9t\xE9")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 hv-text-muted"
    }, /*#__PURE__*/React.createElement(AlertTriangle, {
      className: "w-4 h-4"
    }), /*#__PURE__*/React.createElement("span", null, risksCount, " risque", risksCount > 1 ? 's' : '', " identifi\xE9", risksCount > 1 ? 's' : ''))), /*#__PURE__*/React.createElement("div", {
      className: "mt-6 flex flex-wrap gap-3"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        if (typeof onOpenSynthesis === 'function') {
          onOpenSynthesis(project.id);
        } else if (typeof onOpenProject === 'function') {
          onOpenProject(project.id);
        }
      },
      disabled: !(typeof onOpenSynthesis === 'function' || typeof onOpenProject === 'function'),
      className: "hv-button hv-button-primary inline-flex items-center px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    }, /*#__PURE__*/React.createElement(Eye, {
      className: "w-4 h-4 mr-2"
    }), " Consulter la synth\xE8se"), onOpenPresentation && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onOpenPresentation(project.id),
      className: "hv-button hv-button-outline inline-flex items-center px-5 py-2 text-sm"
    }, /*#__PURE__*/React.createElement(Sparkles, {
      className: "w-4 h-4 mr-2"
    }), " Pr\xE9sentation"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        if (isDraft && typeof onOpenProject === 'function') {
          onOpenProject(project.id);
        }
        if (!isDraft && typeof onDuplicateProject === 'function') {
          onDuplicateProject(project.id);
        }
      },
      disabled: isDraft && typeof onOpenProject !== 'function' || !isDraft && typeof onDuplicateProject !== 'function',
      className: "hv-button inline-flex items-center px-5 py-2 text-sm ".concat(isDraft ? 'hv-button-accent disabled:opacity-50 disabled:cursor-not-allowed' : 'hv-button-outline disabled:opacity-50 disabled:cursor-not-allowed')
    }, isDraft ? /*#__PURE__*/React.createElement(Edit, {
      className: "w-4 h-4 mr-2"
    }) : /*#__PURE__*/React.createElement(Copy, {
      className: "w-4 h-4 mr-2"
    }), isDraft ? 'Modifier' : 'Dupliquer')));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "home-empty",
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-medium"
  }, "Aucun projet ne correspond aux filtres s\xE9lectionn\xE9s."), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 hv-text-muted"
  }, "Ajustez vos crit\xE8res ou r\xE9initialisez les filtres pour visualiser \xE0 nouveau l'ensemble des projets."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: resetFilters,
    className: "mt-4 hv-button hv-button-primary inline-flex items-center px-5 py-2 text-sm"
  }, "R\xE9initialiser les filtres"))))));
};