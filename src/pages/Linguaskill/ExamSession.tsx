import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, Volume2 } from 'lucide-react';
import { browserSpeechPlayback } from '../../lib/audio/speech';
import { db } from '../../lib/db';
import type { ExamAttemptState, ExamDefinition, ExamQuestionDefinition, ExamSectionDefinition } from '../../types';
import { mockMiniExam } from '../../data/mockExam';
import { ExamEngine } from '../../lib/exam/engine';

export default function ExamSession() {
  const { stateId } = useParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState<ExamAttemptState | null>(null);
  const [examDef] = useState<ExamDefinition>(mockMiniExam);
  
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestionDefinition | null>(null);
  const [currentSection, setCurrentSection] = useState<ExamSectionDefinition | null>(null);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);

  useEffect(() => {
    if (!state?.startedAt || !currentSection?.timeLimitMs) return;
    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);
      setRemainingSeconds(Math.max(0, Math.floor(currentSection.timeLimitMs! / 1000) - elapsed));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [state?.startedAt, currentSection?.timeLimitMs]);

  useEffect(() => {
    if (!stateId || !examDef) return;

    const loadState = async () => {
      const dbState = await db.examState.get(stateId);
      if (!dbState) {
        navigate('/linguaskill');
        return;
      }
      if (dbState.isCompleted) {
        navigate(`/linguaskill/results/${stateId}`);
        return;
      }
      
      setState(dbState);
      const section = examDef.sections[dbState.currentSectionIndex];
      setCurrentSection(section);
      
      if (section.isAdaptive && dbState.currentQuestionId) {
        // Find the question in the section's tasks
        for (const task of section.tasks) {
          const q = task.questions.find(q => q.id === dbState.currentQuestionId);
          if (q) {
            setCurrentQuestion(q);
            break;
          }
        }
      } else if (!section.isAdaptive) {
         // Handle non-adaptive linear tasks (out of scope for mini mock but good placeholder)
         const currentTask = section.tasks[dbState.currentTaskIndex];
         if (currentTask && currentTask.questions.length > 0) {
            setCurrentQuestion(currentTask.questions[0]);
         }
         setQuestionStartTime(Date.now());
      }
      
      setSelectedAnswer('');
      setQuestionStartTime(Date.now());
    };
    
    loadState();
  }, [stateId, examDef, navigate]);

  const handleSubmit = async () => {
    if (!state || !examDef || !currentQuestion || submitting) return;
    
    setSubmitting(true);
    const timeSpentMs = Date.now() - questionStartTime;
    // Note: evaluate correctness immediately for the adaptive engine to use
    // But DO NOT show it to the user
    const isCorrect = currentQuestion.correctAnswer 
      ? selectedAnswer === currentQuestion.correctAnswer 
      : undefined;

    try {
      const newState = await ExamEngine.submitAnswer(
        state.id,
        examDef,
        currentQuestion.id,
        selectedAnswer,
        timeSpentMs,
        isCorrect
      );
      
      if (newState.isCompleted) {
         navigate(`/linguaskill/results/${state.id}`);
      } else {
         // Reload state to get next question
         setState(newState);
         const section = examDef.sections[newState.currentSectionIndex];
         setCurrentSection(section);
         
         if (section.isAdaptive && newState.currentQuestionId) {
            for (const task of section.tasks) {
              const q = task.questions.find(q => q.id === newState.currentQuestionId);
              if (q) {
                setCurrentQuestion(q);
                break;
              }
            }
         } else if (!section.isAdaptive) {
            const currentTask = section.tasks[newState.currentTaskIndex];
            if (currentTask && currentTask.questions.length > 0) {
               setCurrentQuestion(currentTask.questions[0]);
            }
         }
         setSelectedAnswer('');
         setQuestionStartTime(Date.now());
      }
    } catch (err) {
      console.error(err);
      alert('Error guardando la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (!state || !examDef || !currentSection || !currentQuestion) {
    return <div className="p-8 text-center text-slate-500">Cargando sesión...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      {/* Strict Header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div>
          <h1 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {examDef.title}
          </h1>
          <p className="text-lg font-semibold text-slate-950">{currentSection.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 font-mono text-base font-semibold text-accent-700">
            <Clock className="w-5 h-5" />
            <span>{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* No hints warning */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Modo Examen Estricto - Sin Pistas
      </div>

      {/* Main Question Area */}
      <div className="panel overflow-hidden">
        
        {/* Context / Reading Area if exists */}
        {currentQuestion.context && (
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-line">
              {currentQuestion.context}
            </p>
          </div>
        )}

        <div className="p-8 space-y-8">
          {currentQuestion.audioScript && (
            <button
              type="button"
              onClick={() => browserSpeechPlayback.play(currentQuestion.audioScript!)}
              className="btn-primary"
            >
              <Volume2 className="w-4 h-4" /> Reproducir audio
            </button>
          )}
          <h2 className="text-xl font-bold text-slate-900">
            {currentQuestion.prompt}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options?.map((opt, idx) => (
              <label 
                key={idx}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                  selectedAnswer === opt 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center h-6">
                  <input
                    type="radio"
                    name="answer"
                    value={opt}
                    checked={selectedAnswer === opt}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-600"
                  />
                </div>
                <div className="text-slate-700 font-medium">
                  {opt}
                </div>
              </label>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || submitting}
              className="btn-primary px-8"
            >
              Siguiente <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
