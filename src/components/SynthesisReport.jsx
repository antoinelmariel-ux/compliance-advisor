import React from '../react.js';
import { FileText, Calendar, Users, AlertTriangle } from './icons.js';
import { formatAnswer } from '../utils/questions.js';
import { renderTextWithLinks } from '../utils/linkify.js';

export const SynthesisReport = ({ answers, analysis, teams, questions, onRestart }) => {
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

  const computeTeamTimeline = (teamId) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Rapport de Compliance</h1>
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all"
            >
              Nouveau projet
            </button>
          </div>

          {/* Vue d'ensemble */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-indigo-600" />
              Vue d'ensemble du projet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q =>
                answers[q.id] ? (
                  <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">{q.question}</p>
                    <p className="font-semibold text-gray-900 whitespace-pre-line">
                      {renderTextWithLinks(formatAnswer(q, answers[q.id]))}
                    </p>
                  </div>
                ) : null
              )}
            </div>
            <div className="mt-6 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
              <span className="font-medium text-gray-700">Niveau de complexité compliance :</span>
              <span className={`text-xl font-bold ${complexityColors[analysis.complexity]}`}>
                {analysis.complexity}
              </span>
            </div>
          </div>

          {hasTimelineData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                Délais compliance recommandés
              </h2>
              {firstTimelineDetail?.diff ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Buffer projet calculé :</span>{' '}
                  {formatWeeksValue(firstTimelineDetail.diff.diffInWeeks)}
                  {' '}({formatDaysValue(firstTimelineDetail.diff.diffInDays)}) entre la soumission et le lancement.
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
                  Les dates projet ne sont pas complètes. Les exigences de délais sont indiquées à titre informatif.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantTeams.map(team => {
                  const timelineInfo = computeTeamTimeline(team.id);

                  if (!timelineInfo) {
                    return (
                      <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
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
                    <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                          <p className="text-xs text-gray-500">{team.expertise}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses}`}>
                          {timelineInfo.meetsAll ? 'Délai suffisant' : 'Délai insuffisant'}
                        </span>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3">
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
                              className={`border rounded-lg p-3 text-sm ${entry.satisfied ? 'border-green-200 bg-green-50 text-green-800' : 'border-orange-200 bg-orange-50 text-orange-800'}`}
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
            </div>
          )}

          {/* Équipes à solliciter */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-indigo-600" />
              Équipes à solliciter ({relevantTeams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantTeams.map(team => {
                const teamPriority = analysis.risks.find(r => analysis.questions[team.id])?.priority || 'Recommandé';

                return (
                  <div key={team.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[teamPriority]}`}>
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

                    {analysis.questions[team.id] && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Points à préparer :</h4>
                        <ul className="space-y-1">
                          {analysis.questions[team.id].map((question, idx) => (
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
          </div>

          {/* Risques identifiés */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
              Risques identifiés ({analysis.risks.length})
            </h2>
            <div className="space-y-3">
              {analysis.risks.map((risk, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${riskColors[risk.level]}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{risk.level}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[risk.priority]}`}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

