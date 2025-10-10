import React, { useEffect, useState } from './react.js';
import { QuestionnaireScreen } from './components/QuestionnaireScreen.jsx';
import { SynthesisReport } from './components/SynthesisReport.jsx';
import { BackOffice } from './components/BackOffice.jsx';
import { CheckCircle } from './components/icons.js';
import { initialQuestions } from './data/questions.js';
import { initialRules } from './data/rules.js';
import { initialTeams } from './data/teams.js';
import { loadPersistedState, persistState } from './utils/storage.js';
import { shouldShowQuestion } from './utils/questions.js';
import { analyzeAnswers } from './utils/rules.js';

export const App = () => {
  const [mode, setMode] = useState('user');
  const [screen, setScreen] = useState('questionnaire');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [isHighVisibility, setIsHighVisibility] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [questions, setQuestions] = useState(initialQuestions);
  const [rules, setRules] = useState(initialRules);
  const [teams, setTeams] = useState(initialTeams);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = loadPersistedState();
    if (!savedState) {
      setIsHydrated(true);
      return;
    }

    if (savedState.mode) setMode(savedState.mode);
    if (savedState.screen) setScreen(savedState.screen);
    if (typeof savedState.currentQuestionIndex === 'number' && savedState.currentQuestionIndex >= 0) {
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
    }
    if (savedState.answers && typeof savedState.answers === 'object') setAnswers(savedState.answers);
    if (typeof savedState.analysis !== 'undefined') setAnalysis(savedState.analysis);
    if (Array.isArray(savedState.questions)) setQuestions(savedState.questions);
    if (Array.isArray(savedState.rules)) setRules(savedState.rules);
    if (Array.isArray(savedState.teams)) setTeams(savedState.teams);
    if (typeof savedState.isHighVisibility === 'boolean') setIsHighVisibility(savedState.isHighVisibility);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    persistState({
      mode,
      screen,
      currentQuestionIndex,
      answers,
      analysis,
      questions,
      rules,
      teams,
      isHighVisibility
    });
  }, [mode, screen, currentQuestionIndex, answers, analysis, questions, rules, teams, isHighVisibility, isHydrated]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (!body) return;
    if (isHighVisibility) {
      body.classList.add('high-visibility');
    } else {
      body.classList.remove('high-visibility');
    }
  }, [isHighVisibility]);

  const activeQuestions = questions.filter(q => shouldShowQuestion(q, answers));

  useEffect(() => {
    if (!isHydrated) return;
    if (activeQuestions.length === 0) return;
    if (currentQuestionIndex >= activeQuestions.length) {
      setCurrentQuestionIndex(activeQuestions.length - 1);
    }
  }, [activeQuestions.length, currentQuestionIndex, isHydrated]);

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };

    const questionsToRemove = questions
      .filter(q => !shouldShowQuestion(q, newAnswers))
      .map(q => q.id);

    questionsToRemove.forEach(qId => {
      delete newAnswers[qId];
    });

    setAnswers(newAnswers);

    setValidationError(prev => {
      if (!prev) return null;
      return prev.questionId === questionId ? null : prev;
    });
  };

  const handleNext = () => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    if (currentQuestion?.required) {
      const answer = answers[currentQuestion.id];
      const isAnswerProvided = Array.isArray(answer) ? answer.length > 0 : !!answer;

      if (!isAnswerProvided) {
        setValidationError({
          questionId: currentQuestion.id,
          message: 'Veuillez répondre à cette question obligatoire avant de poursuivre.'
        });
        return;
      }
    }

    setValidationError(null);

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const result = analyzeAnswers(answers, rules);
      setAnalysis(result);
      setScreen('synthesis');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
    setValidationError(null);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScreen('questionnaire');
    setAnalysis(null);
    setValidationError(null);
  };

  const handleToggleHighVisibility = () => {
    setIsHighVisibility(prev => !prev);
  };

  const handleBackToQuestionnaire = () => {
    if (activeQuestions.length > 0) {
      const lastIndex = activeQuestions.length - 1;
      setCurrentQuestionIndex(prevIndex => {
        if (prevIndex > lastIndex) {
          return lastIndex;
        }
        return prevIndex;
      });
    }
    setScreen('questionnaire');
  };

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <nav className="bg-white shadow-sm border-b border-gray-200 hv-surface">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Compliance Advisor</h1>
                <p className="text-xs text-gray-500">Outil d'aide à la décision</p>
              </div>
            </div>

            <div className="flex space-x-3" role="group" aria-label="Sélection du mode d'affichage">
              <button
                type="button"
                onClick={() => setMode('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-all hv-button ${
                  mode === 'user'
                    ? 'bg-indigo-600 text-white hv-button-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={mode === 'user'}
                aria-label="Basculer vers le mode chef de projet"
              >
                Mode Chef de Projet
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all hv-button ${
                  mode === 'admin'
                    ? 'bg-indigo-600 text-white hv-button-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={mode === 'admin'}
                aria-label="Basculer vers le mode back-office"
              >
                Back-Office
              </button>
              <button
                type="button"
                onClick={handleToggleHighVisibility}
                className={`px-4 py-2 rounded-lg font-medium transition-all hv-button hv-focus-ring ${
                  isHighVisibility ? 'hv-button-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={isHighVisibility}
                aria-label="Activer ou désactiver le mode haute visibilité"
              >
                Mode haute visibilité {isHighVisibility ? 'activé' : 'désactivé'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex="-1" className="focus:outline-none hv-background">
        {mode === 'user' ? (
          screen === 'questionnaire' ? (
      <QuestionnaireScreen
        questions={activeQuestions}
        currentIndex={currentQuestionIndex}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        allQuestions={questions}
        validationError={validationError}
      />
          ) : (
            <SynthesisReport
              answers={answers}
              analysis={analysis}
              teams={teams}
              questions={activeQuestions}
              onRestart={handleRestart}
              onBack={handleBackToQuestionnaire}
            />
          )
        ) : (
          <BackOffice
            questions={questions}
            setQuestions={setQuestions}
            rules={rules}
            setRules={setRules}
            teams={teams}
            setTeams={setTeams}
          />
        )}
      </main>
    </div>
  );
};


