import React from '../react.js';
import { FileText, Calendar, Users, AlertTriangle, Send } from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';

const formatNumber = (value, options = {}) => {
  return Number(value).toLocaleString('fr-FR', options);
};

const formatWeeksValue = (weeks) => {
  if (weeks === undefined || weeks === null) {
    return '-';
  }

  const rounded = Math.round(weeks * 10) / 10;
  const hasDecimal = Math.abs(rounded - Math.round(rounded)) > 0.0001;

  return `${formatNumber(rounded, {
    minimumFractionDigits: hasDecimal ? 1 : 0,
    maximumFractionDigits: hasDecimal ? 1 : 0
  })} sem.`;
};

const formatDaysValue = (days) => {
  if (days === undefined || days === null) {
    return '-';
  }

  return `${formatNumber(Math.round(days))} j.`;
};

const formatRequirementValue = (requirement) => {
  if (requirement.requiredWeeks !== undefined) {
    return `${formatNumber(requirement.requiredWeeks)} sem.`;
  }

  if (requirement.requiredDays !== undefined) {
    return `${formatNumber(requirement.requiredDays)} j.`;
  }

  return '-';
};

const computeTeamTimeline = (timelineByTeam, teamId) => {
  const entries = timelineByTeam[teamId] || [];
  if (entries.length === 0) {
    return null;
  }

  const actualWeeks = entries[0].actualWeeks;
  const actualDays = entries[0].actualDays;
  const meetsAll = entries.every(entry => entry.satisfied);
  const strictestRequirement = entries.reduce((acc, entry) => {
    const requirementWeeks =
      entry.requiredWeeks !== undefined
        ? entry.requiredWeeks
        : entry.requiredDays !== undefined
          ? entry.requiredDays / 7
          : 0;

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

const extractProjectName = (answers, questions) => {
  if (!answers || !questions) {
    return '';
  }

  const preferredKeys = ['projectName', 'project_name', 'nomProjet', 'nom_projet'];

  for (const key of preferredKeys) {
    const value = answers[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  const matchingQuestion = questions.find(question => {
    if (!question || !question.question) {
      return false;
    }

    const text = question.question.toLowerCase();
    return text.includes('nom') && text.includes('projet') && typeof answers[question.id] === 'string' && answers[question.id].trim() !== '';
  });

  if (matchingQuestion) {
    return answers[matchingQuestion.id].trim();
  }

  return '';
};

const getTeamPriority = (analysis, teamId) => {
  if (!analysis) {
    return 'Recommandé';
  }

  const matchingRisk = analysis.risks.find(risk => analysis.questions?.[teamId]);
  return matchingRisk?.priority || 'Recommandé';
};

const escapeHtml = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildEmailBody = ({
  projectName,
  questions,
  answers,
  analysis,
  relevantTeams,
  timelineByTeam,
  timelineDetails
}) => {
  const lines = [];
  const title = projectName || 'Projet sans nom';

  const addSection = (label) => {
    if (lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push('');
    }
    const normalizedLabel = label.trim();
    lines.push(normalizedLabel);
    lines.push('-'.repeat(normalizedLabel.length));
  };

  const answeredQuestions = questions.filter(question => {
    const value = answers[question.id];
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

  lines.push(`Rapport de compliance – ${title}`);
  lines.push(`Complexité estimée : ${analysis.complexity}`);

  if (answeredQuestions.length > 0) {
    addSection("Vue d'ensemble du projet");
    answeredQuestions.forEach(question => {
      lines.push(`• ${question.question}`);
      lines.push(`  → ${formatAnswer(question, answers[question.id])}`);
    });
  }

  const firstTimelineDetail = timelineDetails.find(detail => detail.diff);
  const hasTimelineData = Object.keys(timelineByTeam).length > 0 || Boolean(firstTimelineDetail);

  if (hasTimelineData) {
    addSection('Délais compliance recommandés');

    if (firstTimelineDetail?.diff) {
      lines.push(
        `• Buffer projet : ${formatWeeksValue(firstTimelineDetail.diff.diffInWeeks)} (${formatDaysValue(firstTimelineDetail.diff.diffInDays)})`
      );
    } else {
      lines.push('• Dates projet incomplètes : les délais sont fournis à titre indicatif.');
    }

    relevantTeams.forEach(team => {
      const timelineInfo = computeTeamTimeline(timelineByTeam, team.id);

      lines.push('');
      lines.push(`Equipe : ${team.name}`);

      if (!timelineInfo) {
        lines.push("  • Aucune exigence de délai configurée");
        return;
      }

      lines.push(
        `  • Buffer actuel : ${formatWeeksValue(timelineInfo.actualWeeks)} (${formatDaysValue(timelineInfo.actualDays)})`
      );
      lines.push(`  • Exigence la plus stricte : ${formatWeeksValue(timelineInfo.strictestRequirement)}`);

      timelineInfo.entries.forEach(entry => {
        const status = entry.satisfied ? '✅ Délai respecté' : '⚠️ Délai insuffisant';
        const requirementLabel = formatRequirementValue(entry);
        lines.push(`    - ${entry.profileLabel} : ${requirementLabel} (${status})`);
      });
    });
  }

  if (relevantTeams.length > 0) {
    addSection('Équipes à mobiliser');
    relevantTeams.forEach(team => {
      const teamPriority = getTeamPriority(analysis, team.id);
      const contact = team.contact ? ` | Contact : ${team.contact}` : '';
      lines.push(`• ${team.name} — Priorité : ${teamPriority}${contact}`);

      const teamQuestions = analysis.questions?.[team.id] || [];
      if (Array.isArray(teamQuestions) && teamQuestions.length > 0) {
        lines.push('  Points à préparer :');
        teamQuestions.forEach(question => {
          lines.push(`    • ${question}`);
        });
      }
    });
  }

  if (analysis.risks.length > 0) {
    addSection('Risques identifiés et actions');
    analysis.risks.forEach(risk => {
      lines.push(`• ${risk.level} — Priorité : ${risk.priority}`);
      lines.push(`  Description : ${risk.description}`);
      lines.push(`  Mitigation : ${risk.mitigation}`);
    });
  }

  return lines.join('\n');
};

const buildEmailHtmlBody = ({
  projectName,
  questions,
  answers,
  analysis,
  relevantTeams,
  timelineByTeam,
  timelineDetails
}) => {
  const plainText = buildEmailBody({
    projectName,
    questions,
    answers,
    analysis,
    relevantTeams,
    timelineByTeam,
    timelineDetails
  });

  const escaped = escapeHtml(plainText)
    .split('\n\n')
    .map(section => section.replace(/\n/g, '<br/>'))
    .join('<br/><br/>');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /></head><body style="font-family: Arial, sans-serif; white-space: normal;">${escaped}</body></html>`;
};

const buildMailtoLink = ({ projectName, relevantTeams, emailBody }) => {
  const recipients = relevantTeams
    .map(team => (team.contact || '').trim())
    .filter(contact => contact.length > 0);

  const toField = recipients.join(',');
  const subject = projectName || 'Projet compliance';
  const params = new URLSearchParams();

  params.set('subject', subject);
  params.set('body', emailBody);

  const paramString = params.toString();
  const prefix = toField ? `mailto:${toField}` : 'mailto:';
  return `${prefix}?${paramString}`;
};

export const SynthesisReport = ({ answers, analysis, teams, questions, onRestart, onBack }) => {
  const relevantTeams = teams.filter(team => analysis.teams.includes(team.id));

  const priorityColors = {
    Critique: 'bg-red-100 text-red-800 border-red-300',
    Important: 'bg-orange-100 text-orange-800 border-orange-300',
    Recommandé: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const riskColors = {
    Élevé: 'bg-red-50 border-red-300 text-red-900',
    Moyen: 'bg-orange-50 border-orange-300 text-orange-900',
    Faible: 'bg-green-50 border-green-300 text-green-900'
  };

  const complexityColors = {
    Élevé: 'text-red-600',
    Moyen: 'text-orange-600',
    Faible: 'text-green-600'
  };

  const timelineByTeam = analysis?.timeline?.byTeam || {};
  const timelineDetails = analysis?.timeline?.details || [];
  const firstTimelineDetail = timelineDetails.find(detail => detail.diff);

  const hasTimelineData =
    Object.keys(timelineByTeam).length > 0 || Boolean(firstTimelineDetail);

  const projectName = extractProjectName(answers, questions);

  const handleSubmitByEmail = () => {
    const emailBody = buildEmailHtmlBody({
      projectName,
      questions,
      answers,
      analysis,
      relevantTeams,
      timelineByTeam,
      timelineDetails
    });

    const mailtoLink = buildMailtoLink({ projectName, relevantTeams, emailBody });
    if (typeof window !== 'undefined') {
      window.location.href = mailtoLink;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 hv-background">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 hv-surface" role="region" aria-label="Synthèse du projet">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Rapport de Compliance</h1>
            <div className="flex space-x-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-all hv-button hv-focus-ring"
                >
                  Retour au questionnaire
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmitByEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center hv-button hv-button-primary"
              >
                <Send className="w-4 h-4 mr-2" />
                Soumettre par e-mail
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all hv-button"
              >
                Nouveau projet
              </button>
            </div>
          </div>

          {/* Vue d'ensemble */}
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-200 hv-surface" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-indigo-600" />
              Vue d'ensemble du projet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q =>
                answers[q.id] ? (
                  <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200 hv-surface">
                    <p className="text-sm text-gray-600 mb-1">{q.question}</p>
                    <p className="font-semibold text-gray-900 whitespace-pre-line">
                      {renderTextWithLinks(formatAnswer(q, answers[q.id]))}
                    </p>
                  </div>
                ) : null
              )}
            </div>
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hv-surface" role="status" aria-live="polite">
              <span className="font-medium text-gray-700">Niveau de complexité compliance :</span>
              <span className={`text-xl font-bold ${complexityColors[analysis.complexity]}`}>
                {analysis.complexity}
              </span>
            </div>
          </section>

          {hasTimelineData && (
            <section className="mb-8" aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                Délais compliance recommandés
              </h2>
              {firstTimelineDetail?.diff ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 text-sm text-gray-700 hv-surface">
                  <span className="font-semibold text-gray-800">Buffer projet calculé :</span>{' '}
                  {formatWeeksValue(firstTimelineDetail.diff.diffInWeeks)}
                  {' '}({formatDaysValue(firstTimelineDetail.diff.diffInDays)}) entre la soumission et le lancement.
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 hv-surface" role="status" aria-live="polite">
                  Les dates projet ne sont pas complètes. Les exigences de délais sont indiquées à titre informatif.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantTeams.map(team => {
                  const timelineInfo = computeTeamTimeline(timelineByTeam, team.id);

                  if (!timelineInfo) {
                    return (
                      <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5 hv-surface">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200 hv-badge">
                            Pas d'exigence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Aucun délai spécifique n'a été configuré pour cette équipe dans le back-office.
                        </p>
                      </div>
                    );
                  }

                  const statusClasses = timelineInfo.meetsAll
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5 hv-surface" role="article" aria-label={`Exigences de délai pour ${team.name}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <p className="text-xs text-gray-500">{team.expertise}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses}`}>
                          {timelineInfo.meetsAll ? 'Délai suffisant' : 'Délai insuffisant'}
                        </span>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3 hv-surface">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">Buffer actuel</span>
                          <span>{formatWeeksValue(timelineInfo.actualWeeks)} ({formatDaysValue(timelineInfo.actualDays)})</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">Exigence la plus stricte</span>
                          <span>{formatWeeksValue(timelineInfo.strictestRequirement)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {timelineInfo.entries.map(entry => {
                          const requirementLabel = formatRequirementValue(entry);
                          return (
                            <div
                              key={`${entry.profileId}-${entry.requiredWeeks ?? entry.requiredDays ?? 'req'}`}
                              className={`border rounded-lg p-3 text-sm hv-surface ${entry.satisfied ? 'border-green-200 bg-green-50 text-green-800' : 'border-orange-200 bg-orange-50 text-orange-800'}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">{entry.profileLabel}</span>
                                <span className="font-mono text-xs">{requirementLabel}</span>
                              </div>
                              {entry.description && (
                                <p className="text-xs opacity-80">{renderTextWithLinks(entry.description)}</p>
                              )}
                              <div className="mt-2 text-xs font-semibold">
                                {entry.satisfied ? '✅ Délai respecté' : '⚠️ Prévoir un délai supplémentaire'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Équipes à solliciter */}
          <section className="mb-8" aria-labelledby="teams-heading">
            <h2 id="teams-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-indigo-600" />
              Équipes à solliciter ({relevantTeams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantTeams.map(team => {
                const teamPriority = getTeamPriority(analysis, team.id);
                const teamQuestions = analysis.questions?.[team.id];

                return (
                  <div key={team.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all hv-surface" role="article" aria-label={`Équipe ${team.name}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border hv-badge ${priorityColors[teamPriority]}`}>
                        {teamPriority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{renderTextWithLinks(team.expertise)}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>À solliciter en phase de conception</span>
                    </div>
                    <div className="mt-2 text-sm text-indigo-600 font-medium">
                      📧 {renderTextWithLinks(team.contact)}
                    </div>

                      {teamQuestions && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Points à préparer :</h4>
                          <ul className="space-y-1">
                            {teamQuestions.map((question, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>{renderTextWithLinks(question)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Risques identifiés */}
          <section aria-labelledby="risks-heading">
            <h2 id="risks-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
              Risques identifiés ({analysis.risks.length})
            </h2>
            <div className="space-y-3">
              {analysis.risks.map((risk, idx) => (
                <div key={idx} className={`p-4 rounded-xl border hv-surface ${riskColors[risk.level]}`} role="article" aria-label={`Risque ${risk.level}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{risk.level}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border hv-badge ${priorityColors[risk.priority]}`}>
                      {risk.priority}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{renderTextWithLinks(risk.description)}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-gray-700">Mitigation :</span>{' '}
                    {renderTextWithLinks(risk.mitigation)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

