import React, { useMemo, useEffect, useCallback, useState } from './react.js';
import { ReactDOM } from './react.js';
import { ProjectShowcase } from './components/ProjectShowcase.jsx';
import { loadPersistedState } from './utils/storage.js';
import { initialQuestions } from './data/questions.js';
import { initialRules } from './data/rules.js';
import { initialTeams } from './data/teams.js';
import { shouldShowQuestion } from './utils/questions.js';
import { analyzeAnswers } from './utils/rules.js';
import { extractProjectName } from './utils/projects.js';
import { createDemoProject } from './data/demoProject.js';
import {
  DEFAULT_SHOWCASE_THEME,
  SHOWCASE_THEME_STORAGE_KEY,
  SHOWCASE_THEMES,
  isShowcaseTheme
} from './constants/showcaseThemes.js';

const THEME_STYLESHEETS = {
  inspiration: './src/styles/project-showcase-theme-inspiration.css',
  netflix: './src/styles/project-showcase-theme-netflix.css',
  amnesty: './src/styles/project-showcase-theme-amnesty.css'
};

const resolveTheme = (themeId) => (isShowcaseTheme(themeId) ? themeId : DEFAULT_SHOWCASE_THEME);

const usePresentationThemeStylesheet = (themeId) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const effectiveTheme = resolveTheme(themeId);
    const href = THEME_STYLESHEETS[effectiveTheme];
    if (!href) {
      return undefined;
    }

    const toAbsoluteHref = (value) => {
      if (!value) {
        return '';
      }

      try {
        return new URL(value, document.baseURI).href;
      } catch (error) {
        return value;
      }
    };

    const targetHref = toAbsoluteHref(href);
    const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const matchingLink = stylesheetLinks.find((linkElement) => {
      return toAbsoluteHref(linkElement.getAttribute('href')) === targetHref;
    }) || null;

    const themedLinks = Array.from(document.querySelectorAll('link[data-presentation-theme="true"]'));
    themedLinks.forEach((linkElement) => {
      if (linkElement !== matchingLink) {
        linkElement.removeAttribute('data-presentation-theme');
        linkElement.removeAttribute('data-theme');
      }
    });

    if (matchingLink) {
      matchingLink.setAttribute('data-presentation-theme', 'true');
      matchingLink.setAttribute('data-theme', effectiveTheme);
      return undefined;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-presentation-theme', 'true');
    link.setAttribute('data-theme', effectiveTheme);
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [themeId]);
};

const buildPresentationContext = () => {
  if (typeof window === 'undefined') {
    return { status: 'error', message: "Cette vue de présentation nécessite un navigateur." };
  }

  const savedState = loadPersistedState();
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('projectId');

  const questions = Array.isArray(savedState?.questions) && savedState.questions.length > 0
    ? savedState.questions
    : initialQuestions;
  const rules = Array.isArray(savedState?.rules) && savedState.rules.length > 0
    ? savedState.rules
    : initialRules;
  const teams = Array.isArray(savedState?.teams) && savedState.teams.length > 0
    ? savedState.teams
    : initialTeams;

  let projects = null;
  if (Array.isArray(savedState?.projects) && savedState.projects.length > 0) {
    projects = savedState.projects;
  } else if (Array.isArray(savedState?.submittedProjects) && savedState.submittedProjects.length > 0) {
    projects = savedState.submittedProjects;
  }

  const findProjectById = (collection, id) => {
    if (!id || !Array.isArray(collection)) {
      return null;
    }
    return collection.find(project => project?.id === id) || null;
  };

  let project = findProjectById(projects, requestedId);

  if (!project && savedState?.activeProjectId) {
    project = findProjectById(projects, savedState.activeProjectId);
  }

  if (!project && Array.isArray(projects) && projects.length > 0) {
    project = projects[0];
  }

  let usedFallback = false;

  if (!project) {
    project = createDemoProject({ questions, rules });
    usedFallback = true;
  }

  const answers = project.answers || {};
  const visibleQuestions = Array.isArray(questions)
    ? questions.filter(question => shouldShowQuestion(question, answers))
    : [];
  const relevantQuestions = visibleQuestions.length > 0 ? visibleQuestions : questions;

  const analysis = project.analysis
    || (Object.keys(answers).length > 0 ? analyzeAnswers(answers, rules) : null);

  const relevantTeams = Array.isArray(teams)
    ? teams.filter(team => (analysis?.teams || []).includes(team.id))
    : [];
  const timelineDetails = analysis?.timeline?.details || [];
  const projectName = project.projectName || extractProjectName(answers, relevantQuestions) || 'Projet sans nom';

  return {
    status: 'ready',
    projectId: project.id,
    requestedId,
    projectName,
    answers,
    analysis,
    relevantTeams,
    questions: relevantQuestions,
    timelineDetails,
    usedFallback
  };
};

const PresentationPage = () => {
  const context = useMemo(buildPresentationContext, []);

  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return DEFAULT_SHOWCASE_THEME;
    }

    try {
      const storedTheme = window.localStorage.getItem(SHOWCASE_THEME_STORAGE_KEY);
      if (isShowcaseTheme(storedTheme)) {
        return storedTheme;
      }
    } catch (error) {
      // Ignore storage errors and fall back to the default theme.
    }

    return DEFAULT_SHOWCASE_THEME;
  });

  const effectiveTheme = resolveTheme(selectedTheme);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SHOWCASE_THEME_STORAGE_KEY, effectiveTheme);
    } catch (error) {
      // Ignore storage errors silently.
    }
  }, [effectiveTheme]);

  usePresentationThemeStylesheet(effectiveTheme);

  const activeTheme = useMemo(
    () => SHOWCASE_THEMES.find(theme => theme.id === effectiveTheme) || SHOWCASE_THEMES[0],
    [effectiveTheme]
  );

  const handleThemeChange = useCallback((nextThemeId) => {
    if (!isShowcaseTheme(nextThemeId)) {
      return;
    }
    setSelectedTheme(nextThemeId);
  }, []);

  useEffect(() => {
    if (context.status !== 'ready') {
      return;
    }

    if (typeof document !== 'undefined') {
      document.title = `${context.projectName} · Présentation`;
    }
  }, [context]);

  const handleClose = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.close();
      if (window.opener) {
        return;
      }
    } catch (error) {
      // Ignore potential security errors.
    }

    window.location.href = './index.html';
  }, []);

  if (context.status !== 'ready') {
    return (
      <div className="presentation-layout">
        <div className="presentation-empty">
          <h2>Impossible d'afficher la présentation</h2>
          <p>{context.message || 'Aucune donnée de projet disponible.'}</p>
          <button type="button" className="presentation-button" onClick={handleClose}>
            Retourner à l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="presentation-layout">
      <header className="presentation-header">
        <div>
          <h1 className="presentation-title">Présentation du projet</h1>
          <p className="presentation-subtitle">{context.projectName}</p>
        </div>
        <div className="presentation-theme-controls" role="group" aria-label="Choix du style de présentation">
          <div className="presentation-theme-info">
            <p className="presentation-theme-label">Style de présentation</p>
            {activeTheme?.description && (
              <p className="presentation-theme-description">{activeTheme.description}</p>
            )}
          </div>
          <div className="presentation-theme-buttons">
            {SHOWCASE_THEMES.map(theme => {
              const isActive = theme.id === effectiveTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`presentation-theme-button${isActive ? ' is-active' : ''}`}
                  onClick={() => handleThemeChange(theme.id)}
                  aria-pressed={isActive}
                  title={theme.description}
                >
                  {theme.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
        <div className="presentation-actions">
          <button type="button" className="presentation-button" onClick={handleClose}>
            Revenir à l'application
          </button>
        </div>
      </header>

      {context.usedFallback && context.requestedId && (
        <p className="presentation-banner">
          Aucun projet avec l'identifiant « {context.requestedId} » n'a été trouvé. La présentation affiche le projet de démonstration.
        </p>
      )}

      <main className="presentation-content">
        <ProjectShowcase
          projectName={context.projectName}
          analysis={context.analysis}
          relevantTeams={context.relevantTeams}
          questions={context.questions}
          answers={context.answers}
          timelineDetails={context.timelineDetails}
          onClose={handleClose}
          renderInStandalone
          selectedTheme={effectiveTheme}
          onThemeChange={handleThemeChange}
          showThemeControls={false}
        />
      </main>
    </div>
  );
};

const rootElement = document.getElementById('presentation-root');

if (rootElement && ReactDOM) {
  if (typeof ReactDOM.createRoot === 'function') {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<PresentationPage />);
  } else if (typeof ReactDOM.render === 'function') {
    ReactDOM.render(<PresentationPage />, rootElement);
  } else {
    console.error('Aucune méthode de rendu ReactDOM disponible.');
  }
}
