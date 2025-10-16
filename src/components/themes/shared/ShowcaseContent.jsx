import React from '../../../react.js';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const ShowcaseContent = ({
  data = {},
  themeSwitch = {},
  onClose,
  renderInStandalone = false,
  classNames: classNamesOverrides = {},
  serializedPayload = '{}'
}) => {
  const themeId = themeSwitch?.selected || data?.theme || 'apple';

  const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {};
  const eyebrow = isNonEmptyString(meta.eyebrow) ? meta.eyebrow : 'Vitrine du projet';
  const projectName = isNonEmptyString(data?.projectName) ? data.projectName : 'Votre projet';
  const slogan = isNonEmptyString(data?.slogan) ? data.slogan : null;
  const highlights = Array.isArray(data?.highlights) ? data.highlights : [];
  const audienceItems = Array.isArray(data?.audience?.items) ? data.audience.items : [];

  const sections = data?.sections || {};
  const problemPainPoints = Array.isArray(sections?.problem?.painPoints)
    ? sections.problem.painPoints
    : [];

  const solution = sections?.solution || {};
  const solutionDescription = isNonEmptyString(solution.description) ? solution.description : null;
  const solutionBenefits = Array.isArray(solution.benefits) ? solution.benefits : [];
  const solutionComparison = isNonEmptyString(solution.comparison) ? solution.comparison : null;

  const team = sections?.team || {};
  const teamLead = isNonEmptyString(team.lead) ? team.lead : null;
  const teamCoreMembers = Array.isArray(team.coreMembers) ? team.coreMembers : [];
  const relevantTeams = Array.isArray(team.relevantTeams) ? team.relevantTeams : [];

  const timeline = sections?.timeline || {};
  const runway = timeline?.runway || null;
  const timelineSummary = timeline?.summary || null;
  const timelineDetails = Array.isArray(timeline?.details) ? timeline.details : [];

  const analysis = sections?.analysis || {};
  const complexity = analysis?.complexity || null;
  const analysisSummary = isNonEmptyString(analysis?.summary) ? analysis.summary : null;
  const primaryRisk = analysis?.primaryRisk || null;
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const opportunities = Array.isArray(analysis?.opportunities) ? analysis.opportunities : [];

  const missingQuestions = Array.isArray(data?.missingQuestions) ? data.missingQuestions : [];

  const classDefaults = {
    article: '',
    card: '',
    body: '',
    heroSection: 'animate-on-scroll',
    heroHighlights: '',
    audienceSection: 'animate-on-scroll',
    problemSection: 'animate-on-scroll',
    solutionSection: 'animate-on-scroll',
    teamSection: 'animate-on-scroll',
    timelineSection: 'animate-on-scroll',
    analysisSection: 'animate-on-scroll',
    opportunitiesSection: 'animate-on-scroll',
    missingSection: 'animate-on-scroll',
    actionsSection: 'animate-on-scroll'
  };

  const classes = { ...classDefaults, ...(classNamesOverrides || {}) };
  const getClass = (key) => (classes[key] ? classes[key] : undefined);

  return (
    <article
      data-component="project-showcase"
      data-theme={themeId}
      data-standalone={renderInStandalone ? 'true' : 'false'}
      className={getClass('article')}
    >
      <div data-showcase-card className={getClass('card')}>
        <div data-showcase-overlay aria-hidden="true" />
        <div data-showcase-body className={getClass('body')}>
          <header
            data-section="hero"
            data-showcase-section="hero"
            className={getClass('heroSection')}
          >
            <div data-role="hero-header">
              <p data-role="eyebrow">{eyebrow}</p>
              <h1 data-field="project-name">{projectName}</h1>
              {slogan ? <p data-field="project-slogan">{slogan}</p> : null}
            </div>
            {highlights.length > 0 ? (
              <div data-role="hero-highlights" className={getClass('heroHighlights')}>
                {highlights.map((highlight) => (
                  <article
                    key={highlight.id}
                    data-showcase-element="hero-highlight"
                    data-highlight={highlight.id}
                  >
                    <h3 data-role="label">{highlight.label}</h3>
                    <p data-role="value">{highlight.value}</p>
                    {highlight.caption ? <p data-role="caption">{highlight.caption}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </header>

          {audienceItems.length > 0 ? (
            <section
              data-section="audience"
              data-showcase-section="audience"
              className={getClass('audienceSection')}
            >
              <h2>Audiences cibles</h2>
              <ul data-field="target-audience" data-role="tag-list">
                {audienceItems.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {problemPainPoints.length > 0 ? (
            <section
              data-section="problem"
              data-showcase-section="problem"
              className={getClass('problemSection')}
            >
              <h2>Problèmes identifiés</h2>
              <ul data-field="problem-pain-points">
                {problemPainPoints.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {(solutionDescription || solutionBenefits.length > 0 || solutionComparison) ? (
            <section
              data-section="solution"
              data-showcase-section="solution"
              className={getClass('solutionSection')}
            >
              <h2>Proposition de valeur</h2>
              <div data-role="split-layout">
                {solutionDescription ? (
                  <article data-showcase-element="solution-card">
                    <h3>Description</h3>
                    <p data-field="solution-description">{solutionDescription}</p>
                  </article>
                ) : null}
                {solutionBenefits.length > 0 ? (
                  <article data-showcase-element="solution-card">
                    <h3>Bénéfices clés</h3>
                    <ul data-field="solution-benefits">
                      {solutionBenefits.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ) : null}
                {solutionComparison ? (
                  <article data-showcase-element="solution-card">
                    <h3>Différenciation</h3>
                    <p data-field="solution-comparison">{solutionComparison}</p>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          {(teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0) ? (
            <section
              data-section="team"
              data-showcase-section="team"
              className={getClass('teamSection')}
            >
              <h2>Équipe</h2>
              <div data-role="team-grid">
                {(teamLead || teamCoreMembers.length > 0) ? (
                  <article data-showcase-element="team-profile">
                    <h3>Leadership</h3>
                    {teamLead ? <p data-field="team-lead">{teamLead}</p> : null}
                    {teamCoreMembers.length > 0 ? (
                      <ul data-field="team-core-members">
                        {teamCoreMembers.map((member, index) => (
                          <li key={`${member}-${index}`}>{member}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ) : null}
                {relevantTeams.length > 0 ? (
                  <article data-showcase-element="team-profile" data-showcase-aside="team-profile">
                    <h3>Experts mobilisables</h3>
                    <div data-role="team-list">
                      {relevantTeams.map((teamEntry, index) => (
                        <div key={teamEntry.id || teamEntry.name || index} data-role="team-card">
                          <h4 data-role="team-name">{teamEntry.name || 'Équipe'}</h4>
                          {isNonEmptyString(teamEntry.expertise) ? (
                            <p data-role="team-expertise">{teamEntry.expertise}</p>
                          ) : null}
                          {isNonEmptyString(teamEntry.contact) ? (
                            <p data-role="team-contact">{teamEntry.contact}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          {(runway || timelineSummary || timelineDetails.length > 0) ? (
            <section
              data-section="timeline"
              data-showcase-section="timeline"
              className={getClass('timelineSection')}
            >
              <h2>Feuille de route</h2>
              <div data-role="split-layout">
                {runway ? (
                  <article data-showcase-element="timeline-profile">
                    <h3>Période clef</h3>
                    <p data-field="timeline-runway">
                      {`Du ${runway.startLabel} au ${runway.endLabel} (${runway.weeksLabel}, ${runway.daysLabel})`}
                    </p>
                  </article>
                ) : null}
                {timelineSummary ? (
                  <article data-showcase-element="timeline-profile">
                    <h3>Conformité</h3>
                    <p data-field="timeline-summary">
                      {timelineSummary.ruleName ? `${timelineSummary.ruleName} : ` : ''}
                      {timelineSummary.satisfied ? 'Conformité atteinte' : 'Conformité non atteinte'}
                      {timelineSummary.weeks ? ` (${timelineSummary.weeks} sem., ${timelineSummary.days} jours)` : ''}
                    </p>
                    {Array.isArray(timelineSummary.profiles) && timelineSummary.profiles.length > 0 ? (
                      <ul data-role="tag-list">
                        {timelineSummary.profiles.map((profile) => (
                          <li
                            key={profile.id || profile.label}
                            title={profile.description || undefined}
                            aria-label={profile.description ? `${profile.label} — ${profile.description}` : profile.label}
                          >
                            {profile.label}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ) : null}
                {timelineDetails.length > 0 ? (
                  <article data-showcase-element="timeline-profile">
                    <h3>Jalons clés</h3>
                    <ul data-field="timeline-details" data-role="timeline-list">
                      {timelineDetails.map((detail, index) => (
                        <li key={detail.ruleId || detail.ruleName || index}>
                          <span>{detail.ruleName || 'Règle'}</span>
                          {detail?.diff?.diffInWeeks ? (
                            <span>
                              {`${Math.round(detail.diff.diffInWeeks)} sem.`}
                              {detail.diff.diffInDays ? ` · ${Math.round(detail.diff.diffInDays)} jours` : ''}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          {(complexity || analysisSummary || primaryRisk || risks.length > 0) ? (
            <section
              data-section="analysis"
              data-showcase-section="analysis"
              className={getClass('analysisSection')}
            >
              <h2>Analyse de conformité</h2>
              <div data-role="split-layout">
                {complexity ? (
                  <article data-showcase-element="metric-card">
                    <h3>Niveau de complexité</h3>
                    <p data-field="analysis-complexity">{complexity}</p>
                  </article>
                ) : null}
                {analysisSummary ? (
                  <article data-showcase-element="metric-card">
                    <h3>Résumé</h3>
                    <p data-field="analysis-summary">{analysisSummary}</p>
                  </article>
                ) : null}
                {primaryRisk ? (
                  <article data-showcase-element="metric-card" data-element="primary-risk">
                    <h3>Risque principal</h3>
                    {primaryRisk.priority ? (
                      <p data-field="primary-risk-priority">{primaryRisk.priority}</p>
                    ) : null}
                    {isNonEmptyString(primaryRisk.description) ? (
                      <p data-field="primary-risk-description">{primaryRisk.description}</p>
                    ) : null}
                    {isNonEmptyString(primaryRisk.mitigation) ? (
                      <p data-field="primary-risk-mitigation">{primaryRisk.mitigation}</p>
                    ) : null}
                  </article>
                ) : null}
                {risks.length > 0 ? (
                  <article data-showcase-element="metric-card" data-element="risk-list">
                    <h3>Risques identifiés</h3>
                    <ul data-role="risk-list">
                      {risks.map((risk, index) => (
                        <li key={risk.id || risk.ruleId || index}>
                          <span data-role="risk-title">{risk.title || risk.name || `Risque ${index + 1}`}</span>
                          {risk.priority ? <span data-role="risk-priority"> — {risk.priority}</span> : null}
                          {isNonEmptyString(risk.description) ? (
                            <p data-role="risk-description">{risk.description}</p>
                          ) : null}
                          {isNonEmptyString(risk.mitigation) ? (
                            <p data-role="risk-mitigation">{risk.mitigation}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          {opportunities.length > 0 ? (
            <section
              data-section="opportunities"
              data-showcase-section="opportunities"
              className={getClass('opportunitiesSection')}
            >
              <h2>Opportunités</h2>
              <ul data-role="opportunity-list">
                {opportunities.map((opportunity, index) => (
                  <li key={opportunity.id || index}>
                    <span data-role="opportunity-title">
                      {opportunity.title || opportunity.name || `Opportunité ${index + 1}`}
                    </span>
                    {isNonEmptyString(opportunity.description) ? (
                      <p data-role="opportunity-description">{opportunity.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {missingQuestions.length > 0 ? (
            <section
              data-section="missing-questions"
              data-showcase-section="missing-questions"
              className={getClass('missingSection')}
            >
              <h2>Questions manquantes pour la vitrine</h2>
              <ul data-role="tag-list">
                {missingQuestions.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {typeof onClose === 'function' ? (
            <section
              data-section="actions"
              data-showcase-section="actions"
              className={getClass('actionsSection')}
            >
              <div data-role="actions">
                <button type="button" data-action="close" onClick={onClose}>
                  Revenir à l'application
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <script
        type="application/json"
        data-project-showcase-payload
        dangerouslySetInnerHTML={{ __html: serializedPayload }}
      />
    </article>
  );
};

