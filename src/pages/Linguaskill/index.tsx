import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { db } from '../../lib/db';
import type { ExamAttempt } from '../../types';
import { mockMiniExam } from '../../data/mockExam';
import { ExamEngine } from '../../lib/exam/engine';
import { PageHeader, SectionHeader } from '../../components/ui';

export default function LinguaskillHome() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const attempts = await db.examAttempts.orderBy('startedAt').reverse().toArray();
      setHistory(attempts);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const handleStartMiniMock = async () => {
    try {
      const state = await ExamEngine.startExam(mockMiniExam);
      navigate(`/linguaskill/session/${state.id}`);
    } catch (err) {
      console.error('Failed to start mini mock', err);
      alert('Hubo un error al iniciar el examen.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl page-stack">
      <PageHeader title="Simulador Linguaskill" subtitle="Este módulo ofrece un entorno de práctica simulado para prepararte para el examen Linguaskill de Cambridge." eyebrow="Práctica de examen" />

      {/* Disclaimer Alert */}
      <div className="flex gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-accent-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-bold">Aviso Importante (Práctica vs. Oficial)</p>
          <p>
            Esta es una <strong>aproximación interna</strong> diseñada para estimar tu rendimiento. 
            El puntaje y nivel CEFR calculados aquí son estimaciones conservadoras para tu preparación y 
            <strong> NO representan una certificación oficial de Cambridge Assessment English</strong>. 
            El algoritmo adaptativo utilizado es una aproximación para entrenamiento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions Card */}
        <div className="panel-section flex flex-col justify-between">
          <div>
            <SectionHeader title="Opciones de Práctica" description="Selecciona el tipo de simulación que deseas realizar. Durante la prueba no habrá pistas ni correcciones inmediatas." />

            <div className="space-y-4">
              <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div>
                  <h3 className="font-bold text-slate-900">Mini Mock Test</h3>
                  <p className="text-xs text-slate-500 mt-1">4 preguntas originales de Reading y Listening</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~15 min</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Feedback al finalizar</span>
                  </div>
                </div>
                <button
                  onClick={handleStartMiniMock}
                  className="btn-primary shrink-0"
                >
                  <PlayCircle className="w-4 h-4" /> Iniciar
                </button>
              </div>

              <div className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-60">
                <div>
                  <h3 className="font-bold text-slate-900">Full Mock Test (Próximamente)</h3>
                  <p className="text-xs text-slate-500 mt-1">Simulación completa con todas las habilidades</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Card */}
        <div className="panel-section flex flex-col">
          <SectionHeader title="Intentos Anteriores" />
          
          <div className="flex-1 overflow-y-auto min-h-[200px]">
            {loading ? (
              <p className="text-slate-500 text-sm">Cargando historial...</p>
            ) : history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-slate-400">
                <p className="text-sm">Aún no has completado simulaciones.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Mini Mock Test</p>
                      <p className="text-xs text-slate-500">
                        {new Date(attempt.startedAt).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Nivel Estimado</p>
                      <p className="text-lg font-bold text-primary-600">{attempt.overallEstimatedLevel || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
