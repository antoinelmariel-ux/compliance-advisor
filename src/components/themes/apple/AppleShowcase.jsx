import React from '../../../react.js';
import { AppleShowcaseContainer } from '../ThemeContainers.jsx';
import { useShowcaseAnimations } from '../shared/useShowcaseAnimations.js';

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const sanitizeHighlight = (highlight, index) => {
  if (!highlight || typeof highlight !== 'object') {
    return null;
  }

  const label = hasText(highlight.label) ? highlight.label.trim() : null;
  const value = hasText(highlight.value) ? highlight.value.trim() : null;
  const caption = hasText(highlight.caption) ? highlight.caption.trim() : null;

  if (!label || !value) {
    return null;
  }

  return {
    id: hasText(highlight.id) ? highlight.id : `highlight-${index}`,
    label,
    value,
    caption
  };
};

const sanitizeStringList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (entry && typeof entry === 'object' && hasText(entry.label)) {
        return entry.label.trim();
      }
      return null;
    })
    .filter(Boolean);
};

const sanitizeRelevantTeams = (teams) => {
  if (!Array.isArray(teams)) {
    return [];
  }

  return teams
    .map((team, index) => {
      if (!team || typeof team !== 'object') {
        return null;
      }

      const name = hasText(team.name) ? team.name.trim() : null;
      const expertise = hasText(team.expertise) ? team.expertise.trim() : null;
      const contact = hasText(team.contact) ? team.contact.trim() : null;

      if (!name && !expertise && !contact) {
        return null;
      }

      return {
        id: hasText(team.id) ? team.id : `team-${index}`,
        name,
        expertise,
        contact
      };
    })
    .filter(Boolean);
};

const sanitizeTimelineDetails = (details) => {
  if (!Array.isArray(details)) {
    return [];
  }

  return details
    .map((detail, index) => {
      if (!detail || typeof detail !== 'object') {
        return null;
      }

      const ruleName = hasText(detail.ruleName)
        ? detail.ruleName.trim()
        : hasText(detail.title)
          ? detail.title.trim()
          : null;

      const diff = detail.diff && typeof detail.diff === 'object'
        ? {
            weeks: typeof detail.diff.diffInWeeks === 'number'
              ? Math.round(detail.diff.diffInWeeks)
              : null,
            days: typeof detail.diff.diffInDays === 'number'
              ? Math.round(detail.diff.diffInDays)
              : null
          }
        : null;

      return {
        id: hasText(detail.ruleId)
          ? detail.ruleId
          : `timeline-detail-${index}`,
        ruleName: ruleName || `Jalon ${index + 1}`,
        diff
      };
    })
    .filter(Boolean);
};

const sanitizeRisks = (risks) => {
  if (!Array.isArray(risks)) {
    return [];
  }

  return risks
    .map((risk, index) => {
      if (!risk || typeof risk !== 'object') {
        return null;
      }

      const title = hasText(risk.title)
        ? risk.title.trim()
        : hasText(risk.name)
          ? risk.name.trim()
          : `Risque ${index + 1}`;
      const description = hasText(risk.description) ? risk.description.trim() : null;
      const mitigation = hasText(risk.mitigation) ? risk.mitigation.trim() : null;
      const priority = hasText(risk.priority) ? risk.priority.trim() : null;

      return {
        id: hasText(risk.id) ? risk.id : hasText(risk.ruleId) ? risk.ruleId : `risk-${index}`,
        title,
        description,
        mitigation,
        priority
      };
    })
    .filter(Boolean);
};

const sanitizeOpportunities = (opportunities) => {
  if (!Array.isArray(opportunities)) {
    return [];
  }

  return opportunities
    .map((opportunity, index) => {
      if (!opportunity || typeof opportunity !== 'object') {
        return null;
      }

      const title = hasText(opportunity.title)
        ? opportunity.title.trim()
        : hasText(opportunity.name)
          ? opportunity.name.trim()
          : `Opportunité ${index + 1}`;
      const description = hasText(opportunity.description) ? opportunity.description.trim() : null;

      return {
        id: hasText(opportunity.id) ? opportunity.id : `opportunity-${index}`,
        title,
        description
      };
    })
    .filter(Boolean);
};

const sanitizeMissingQuestions = (missingQuestions) => {
  if (!Array.isArray(missingQuestions)) {
    return [];
  }

  return missingQuestions
    .map((questionId) => (hasText(questionId) ? questionId.trim() : null))
    .filter(Boolean);
};

export const AppleShowcase = ({
  data = {},
  themeSwitch = {},
  onClose,
  renderInStandalone,
  serializedPayload = '{}'
}) => {
  useShowcaseAnimations([data, themeSwitch?.selected]);

  const themeId = themeSwitch?.selected || data?.theme || 'apple';

  const projectName = hasText(data?.projectName) ? data.projectName : 'Votre projet';
  const slogan = hasText(data?.slogan) ? data.slogan : null;

  const heroHighlights = Array.isArray(data?.highlights)
    ? data.highlights
        .map((highlight, index) => sanitizeHighlight(highlight, index))
        .filter(Boolean)
    : [];

  const audienceItems = sanitizeStringList(data?.audience?.items);
  const audienceSummary = hasText(data?.audience?.summary) ? data.audience.summary.trim() : null;

  const sections = data?.sections || {};

  const problemPainPoints = sanitizeStringList(sections?.problem?.painPoints);

  const solutionDescription = hasText(sections?.solution?.description)
    ? sections.solution.description.trim()
    : null;
  const solutionBenefits = sanitizeStringList(sections?.solution?.benefits);
  const solutionComparison = hasText(sections?.solution?.comparison)
    ? sections.solution.comparison.trim()
    : null;

  const innovationProcess = hasText(sections?.innovation?.process)
    ? sections.innovation.process.trim()
    : null;
  const visionStatement = hasText(sections?.innovation?.vision)
    ? sections.innovation.vision.trim()
    : null;

  const teamLead = hasText(sections?.team?.lead) ? sections.team.lead.trim() : null;
  const teamCoreMembers = sanitizeStringList(sections?.team?.coreMembers);
  const relevantTeams = sanitizeRelevantTeams(sections?.team?.relevantTeams);

  const runway = sections?.timeline?.runway || null;
  const timelineSummary = sections?.timeline?.summary || null;
  const timelineDetails = sanitizeTimelineDetails(sections?.timeline?.details);

  const complexity = sections?.analysis?.complexity || null;
  const analysisSummary = hasText(sections?.analysis?.summary)
    ? sections.analysis.summary.trim()
    : null;
  const primaryRisk = sections?.analysis?.primaryRisk && typeof sections.analysis.primaryRisk === 'object'
    ? {
        priority: hasText(sections.analysis.primaryRisk.priority)
          ? sections.analysis.primaryRisk.priority.trim()
          : null,
        description: hasText(sections.analysis.primaryRisk.description)
          ? sections.analysis.primaryRisk.description.trim()
          : null,
        mitigation: hasText(sections.analysis.primaryRisk.mitigation)
          ? sections.analysis.primaryRisk.mitigation.trim()
          : null
      }
    : null;
  const risks = sanitizeRisks(sections?.analysis?.risks);

  const opportunities = sanitizeOpportunities(sections?.analysis?.opportunities);
  const missingQuestions = sanitizeMissingQuestions(data?.missingQuestions);

  const hasActions = typeof onClose === 'function';

  const navSections = [
    { id: 'audience', label: 'Audiences', visible: audienceItems.length > 0 },
    { id: 'problem', label: 'Problématique', visible: problemPainPoints.length > 0 },
    {
      id: 'solution',
      label: 'Solution',
      visible: Boolean(solutionDescription || solutionBenefits.length > 0 || solutionComparison)
    },
    {
      id: 'innovation',
      label: 'Innovation',
      visible: Boolean(innovationProcess || visionStatement)
    },
    {
      id: 'team',
      label: 'Équipe',
      visible: Boolean(teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0)
    },
    {
      id: 'timeline',
      label: 'Feuille de route',
      visible: Boolean(runway || timelineSummary || timelineDetails.length > 0)
    },
    {
      id: 'analysis',
      label: 'Analyse',
      visible: Boolean(complexity || analysisSummary || primaryRisk || risks.length > 0)
    },
    {
      id: 'opportunities',
      label: 'Opportunités',
      visible: opportunities.length > 0
    },
    {
      id: 'questions',
      label: 'Questions clés',
      visible: missingQuestions.length > 0
    },
    {
      id: 'actions',
      label: 'Actions',
      visible: hasActions
    }
  ].filter((section) => section.visible);

  return (
    <AppleShowcaseContainer renderInStandalone={renderInStandalone}>
      <article
        data-component="project-showcase"
        data-theme={themeId}
        data-standalone={renderInStandalone ? 'true' : 'false'}
        className="apple-showcase-surface apple-aura-surface"
      >
        <div data-showcase-card className="apple-showcase-panel apple-aura-panel">
          <div data-showcase-overlay aria-hidden="true" />
          <div data-showcase-body className="apple-showcase-body apple-aura-body">
            <div className="apple-aura" data-showcase-layout="aura">
              <header className="hero apple-aura__hero-section animate-on-scroll apple-parallax" id="top">
                <div className="hero__badge" aria-label="Showcase Aura">
                  <span aria-hidden="true" className="hero__badge-dot" />
                  <span>Showcase Aura</span>
                </div>
                <h1 className="hero__title" data-field="project-name">
                  {projectName}
                </h1>
                {slogan ? (
                  <p className="hero__subtitle" data-field="project-slogan">
                    {slogan}
                  </p>
                ) : null}

                {heroHighlights.length > 0 ? (
                  <div className="hero__metrics metrics">
                    {heroHighlights.map((highlight) => (
                      <div className="metric" key={highlight.id} data-highlight={highlight.id}>
                        <span className="metric__value">{highlight.value}</span>
                        <span className="metric__label">{highlight.label}</span>
                        {highlight.caption ? (
                          <p className="metric__caption">{highlight.caption}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {navSections.length > 0 ? (
                  <nav className="apple-aura__nav" aria-label="Navigation des sections">
                    {navSections.map((section) => (
                      <a key={section.id} className="apple-aura__nav-link" href={`#${section.id}`}>
                        {section.label}
                      </a>
                    ))}
                  </nav>
                ) : null}
              </header>

              <main className="apple-aura__main">
                {audienceItems.length > 0 ? (
                  <section
                    id="audience"
                    data-showcase-section="audience"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Audiences cibles</h2>
                      {audienceSummary ? (
                        <p className="section__lead">{audienceSummary}</p>
                      ) : null}
                    </header>
                    <ul className="tag-list" data-role="tag-list">
                      {audienceItems.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {problemPainPoints.length > 0 ? (
                  <section
                    id="problem"
                    data-showcase-section="problem"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Problématique</h2>
                      <p className="section__lead">
                        Les irritants actuels à adresser avant le lancement.
                      </p>
                    </header>
                    <ul className="grid grid--two" data-field="problem-pain-points">
                      {problemPainPoints.map((point, index) => (
                        <li key={`${point}-${index}`} className="card">
                          <p>{point}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {solutionDescription || solutionBenefits.length > 0 || solutionComparison ? (
                  <section
                    id="solution"
                    data-showcase-section="solution"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Proposition de valeur</h2>
                      <p className="section__lead">
                        Une narration orchestrée pour délivrer l'expérience Aura sur tous les canaux.
                      </p>
                    </header>
                    <div className="grid grid--three">
                      {solutionDescription ? (
                        <article className="card" data-showcase-element="solution-card">
                          <h3>Description</h3>
                          <p>{solutionDescription}</p>
                        </article>
                      ) : null}
                      {solutionBenefits.length > 0 ? (
                        <article className="card" data-showcase-element="solution-card">
                          <h3>Bénéfices clés</h3>
                          <ul>
                            {solutionBenefits.map((benefit, index) => (
                              <li key={`${benefit}-${index}`}>{benefit}</li>
                            ))}
                          </ul>
                        </article>
                      ) : null}
                      {solutionComparison ? (
                        <article className="card" data-showcase-element="solution-card">
                          <h3>Différenciation</h3>
                          <p>{solutionComparison}</p>
                        </article>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {innovationProcess || visionStatement ? (
                  <section
                    id="innovation"
                    data-showcase-section="innovation"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Innovation &amp; vision</h2>
                      <p className="section__lead">
                        Cadrez la démarche et la vision long terme qui guident l'expérience Aura.
                      </p>
                    </header>
                    <div className="grid grid--two">
                      {innovationProcess ? (
                        <article className="card" data-showcase-element="vision-card">
                          <h3>Approche</h3>
                          <p>{innovationProcess}</p>
                        </article>
                      ) : null}
                      {visionStatement ? (
                        <article className="card" data-showcase-element="vision-card">
                          <h3>Vision</h3>
                          <p>{visionStatement}</p>
                        </article>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {teamLead || teamCoreMembers.length > 0 || relevantTeams.length > 0 ? (
                  <section
                    id="team"
                    data-showcase-section="team"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Équipe projet</h2>
                      <p className="section__lead">
                        Les talents mobilisés pour déployer la campagne Aura.
                      </p>
                    </header>
                    <div className="grid grid--two">
                      {teamLead || teamCoreMembers.length > 0 ? (
                        <article className="card" data-showcase-element="team-profile">
                          <h3>Leadership</h3>
                          {teamLead ? <p className="card__lead">{teamLead}</p> : null}
                          {teamCoreMembers.length > 0 ? (
                            <ul>
                              {teamCoreMembers.map((member, index) => (
                                <li key={`${member}-${index}`}>{member}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      ) : null}
                      {relevantTeams.length > 0 ? (
                        <article className="card" data-showcase-element="team-profile">
                          <h3>Experts mobilisables</h3>
                          <ul className="stacked-list">
                            {relevantTeams.map((team) => (
                              <li key={team.id}>
                                {team.name ? <span className="stacked-list__title">{team.name}</span> : null}
                                {team.expertise ? (
                                  <p className="stacked-list__description">{team.expertise}</p>
                                ) : null}
                                {team.contact ? (
                                  <p className="stacked-list__meta">{team.contact}</p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </article>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {runway || timelineSummary || timelineDetails.length > 0 ? (
                  <section
                    id="timeline"
                    data-showcase-section="timeline"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Feuille de route</h2>
                      <p className="section__lead">
                        Les jalons clés pour assurer la conformité et la mise sur le marché.
                      </p>
                    </header>
                    <div className="timeline">
                      {runway ? (
                        <div className="timeline__item">
                          <span className="timeline__period">Runway</span>
                          <p>
                            {`Du ${runway.startLabel} au ${runway.endLabel} (${runway.weeksLabel}, ${runway.daysLabel})`}
                          </p>
                        </div>
                      ) : null}
                      {timelineSummary ? (
                        <div className="timeline__item">
                          <span className="timeline__period">Conformité</span>
                          <p>
                            {timelineSummary.ruleName ? `${timelineSummary.ruleName} : ` : ''}
                            {timelineSummary.satisfied ? 'Conformité atteinte' : 'Conformité non atteinte'}
                          </p>
                          {timelineSummary.weeks ? (
                            <p className="timeline__meta">
                              {`${timelineSummary.weeks} sem., ${timelineSummary.days} jours`}
                            </p>
                          ) : null}
                          {Array.isArray(timelineSummary.profiles) && timelineSummary.profiles.length > 0 ? (
                            <ul className="tag-list">
                              {timelineSummary.profiles.map((profile) => (
                                <li key={profile.id}>{profile.label}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                      {timelineDetails.length > 0 ? (
                        <div className="timeline__item">
                          <span className="timeline__period">Jalons</span>
                          <ul className="stacked-list">
                            {timelineDetails.map((detail) => (
                              <li key={detail.id}>
                                <span className="stacked-list__title">{detail.ruleName}</span>
                                {detail.diff && (detail.diff.weeks || detail.diff.days) ? (
                                  <p className="stacked-list__meta">
                                    {detail.diff.weeks ? `${detail.diff.weeks} sem.` : ''}
                                    {detail.diff.weeks && detail.diff.days ? ' · ' : ''}
                                    {detail.diff.days ? `${detail.diff.days} jours` : ''}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {complexity || analysisSummary || primaryRisk || risks.length > 0 ? (
                  <section
                    id="analysis"
                    data-showcase-section="analysis"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Analyse de conformité</h2>
                      <p className="section__lead">
                        Synthèse des risques et du niveau d'effort pour sécuriser le lancement.
                      </p>
                    </header>
                    <div className="grid grid--two">
                      {complexity ? (
                        <article className="card">
                          <h3>Niveau de complexité</h3>
                          <p className="metric__value">{complexity}</p>
                        </article>
                      ) : null}
                      {analysisSummary ? (
                        <article className="card">
                          <h3>Résumé</h3>
                          <p>{analysisSummary}</p>
                        </article>
                      ) : null}
                      {primaryRisk ? (
                        <article className="card">
                          <h3>Risque principal</h3>
                          {primaryRisk.priority ? (
                            <p className="metric__label">{primaryRisk.priority}</p>
                          ) : null}
                          {primaryRisk.description ? (
                            <p>{primaryRisk.description}</p>
                          ) : null}
                          {primaryRisk.mitigation ? (
                            <p className="stacked-list__meta">{primaryRisk.mitigation}</p>
                          ) : null}
                        </article>
                      ) : null}
                      {risks.length > 0 ? (
                        <article className="card">
                          <h3>Risques identifiés</h3>
                          <ul className="stacked-list">
                            {risks.map((risk) => (
                              <li key={risk.id}>
                                <span className="stacked-list__title">{risk.title}</span>
                                {risk.priority ? (
                                  <span className="stacked-list__meta">{risk.priority}</span>
                                ) : null}
                                {risk.description ? (
                                  <p className="stacked-list__description">{risk.description}</p>
                                ) : null}
                                {risk.mitigation ? (
                                  <p className="stacked-list__meta">{risk.mitigation}</p>
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
                    id="opportunities"
                    data-showcase-section="opportunities"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Opportunités</h2>
                      <p className="section__lead">
                        Les leviers activables pour amplifier l'impact du lancement.
                      </p>
                    </header>
                    <ul className="grid grid--two">
                      {opportunities.map((opportunity) => (
                        <li key={opportunity.id} className="card">
                          <h3>{opportunity.title}</h3>
                          {opportunity.description ? <p>{opportunity.description}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {missingQuestions.length > 0 ? (
                  <section
                    id="questions"
                    data-showcase-section="missing-questions"
                    className="apple-aura__section animate-on-scroll"
                  >
                    <header>
                      <h2 className="section__headline">Questions manquantes</h2>
                      <p className="section__lead">
                        Identifiez les informations à collecter pour compléter la vitrine Aura.
                      </p>
                    </header>
                    <ul className="tag-list">
                      {missingQuestions.map((questionId) => (
                        <li key={questionId}>{questionId}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {hasActions ? (
                  <section
                    id="actions"
                    data-showcase-section="actions"
                    className="apple-aura__section apple-aura__section--actions animate-on-scroll"
                  >
                    <div className="apple-aura__actions">
                      <button type="button" data-action="close" onClick={onClose}>
                        Revenir à l'application
                      </button>
                    </div>
                  </section>
                ) : null}
              </main>

              <footer className="apple-aura__footer">
                <div className="footer__content">
                  <p className="footer__meta">Campagne Aura — Version 0.1.3 — Données showcase complétées</p>
                  <p className="footer__meta">Thème Apple — Build v1.0.52</p>
                </div>
              </footer>
            </div>
          </div>
        </div>

        <script
          type="application/json"
          data-project-showcase-payload
          dangerouslySetInnerHTML={{ __html: serializedPayload }}
        />
      </article>
    </AppleShowcaseContainer>
  );
};
