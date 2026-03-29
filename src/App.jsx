import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';

import './App.css';

import { parseQuiz, shuffle } from './parseQuiz';

function getLetterGrade(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

function gradeColor(grade) {
  return {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    F: '#ef4444',
  }[grade];
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const QUESTIONS_PER_SESSION = 20;

const APPS = [
  {
    id: 'app-1',
    name: 'Job Tracker AI',
    icon: '\ud83d\udcbc',
    desc: 'Structured extraction + Zod validation',
    ready: true,
  },
  {
    id: 'app-2',
    name: 'Link Saver AI Summarizer',
    icon: '\ud83d\udd17',
    desc: 'SSE streaming + Redis caching',
    ready: false,
  },
  {
    id: 'app-3',
    name: 'Async AI Content Pipeline',
    icon: '\u2699\ufe0f',
    desc: 'Tool calling + BullMQ async processing',
    ready: false,
  },
  {
    id: 'app-4',
    name: 'Document QA RAG',
    icon: '\ud83d\udcc4',
    desc: 'RAG with pgvector + citation system',
    ready: false,
  },
  {
    id: 'app-5',
    name: 'Multi-Tenant AI Assistant',
    icon: '\ud83c\udfe2',
    desc: 'Multi-tenant context scoping + summarization',
    ready: false,
  },
  {
    id: 'app-6',
    name: 'Realtime AI Collaboration',
    icon: '\u26a1',
    desc: 'Human-in-the-loop + Socket.IO real-time',
    ready: false,
  },
  {
    id: 'app-7',
    name: 'AI Research Assistant',
    icon: '\ud83d\udd2c',
    desc: 'Compound AI: all patterns from 1\u20136 combined',
    ready: false,
  },
  {
    id: 'app-8',
    name: 'Agentic Travel Agent',
    icon: '\u2708\ufe0f',
    desc: 'Agentic tool-use loop with real external APIs',
    ready: true,
  },
];

function ClarificationModal({ question, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <button className='modal-close' onClick={onClose} aria-label='Close'>
          &times;
        </button>
        <div className='modal-header'>
          <span className='modal-icon'>&#128161;</span>
          <h3>What is this asking?</h3>
        </div>
        <p className='modal-question'>{question.text}</p>
        <div
          className='modal-clarification'
          /* Content source: self-authored quiz markdown, not user input */
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.clarification) }}
        />
        <button className='btn modal-btn' onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

function ExplanationModal({ question, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <button className='modal-close' onClick={onClose} aria-label='Close'>
          &times;
        </button>
        <div className='modal-header'>
          <span className='modal-icon'>&#128218;</span>
          <h3>Why this answer?</h3>
        </div>
        <p className='modal-question'>{question.text}</p>
        <p className='modal-answer'>
          Correct answer:{' '}
          <strong>
            {OPTION_LETTERS[question.correctIndex]}){' '}
            {question.options[question.correctIndex].replace(/^[A-D]\)\s*/, '')}
          </strong>
        </p>
        <div
          className='modal-explanation'
          /* Content source: self-authored quiz markdown, not user input */
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.explanation) }}
        />
        <button className='btn modal-btn' onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedAppId, setSelectedAppId] = useState('app-8');
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('start'); // 'start' | 'browse' | 'quiz' | 'finished'
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [clarifyQuestion, setClarifyQuestion] = useState(null);
  const [explainQuestion, setExplainQuestion] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAllQuestions([]);

    fetch(`${import.meta.env.BASE_URL}quizzes/${selectedAppId}.md`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load quiz file');
        return r.text();
      })
      .then((md) => {
        const parsed = parseQuiz(md);
        setAllQuestions(parsed);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedAppId]);

  const closeClarify = useCallback(() => setClarifyQuestion(null), []);
  const closeExplain = useCallback(() => setExplainQuestion(null), []);

  const selectedApp = APPS.find((a) => a.id === selectedAppId);
  const sessionSize = Math.min(QUESTIONS_PER_SESSION, allQuestions.length);

  function handleStart() {
    setQuestions(shuffle(allQuestions).slice(0, sessionSize));
    setCurrent(0);
    setScore(0);
    setAnswered(0);
    setSelected(null);
    setShowResult(false);
    setScreen('quiz');
  }

  function handlePickQuestion(question) {
    setQuestions([question]);
    setCurrent(0);
    setScore(0);
    setAnswered(0);
    setSelected(null);
    setShowResult(false);
    setScreen('quiz');
  }

  // --- Start Screen ---
  if (screen === 'start') {
    return (
      <div className='container'>
        <div className='card start-card'>
          <div className='start-icon'>{selectedApp?.icon}</div>
          <h1>Fullstack AI Quiz</h1>
          <p className='start-description'>
            Test your knowledge of the apps in this portfolio — architecture,
            tools, APIs, patterns, and more.
          </p>

          <div className='app-selector'>
            <label className='app-selector-label' htmlFor='app-select'>
              Choose an app
            </label>
            <select
              id='app-select'
              className='app-select'
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
            >
              {APPS.map((app) => (
                <option key={app.id} value={app.id} disabled={!app.ready}>
                  {app.icon} App {app.id.split('-')[1]}: {app.name}
                  {app.ready ? '' : ' (coming soon)'}
                </option>
              ))}
            </select>
            <p className='app-select-desc'>{selectedApp?.desc}</p>
          </div>

          {loading && <p className='start-loading'>Loading questions...</p>}
          {error && <p className='error'>{error}</p>}

          {!loading && !error && allQuestions.length > 0 && (
            <>
              <div className='start-details'>
                <div className='start-detail'>
                  <span className='start-detail-value'>{sessionSize}</span>
                  <span className='start-detail-label'>Questions</span>
                </div>
                <div className='start-detail'>
                  <span className='start-detail-value'>
                    {allQuestions.length}
                  </span>
                  <span className='start-detail-label'>Question Pool</span>
                </div>
                <div className='start-detail'>
                  <span className='start-detail-value'>A–F</span>
                  <span className='start-detail-label'>Grading</span>
                </div>
              </div>
              <div className='start-actions'>
                <button className='btn start-btn' onClick={handleStart}>
                  Start Quiz
                </button>
                <button
                  className='btn btn-secondary start-btn-secondary'
                  onClick={() => setScreen('browse')}
                >
                  Browse Questions
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Browse Screen ---
  if (screen === 'browse') {
    return (
      <div className='container'>
        {clarifyQuestion && (
          <ClarificationModal
            question={clarifyQuestion}
            onClose={closeClarify}
          />
        )}
        {explainQuestion && (
          <ExplanationModal question={explainQuestion} onClose={closeExplain} />
        )}

        <header className='browse-header'>
          <button
            className='btn btn-secondary browse-back'
            onClick={() => setScreen('start')}
          >
            &larr; Back
          </button>
          <h1>
            {selectedApp?.icon} {selectedApp?.name} — All Questions
          </h1>
          <p className='browse-subtitle'>
            {allQuestions.length} questions. Click any question to quiz yourself
            on it.
          </p>
        </header>

        <div className='browse-list'>
          {allQuestions.map((q, i) => (
            <div key={q.number} className='browse-item'>
              <div className='browse-item-number'>{q.number}</div>
              <div className='browse-item-content'>
                <p className='browse-item-text'>{q.text}</p>
                <div className='browse-item-actions'>
                  <button
                    className='btn btn-small'
                    onClick={() => handlePickQuestion(q)}
                  >
                    Test Me
                  </button>
                  {q.clarification && (
                    <button
                      className='btn btn-small btn-secondary'
                      onClick={() => setClarifyQuestion(q)}
                    >
                      ?
                    </button>
                  )}
                  {q.explanation && (
                    <button
                      className='btn btn-small btn-secondary'
                      onClick={() => setExplainQuestion(q)}
                    >
                      Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Finished Screen ---
  if (screen === 'finished') {
    const pct = answered > 0 ? Math.round((score / answered) * 100) : 100;
    const grade = getLetterGrade(pct);

    return (
      <div className='container'>
        <div className='card finished-card'>
          <h1>Quiz Complete</h1>
          <p className='finished-app-name'>
            {selectedApp?.icon} {selectedApp?.name}
          </p>
          <div className='final-grade' style={{ color: gradeColor(grade) }}>
            {grade}
          </div>
          <p className='final-score'>
            {score} / {questions.length} correct ({pct}%)
          </p>
          {questions.length > 1 && (
            <p className='final-pool'>
              {questions.length} questions drawn from a pool of{' '}
              {allQuestions.length}
            </p>
          )}
          <div className='finished-actions'>
            <button className='btn' onClick={handleStart}>
              New Quiz
            </button>
            <button
              className='btn btn-secondary'
              onClick={() => setScreen('start')}
            >
              Back to Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Quiz Screen ---
  if (!questions.length)
    return (
      <div className='container'>
        <p>Loading...</p>
      </div>
    );

  const q = questions[current];
  const pct = answered > 0 ? Math.round((score / answered) * 100) : 100;
  const grade = getLetterGrade(pct);
  const isCorrect = selected === q.correctIndex;
  const isSingleQuestion = questions.length === 1;

  function handleSelect(idx) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    setAnswered((a) => a + 1);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setExplainQuestion(q);
    }
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setScreen(isSingleQuestion ? 'browse' : 'finished');
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowResult(false);
  }

  return (
    <div className='container'>
      {clarifyQuestion && (
        <ClarificationModal question={clarifyQuestion} onClose={closeClarify} />
      )}
      {explainQuestion && (
        <ExplanationModal question={explainQuestion} onClose={closeExplain} />
      )}

      <header className='header'>
        <div className='header-top'>
          <h1>
            {selectedApp?.icon} {selectedApp?.name} Quiz
          </h1>
          <button
            className='btn btn-secondary btn-small'
            onClick={() => setScreen(isSingleQuestion ? 'browse' : 'start')}
          >
            Quit
          </button>
        </div>
        {!isSingleQuestion && (
          <>
            <div className='stats'>
              <span className='stat'>
                Question {current + 1} / {questions.length}
              </span>
              <span className='stat'>
                Score: {score}/{answered}
              </span>
              <span
                className='grade-badge'
                style={{ background: gradeColor(grade) }}
              >
                {grade}
              </span>
            </div>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{
                  width: `${((current + (showResult ? 1 : 0)) / questions.length) * 100}%`,
                }}
              />
            </div>
          </>
        )}
      </header>

      <div className='card'>
        <div className='question-row'>
          <h2 className='question-text'>{q.text}</h2>
          {q.clarification && (
            <button
              className='hint-btn'
              onClick={() => setClarifyQuestion(q)}
              aria-label='Explain this question'
              title='What does this question mean?'
            >
              ?
            </button>
          )}
        </div>

        <div className='options'>
          {q.options.map((opt, i) => {
            let cls = 'option';
            if (showResult) {
              if (i === q.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' incorrect';
              else cls += ' dimmed';
            }

            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <span className='option-letter'>{OPTION_LETTERS[i]}</span>
                <span className='option-text'>
                  {opt.replace(/^[A-D]\)\s*/, '')}
                </span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div
            className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
          >
            <p>
              {isCorrect
                ? 'Correct!'
                : `Incorrect — the answer is ${OPTION_LETTERS[q.correctIndex]}.`}
            </p>
            <div className='feedback-actions'>
              {q.explanation && (
                <button
                  className='btn btn-secondary'
                  onClick={() => setExplainQuestion(q)}
                >
                  {isCorrect ? 'Learn More' : 'Why?'}
                </button>
              )}
              <button className='btn' onClick={handleNext}>
                {isSingleQuestion
                  ? 'Back to Questions'
                  : current + 1 < questions.length
                    ? 'Next Question'
                    : 'See Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
