import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../../lib/db';
import type { ExamAttempt } from '../../types';
import { mockMiniExam } from '../../data/mockExam';
import { PageHeader } from '../../components/ui';

export default function ExamResults() {
  const { stateId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    if (!stateId) return;

    const loadAttempt = async () => {
      // First check historical attempts
      let data = await db.examAttempts.get(stateId);
      
      // If not there, it might still be in examState but completed
      if (!data) {
        const stateData = await db.examState.get(stateId);
        if (stateData && stateData.isCompleted) {
           // Should technically not happen if engine works right and deletes from state, 
           // but we handle it just in case.
           data = {
              id: stateData.id,
              examId: stateData.examId,
              userId: stateData.userId,
              startedAt: stateData.startedAt,
              completedAt: stateData.completedAt,
              sectionScores: stateData.sectionScores,
              overallEstimatedLevel: stateData.overallEstimatedLevel,
              responses: stateData.responses,
              examVersion: '1.0'
           };
        }
      }
      
      if (data) {
        setAttempt(data);
      }
    };
    
    loadAttempt();
  }, [stateId]);

  if (!attempt) {
    return <div className="p-8 text-center text-slate-500">Cargando resultados...</div>;
  }

  // Calculate some simple stats
  const totalTime = attempt.responses.reduce((acc, curr) => acc + curr.timeSpentMs, 0);
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  const questionMap = new Map(
    mockMiniExam.sections.flatMap((section) => section.tasks.flatMap((task) => task.questions)).map((question) => [question.id, question])
  );

  return (
    <div className="mx-auto max-w-4xl page-stack">
      
      <button 
        onClick={() => navigate('/linguaskill')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </button>

      <PageHeader title="Resultados de la Simulación" subtitle="Has completado el Mini Mock Test de manera exitosa. A continuación se presenta tu estimación de desempeño." eyebrow="Estimación interna" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main CEFR Score */}
        <div className="panel-section flex flex-col items-center justify-center border-primary-200 text-center">
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Nivel Estimado Global
          </p>
          <div className="text-6xl font-extrabold text-primary-700 mb-4">
            {attempt.overallEstimatedLevel}
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Esta es una estimación interna conservadora basada en nuestro algoritmo de práctica adaptativo. No es un puntaje oficial.
          </p>
        </div>

        {/* Stats */}
        <div className="panel-section space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Respuestas Registradas</p>
              <p className="text-xl font-bold text-slate-700">{attempt.responses.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="w-full pr-4">
              <p className="text-sm font-semibold text-slate-900">Puntaje Interno Reading & Listening</p>
              <p className="text-xl font-bold text-slate-700">{attempt.sectionScores['section-reading-listening'] || 0} / 100</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Tiempo de Ejecución</p>
              <p className="text-xl font-bold text-slate-700">{minutes}m {seconds}s</p>
            </div>
          </div>
        </div>

      </div>

      <section className="panel-section">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Revisión de respuestas</h2>
        <div className="space-y-3">
          {attempt.responses.map((response, index) => {
            const question = questionMap.get(response.questionId);
            const correct = response.isCorrect === true;
            return <div key={response.questionId} className={`rounded-lg border p-4 ${correct ? 'border-primary-200 bg-primary-50' : 'border-accent-200 bg-accent-50'}`}><p className="text-sm font-semibold">{index + 1}. {question?.prompt}</p><p className="text-xs mt-2">Tu respuesta: {response.selectedAnswer || 'Sin respuesta'}</p>{!correct && <p className="text-xs mt-1 font-semibold">Respuesta correcta: {question?.correctAnswer}</p>}</div>;
          })}
        </div>
      </section>

    </div>
  );
}
