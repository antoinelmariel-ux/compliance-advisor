function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import React, { useCallback } from '../react.js';
import { FileText, Calendar, Users, AlertTriangle, Send, Sparkles, CheckCircle } from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';
import { extractProjectName } from '../utils/projects.js';
var escapeHtml = value => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};
var sanitizeFileName = function sanitizeFileName(value) {
  var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'projet-compliance';
  if (typeof value !== 'string') {
    return fallback;
  }
  var normalized = value.trim();
  if (normalized.length === 0) {
    return fallback;
  }
  try {
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    normalized = normalized.replace(/[^\w\s-]/g, '');
  }
  var sanitized = normalized.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return sanitized.length > 0 ? sanitized : fallback;
};
var formatNumber = function formatNumber(value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Number(value).toLocaleString('fr-FR', options);
};
var formatWeeksValue = weeks => {
  if (weeks === undefined || weeks === null) {
    return '-';
  }
  var rounded = Math.round(weeks * 10) / 10;
  var hasDecimal = Math.abs(rounded - Math.round(rounded)) > 0.0001;
  return "".concat(formatNumber(rounded, {
    minimumFractionDigits: hasDecimal ? 1 : 0,
    maximumFractionDigits: hasDecimal ? 1 : 0
  }), " sem.");
};
var formatDaysValue = days => {
  if (days === undefined || days === null) {
    return '-';
  }
  return "".concat(formatNumber(Math.round(days)), " j.");
};
var formatRequirementValue = requirement => {
  if (requirement.requiredWeeks !== undefined) {
    return "".concat(formatNumber(requirement.requiredWeeks), " sem.");
  }
  if (requirement.requiredDays !== undefined) {
    return "".concat(formatNumber(requirement.requiredDays), " j.");
  }
  return '-';
};
var computeTeamTimeline = (timelineByTeam, teamId) => {
  var entries = timelineByTeam[teamId] || [];
  if (entries.length === 0) {
    return null;
  }
  var actualWeeks = entries[0].actualWeeks;
  var actualDays = entries[0].actualDays;
  var meetsAll = entries.every(entry => entry.satisfied);
  var strictestRequirement = entries.reduce((acc, entry) => {
    var requirementWeeks = entry.requiredWeeks !== undefined ? entry.requiredWeeks : entry.requiredDays !== undefined ? entry.requiredDays / 7 : 0;
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
var getTeamPriority = (analysis, teamId) => {
  if (!analysis) {
    return 'Recommandé';
  }
  var priorityWeights = {
    Recommandé: 1,
    Important: 2,
    Critique: 3
  };
  var getWeight = priority => priorityWeights[priority] || 0;
  var risks = Array.isArray(analysis.risks) ? analysis.risks : [];
  var bestPriority = 'Recommandé';
  risks.forEach(risk => {
    if (!Array.isArray(risk.teams) || !risk.teams.includes(teamId)) {
      return;
    }
    if (getWeight(risk.priority) > getWeight(bestPriority)) {
      bestPriority = risk.priority;
    }
  });
  if (bestPriority !== 'Recommandé') {
    return bestPriority;
  }
  var triggeredRules = Array.isArray(analysis.triggeredRules) ? analysis.triggeredRules : [];
  triggeredRules.forEach(rule => {
    if (!Array.isArray(rule.teams) || !rule.teams.includes(teamId)) {
      return;
    }
    if (getWeight(rule.priority) > getWeight(bestPriority)) {
      bestPriority = rule.priority;
    }
  });
  return bestPriority;
};
var formatAsHtmlText = value => {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
};
var buildEmailHtml = _ref => {
  var {
    projectName,
    questions,
    answers,
    analysis,
    relevantTeams,
    timelineByTeam,
    timelineDetails
  } = _ref;
  var title = projectName || 'Projet sans nom';
  var answeredQuestions = questions.filter(question => {
    var value = answers[question.id];
    if (value === null || value === undefined) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  });
  var risks = Array.isArray(analysis === null || analysis === void 0 ? void 0 : analysis.risks) ? analysis.risks : [];
  var firstTimelineDetail = timelineDetails.find(detail => detail.diff);
  var hasTimelineData = Object.keys(timelineByTeam).length > 0 || Boolean(firstTimelineDetail);
  var overviewSection = answeredQuestions.length ? "\n        <div style=\"margin-bottom:24px;\">\n          <h2 style=\"font-size:18px; font-weight:600; color:#1f2937; margin-bottom:12px;\">\n            Vue d'ensemble du projet\n          </h2>\n          <table style=\"width:100%; border-collapse:collapse; background-color:#f9fafb; border-radius:12px; overflow:hidden;\">\n            <tbody>\n              ".concat(answeredQuestions.map(question => {
    var questionLabel = escapeHtml(question.question);
    var formattedAnswer = formatAsHtmlText(formatAnswer(question, answers[question.id]));
    return "\n                    <tr>\n                      <td style=\"width:40%; padding:12px 16px; font-size:13px; font-weight:700; color:#001f3f; border-bottom:1px solid #e5e7eb;\">\n                        ".concat(questionLabel, "\n                      </td>\n                      <td style=\"padding:12px 16px; font-size:14px; font-weight:600; color:#1f2937; border-bottom:1px solid #e5e7eb;\">\n                        ").concat(formattedAnswer || '<span style="color:#9ca3af;">Non renseigné</span>', "\n                      </td>\n                    </tr>\n                  ");
  }).join(''), "\n            </tbody>\n          </table>\n        </div>\n      ") : '';
  var timelineSection = hasTimelineData ? "\n        <div style=\"margin-bottom:24px;\">\n          <h2 style=\"font-size:18px; font-weight:600; color:#1f2937; margin-bottom:12px;\">\n            D\xE9lais compliance recommand\xE9s\n          </h2>\n          <div style=\"background-color:#eef2ff; border:1px solid #c7d2fe; border-radius:12px; padding:16px; color:#312e81; font-size:14px; margin-bottom:16px;\">\n            ".concat(firstTimelineDetail !== null && firstTimelineDetail !== void 0 && firstTimelineDetail.diff ? "Buffer projet : <strong>".concat(escapeHtml(formatWeeksValue(firstTimelineDetail.diff.diffInWeeks)), "</strong> (").concat(escapeHtml(formatDaysValue(firstTimelineDetail.diff.diffInDays)), ")") : 'Dates projet incomplètes : les délais sont fournis à titre indicatif.', "\n          </div>\n          ").concat(relevantTeams.map(team => {
    var timelineInfo = computeTeamTimeline(timelineByTeam, team.id);
    var teamName = escapeHtml(team.name);
    if (!timelineInfo) {
      return "\n                  <div style=\"border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:12px; background-color:#ffffff;\">\n                    <h3 style=\"margin:0 0 8px; font-size:16px; font-weight:600; color:#1f2937;\">".concat(teamName, "</h3>\n                    <p style=\"margin:0; font-size:14px; color:#4b5563;\">Aucune exigence de d\xE9lai configur\xE9e.</p>\n                  </div>\n                ");
    }
    var entriesHtml = timelineInfo.entries.map(entry => {
      var statusColor = entry.satisfied ? '#059669' : '#dc2626';
      var statusLabel = entry.satisfied ? 'Délai respecté' : 'Délai insuffisant';
      var requirementLabel = escapeHtml(formatRequirementValue(entry));
      var profileLabel = escapeHtml(entry.profileLabel);
      return "\n                    <li style=\"margin-bottom:6px;\">\n                      <span style=\"font-weight:600; color:#1f2937;\">".concat(profileLabel, "</span>\n                      <span style=\"color:#4b5563;\"> \u2014 ").concat(requirementLabel, "</span>\n                      <span style=\"color:").concat(statusColor, "; font-weight:600;\"> (").concat(statusLabel, ")</span>\n                    </li>\n                  ");
    }).join('');
    return "\n                <div style=\"border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:12px; background-color:#ffffff;\">\n                  <h3 style=\"margin:0 0 8px; font-size:16px; font-weight:600; color:#1f2937;\">".concat(teamName, "</h3>\n                  <p style=\"margin:0; font-size:14px; color:#4b5563;\">\n                    Buffer actuel : <strong>").concat(escapeHtml(formatWeeksValue(timelineInfo.actualWeeks)), "</strong>\n                    (").concat(escapeHtml(formatDaysValue(timelineInfo.actualDays)), ")\n                  </p>\n                  <p style=\"margin:4px 0 10px; font-size:14px; color:#4b5563;\">\n                    Exigence la plus stricte : <strong>").concat(escapeHtml(formatWeeksValue(timelineInfo.strictestRequirement)), "</strong>\n                  </p>\n                  <ul style=\"margin:0; padding-left:18px; list-style-type:disc; color:#4b5563; font-size:13px;\">\n                    ").concat(entriesHtml, "\n                  </ul>\n                </div>\n              ");
  }).join(''), "\n        </div>\n      ") : '';
  var teamSection = relevantTeams.length ? "\n        <div style=\"margin-bottom:24px;\">\n          <h2 style=\"font-size:18px; font-weight:600; color:#1f2937; margin-bottom:12px;\">\n            \xC9quipes \xE0 mobiliser\n          </h2>\n          ".concat(relevantTeams.map(team => {
    var _analysis$questions;
    var teamPriority = getTeamPriority(analysis, team.id);
    var teamQuestions = ((_analysis$questions = analysis.questions) === null || _analysis$questions === void 0 ? void 0 : _analysis$questions[team.id]) || [];
    var contact = team.contact ? "<span style=\"color:#4b5563;\"> | Contact : ".concat(escapeHtml(team.contact), "</span>") : '';
    var questionsHtml = Array.isArray(teamQuestions) && teamQuestions.length ? "\n                    <div style=\"margin-top:8px;\">\n                      <span style=\"font-size:13px; color:#4b5563; font-weight:600;\">Points \xE0 pr\xE9parer :</span>\n                      <ul style=\"margin:8px 0 0; padding-left:18px; list-style-type:disc; color:#4b5563; font-size:13px;\">\n                        ".concat(teamQuestions.map(question => "<li>".concat(escapeHtml(question), "</li>")).join(''), "\n                      </ul>\n                    </div>\n                  ") : '';
    return "\n                <div style=\"border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:12px; background-color:#f9fafb;\">\n                  <div style=\"font-size:15px; font-weight:600; color:#1f2937;\">\n                    ".concat(escapeHtml(team.name), " \u2014 Priorit\xE9 : ").concat(escapeHtml(teamPriority)).concat(contact, "\n                  </div>\n                  ").concat(questionsHtml, "\n                </div>\n              ");
  }).join(''), "\n        </div>\n      ") : '';
  var riskSection = risks.length ? "\n        <div style=\"margin-bottom:24px;\">\n          <h2 style=\"font-size:18px; font-weight:600; color:#1f2937; margin-bottom:12px;\">\n            Risques identifi\xE9s et actions\n          </h2>\n          ".concat(risks.map(risk => {
    return "\n                <div style=\"border:1px solid #fee2e2; border-radius:12px; padding:16px; margin-bottom:12px; background-color:#fef2f2;\">\n                  <div style=\"font-size:15px; font-weight:600; color:#b91c1c;\">\n                    ".concat(escapeHtml(risk.level), " \u2014 Priorit\xE9 : ").concat(escapeHtml(risk.priority), "\n                  </div>\n                  <p style=\"margin:8px 0 4px; font-size:14px; color:#4b5563;\">\n                    <strong>Description :</strong> ").concat(formatAsHtmlText(risk.description), "\n                  </p>\n                  <p style=\"margin:0; font-size:14px; color:#4b5563;\">\n                    <strong>Mitigation :</strong> ").concat(formatAsHtmlText(risk.mitigation), "\n                  </p>\n                </div>\n              ");
  }).join(''), "\n        </div>\n      ") : '';
  return "<!DOCTYPE html>\n    <html lang=\"fr\">\n      <head>\n        <meta charset=\"UTF-8\" />\n        <title>".concat(escapeHtml(title), "</title>\n      </head>\n      <body style=\"margin:0; padding:0; background-color:#f3f4f6; font-family:'Segoe UI', Arial, sans-serif; color:#1f2937;\">\n        <div style=\"max-width:720px; margin:0 auto; padding:32px 24px;\">\n          <div style=\"background-color:#ffffff; border-radius:20px; padding:32px; box-shadow:0 10px 30px rgba(15, 23, 42, 0.08); border:1px solid #e5e7eb;\">\n            <div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;\">\n              <div>\n                <h1 style=\"font-size:24px; color:#111827; margin:0 0 6px;\">Rapport de Compliance</h1>\n                <p style=\"margin:0; color:#4b5563; font-size:14px;\">").concat(escapeHtml(title), "</p>\n              </div>\n              <div style=\"padding:10px 16px; background-color:#eef2ff; color:#4338ca; border-radius:9999px; font-weight:600; font-size:14px;\">\n                Complexit\xE9 : ").concat(escapeHtml(analysis.complexity), "\n              </div>\n            </div>\n            <p style=\"margin:0 0 20px; font-size:14px; color:#1f2937;\">\n              Bonjour \xE9quipe Compliance, un nouveau projet a \xE9t\xE9 soumis pour revue. Vous trouverez ci-dessous les informations principales.\n            </p>\n            ").concat(overviewSection, "\n            ").concat(timelineSection, "\n            ").concat(teamSection, "\n            ").concat(riskSection, "\n          </div>\n        </div>\n      </body>\n    </html>");
};
var buildProjectExport = _ref2 => {
  var {
    projectName,
    answers,
    analysis,
    relevantTeams,
    timelineByTeam,
    timelineDetails,
    questions
  } = _ref2;
  var normalizedAnswers = answers && typeof answers === 'object' ? answers : {};
  var teamsSnapshot = relevantTeams.map(team => ({
    id: team.id,
    name: team.name,
    contact: team.contact || null,
    priority: getTeamPriority(analysis, team.id)
  }));
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    project: {
      name: projectName || 'Projet sans nom',
      answers: normalizedAnswers,
      analysis: analysis || null,
      relevantTeams: teamsSnapshot,
      timeline: {
        byTeam: timelineByTeam,
        details: timelineDetails
      },
      questionnaire: {
        questionIds: Array.isArray(questions) ? questions.map(question => question.id) : []
      }
    }
  };
};
var decodeHtmlEntities = text => text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
var buildPlainTextEmail = html => {
  if (!html) {
    return '';
  }
  var text = html.replace(/<!DOCTYPE[^>]*>/gi, '').replace(/<head[\s\S]*?<\/head>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:p|div|section|article)\s*>/gi, '\n\n').replace(/<\/(?:h[1-6])\s*>/gi, '\n').replace(/<\/(?:ul|ol)\s*>/gi, '\n').replace(/<li\s*>/gi, '• ').replace(/<\/(?:tr)\s*>/gi, '\n').replace(/<\/(?:td|th)\s*>/gi, '\t');
  text = text.replace(/<[^>]+>/g, '');
  text = decodeHtmlEntities(text);
  text = text.replace(/\r/g, '').replace(/\t+/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n');
  return text.trim();
};
var buildMailtoLink = _ref3 => {
  var {
    projectName,
    relevantTeams,
    body
  } = _ref3;
  var recipients = relevantTeams.map(team => (team.contact || '').trim()).filter(contact => contact.length > 0);
  var toField = recipients.join(',');
  var subject = projectName || 'Projet compliance';
  var prefix = toField ? "mailto:".concat(toField) : 'mailto:';
  var normalizedBody = (body || '').replace(/\r?\n/g, '\r\n');
  var encodedSubject = encodeURIComponent(subject);
  var encodedBody = encodeURIComponent(normalizedBody);
  return "".concat(prefix, "?subject=").concat(encodedSubject, "&body=").concat(encodedBody);
};
export var SynthesisReport = _ref4 => {
  var _analysis$timeline, _analysis$timeline2;
  var {
    answers,
    analysis,
    teams,
    questions,
    onBack,
    onUpdateAnswers,
    onSubmitProject,
    isExistingProject,
    onOpenPresentation
  } = _ref4;
  var relevantTeams = teams.filter(team => ((analysis === null || analysis === void 0 ? void 0 : analysis.teams) || []).includes(team.id));
  var priorityColors = {
    Critique: 'bg-red-100 text-red-800 border-red-300',
    Important: 'bg-orange-100 text-orange-800 border-orange-300',
    Recommandé: 'bg-blue-100 text-blue-800 border-blue-300'
  };
  var riskColors = {
    Élevé: 'bg-red-50 border-red-300 text-red-900',
    Moyen: 'bg-orange-50 border-orange-300 text-orange-900',
    Faible: 'bg-green-50 border-green-300 text-green-900'
  };
  var complexityColors = {
    Élevé: 'text-red-600',
    Moyen: 'text-orange-600',
    Faible: 'text-green-600'
  };
  var timelineByTeam = (analysis === null || analysis === void 0 || (_analysis$timeline = analysis.timeline) === null || _analysis$timeline === void 0 ? void 0 : _analysis$timeline.byTeam) || {};
  var timelineDetails = (analysis === null || analysis === void 0 || (_analysis$timeline2 = analysis.timeline) === null || _analysis$timeline2 === void 0 ? void 0 : _analysis$timeline2.details) || [];
  var firstTimelineDetail = timelineDetails.find(detail => detail.diff);
  var hasTimelineData = Object.keys(timelineByTeam).length > 0 || Boolean(firstTimelineDetail);
  var projectName = extractProjectName(answers, questions);
  var handleOpenPresentation = useCallback(() => {
    if (typeof onOpenPresentation === 'function') {
      onOpenPresentation();
    }
  }, [onOpenPresentation]);
  var handleSaveProject = useCallback(() => {
    if (!onSubmitProject) {
      return;
    }
    onSubmitProject({
      projectName,
      answers,
      analysis,
      relevantTeams,
      timelineDetails
    });
  }, [analysis, answers, onSubmitProject, projectName, relevantTeams, timelineDetails]);
  var handleSubmitByEmail = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    var emailHtml = buildEmailHtml({
      projectName,
      questions,
      answers,
      analysis,
      relevantTeams,
      timelineByTeam,
      timelineDetails
    });
    var emailText = buildPlainTextEmail(emailHtml);
    var projectExport = buildProjectExport({
      projectName,
      answers,
      analysis,
      relevantTeams,
      timelineByTeam,
      timelineDetails,
      questions
    });
    var projectJson = '';
    try {
      projectJson = JSON.stringify(projectExport, null, 2);
    } catch (error) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error('[SynthesisReport] Impossible de sérialiser le projet :', error);
      }
      projectJson = JSON.stringify({
        version: 1,
        project: {
          name: projectExport.project.name,
          answers: {}
        }
      }, null, 2);
    }
    var fileNameBase = sanitizeFileName(projectName || 'Projet compliance');
    var fileName = "".concat(fileNameBase, ".json");
    var subject = projectName || 'Projet compliance';
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof File === 'function') {
      try {
        var projectFile = new File([projectJson], fileName, {
          type: 'application/json'
        });
        var canShare = typeof navigator.canShare === 'function' ? navigator.canShare({
          files: [projectFile]
        }) : true;
        if (canShare) {
          yield navigator.share({
            title: subject,
            text: "".concat(emailText, "\n\nFichier du projet : ").concat(fileName),
            files: [projectFile]
          });
          return;
        }
      } catch (error) {
        if (error && error.name === 'AbortError') {
          return;
        }
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
          console.warn('[SynthesisReport] Partage du projet impossible :', error);
        }
      }
    }
    if (typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        var blob = new Blob([projectJson], {
          type: 'application/json'
        });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => {
          if (typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
          }
        }, 0);
      } catch (error) {
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
          console.warn('[SynthesisReport] Téléchargement du projet impossible :', error);
        }
      }
    }
    var fallbackBody = "".concat(emailText, "\n\nFichier du projet : ").concat(fileName, "\nLe fichier JSON a \xE9t\xE9 t\xE9l\xE9charg\xE9 automatiquement ; merci de l'ajouter en pi\xE8ce jointe avant envoi.");
    var mailtoLink = buildMailtoLink({
      projectName,
      relevantTeams,
      body: fallbackBody
    });
    if (typeof window !== 'undefined') {
      window.location.href = mailtoLink;
    }
  }), [analysis, answers, projectName, questions, relevantTeams, timelineByTeam, timelineDetails]);
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen hv-background px-4 py-16 sm:px-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 hv-surface",
    role: "region",
    "aria-label": "Synth\xE8se du projet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold text-gray-800 sm:text-4xl"
  }, "Rapport de Compliance"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 w-full lg:w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 w-full lg:w-auto"
  }, onBack && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    className: "px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-all hv-button hv-focus-ring w-full sm:w-auto justify-center text-sm sm:text-base"
  }, "Retour au questionnaire"), onSubmitProject && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSaveProject,
    className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    className: "w-4 h-4 mr-2"
  }), isExistingProject ? 'Mettre à jour le projet (JSON)' : 'Enregistrer le projet (JSON)'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSubmitByEmail,
    className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center justify-center hv-button hv-button-primary w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Send, {
    className: "w-4 h-4 mr-2"
  }), "Soumettre par e-mail"), onOpenPresentation && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleOpenPresentation,
    className: "px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-all flex items-center justify-center hv-button hv-focus-ring w-full sm:w-auto text-sm sm:text-base"
  }, /*#__PURE__*/React.createElement(Sparkles, {
    className: "w-4 h-4 mr-2"
  }), "Pr\xE9sentation")), onSubmitProject && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 text-center sm:text-left"
  }, "Un fichier JSON sera t\xE9l\xE9charg\xE9 automatiquement lors de l'enregistrement."))), /*#__PURE__*/React.createElement("section", {
    className: "bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 sm:p-6 mb-8 border border-indigo-200 hv-surface",
    "aria-labelledby": "overview-heading"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "overview-heading",
    className: "text-xl font-bold text-gray-800 mb-4 flex items-center"
  }, /*#__PURE__*/React.createElement(FileText, {
    className: "w-6 h-6 mr-2 text-indigo-600"
  }), "Vue d'ensemble du projet"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, questions.map(q => answers[q.id] ? /*#__PURE__*/React.createElement("div", {
    key: q.id,
    className: "bg-white rounded-lg p-4 border border-gray-200 hv-surface"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mb-1"
  }, q.question), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold text-gray-900 whitespace-pre-line"
  }, renderTextWithLinks(formatAnswer(q, answers[q.id])))) : null)), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-4 border border-gray-200 hv-surface",
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-medium text-gray-700"
  }, "Niveau de complexit\xE9 compliance :"), /*#__PURE__*/React.createElement("span", {
    className: "text-xl font-bold ".concat(complexityColors[analysis.complexity])
  }, analysis.complexity))), hasTimelineData && /*#__PURE__*/React.createElement("section", {
    className: "mb-8",
    "aria-labelledby": "timeline-heading"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "timeline-heading",
    className: "text-2xl font-bold text-gray-800 mb-4 flex items-center"
  }, /*#__PURE__*/React.createElement(Calendar, {
    className: "w-6 h-6 mr-2 text-indigo-600"
  }), "D\xE9lais compliance recommand\xE9s"), firstTimelineDetail !== null && firstTimelineDetail !== void 0 && firstTimelineDetail.diff ? /*#__PURE__*/React.createElement("div", {
    className: "bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 text-sm text-gray-700 hv-surface"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-gray-800"
  }, "Buffer projet calcul\xE9 :"), ' ', formatWeeksValue(firstTimelineDetail.diff.diffInWeeks), ' ', "(", formatDaysValue(firstTimelineDetail.diff.diffInDays), ") entre la soumission et le lancement.") : /*#__PURE__*/React.createElement("div", {
    className: "bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 hv-surface",
    role: "status",
    "aria-live": "polite"
  }, "Les dates projet ne sont pas compl\xE8tes. Les exigences de d\xE9lais sont indiqu\xE9es \xE0 titre informatif."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, relevantTeams.map(team => {
    var timelineInfo = computeTeamTimeline(timelineByTeam, team.id);
    if (!timelineInfo) {
      return /*#__PURE__*/React.createElement("div", {
        key: team.id,
        className: "bg-white rounded-xl border border-gray-200 p-5 hv-surface"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "text-lg font-bold text-gray-800"
      }, team.name), /*#__PURE__*/React.createElement("span", {
        className: "px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200 hv-badge"
      }, "Pas d'exigence")), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600"
      }, "Aucun d\xE9lai sp\xE9cifique n'a \xE9t\xE9 configur\xE9 pour cette \xE9quipe dans le back-office."));
    }
    var statusClasses = timelineInfo.meetsAll ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200';
    return /*#__PURE__*/React.createElement("div", {
      key: team.id,
      className: "bg-white rounded-xl border border-gray-200 p-5 hv-surface",
      role: "article",
      "aria-label": "Exigences de d\xE9lai pour ".concat(team.name)
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, team.name), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500"
    }, team.expertise)), /*#__PURE__*/React.createElement("span", {
      className: "px-3 py-1 text-xs font-semibold rounded-full border ".concat(statusClasses, " self-start sm:self-auto")
    }, timelineInfo.meetsAll ? 'Délai suffisant' : 'Délai insuffisant')), /*#__PURE__*/React.createElement("div", {
      className: "bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3 hv-surface"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-medium text-gray-800"
    }, "Buffer actuel"), /*#__PURE__*/React.createElement("span", null, formatWeeksValue(timelineInfo.actualWeeks), " (", formatDaysValue(timelineInfo.actualDays), ")")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mt-2 sm:mt-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-gray-600"
    }, "Exigence la plus stricte"), /*#__PURE__*/React.createElement("span", null, formatWeeksValue(timelineInfo.strictestRequirement)))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, timelineInfo.entries.map(entry => {
      var _ref6, _entry$requiredWeeks;
      var requirementLabel = formatRequirementValue(entry);
      return /*#__PURE__*/React.createElement("div", {
        key: "".concat(entry.profileId, "-").concat((_ref6 = (_entry$requiredWeeks = entry.requiredWeeks) !== null && _entry$requiredWeeks !== void 0 ? _entry$requiredWeeks : entry.requiredDays) !== null && _ref6 !== void 0 ? _ref6 : 'req'),
        className: "border rounded-lg p-3 text-sm hv-surface ".concat(entry.satisfied ? 'border-green-200 bg-green-50 text-green-800' : 'border-orange-200 bg-orange-50 text-orange-800')
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-semibold"
      }, entry.profileLabel), /*#__PURE__*/React.createElement("span", {
        className: "font-mono text-xs"
      }, requirementLabel)), entry.description && /*#__PURE__*/React.createElement("p", {
        className: "text-xs opacity-80"
      }, renderTextWithLinks(entry.description)), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 text-xs font-semibold"
      }, entry.satisfied ? '✅ Délai respecté' : '⚠️ Prévoir un délai supplémentaire'));
    })));
  }))), /*#__PURE__*/React.createElement("section", {
    className: "mb-8",
    "aria-labelledby": "teams-heading"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "teams-heading",
    className: "text-2xl font-bold text-gray-800 mb-4 flex items-center"
  }, /*#__PURE__*/React.createElement(Users, {
    className: "w-6 h-6 mr-2 text-indigo-600"
  }), "\xC9quipes \xE0 solliciter (", relevantTeams.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, relevantTeams.map(team => {
    var _analysis$questions2;
    var teamPriority = getTeamPriority(analysis, team.id);
    var teamQuestions = (_analysis$questions2 = analysis.questions) === null || _analysis$questions2 === void 0 ? void 0 : _analysis$questions2[team.id];
    return /*#__PURE__*/React.createElement("div", {
      key: team.id,
      className: "bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all hv-surface",
      role: "article",
      "aria-label": "\xC9quipe ".concat(team.name)
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start mb-3"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-bold text-gray-800"
    }, team.name), /*#__PURE__*/React.createElement("span", {
      className: "px-3 py-1 rounded-full text-xs font-semibold border hv-badge ".concat(priorityColors[teamPriority])
    }, teamPriority)), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-3"
    }, renderTextWithLinks(team.expertise)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center text-sm text-gray-500"
    }, /*#__PURE__*/React.createElement(Calendar, {
      className: "w-4 h-4 mr-2"
    }), /*#__PURE__*/React.createElement("span", null, "\xC0 solliciter en phase de conception")), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-sm text-indigo-600 font-medium"
    }, "\uD83D\uDCE7 ", renderTextWithLinks(team.contact)), teamQuestions && /*#__PURE__*/React.createElement("div", {
      className: "mt-4"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-semibold text-gray-800 mb-2"
    }, "Points \xE0 pr\xE9parer :"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1"
    }, teamQuestions.map((question, idx) => /*#__PURE__*/React.createElement("li", {
      key: idx,
      className: "text-sm text-gray-700 flex"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-indigo-500 mr-2"
    }, "\u2022"), /*#__PURE__*/React.createElement("span", null, renderTextWithLinks(question)))))));
  }))), /*#__PURE__*/React.createElement("section", {
    "aria-labelledby": "risks-heading"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "risks-heading",
    className: "text-2xl font-bold text-gray-800 mb-4 flex items-center"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "w-6 h-6 mr-2 text-red-500"
  }), "Risques identifi\xE9s (", analysis.risks.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, analysis.risks.map((risk, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "p-4 rounded-xl border hv-surface ".concat(riskColors[risk.level]),
    role: "article",
    "aria-label": "Risque ".concat(risk.level)
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-2 mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-gray-700"
  }, risk.level), /*#__PURE__*/React.createElement("span", {
    className: "px-3 py-1 rounded-full text-xs font-semibold border hv-badge ".concat(priorityColors[risk.priority])
  }, risk.priority)), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-800 font-medium"
  }, renderTextWithLinks(risk.description)), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mt-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-gray-700"
  }, "Mitigation :"), ' ', renderTextWithLinks(risk.mitigation)))))))));
};