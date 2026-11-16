import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Headphones,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DIAGNOSTIC_QUESTIONS,
  type DiagnosticSummary,
  computeDiagnosticResult,
} from '../data/diagnosticQuestions';
import {
  ENNEAGRAM_PROFILES,
  TRIAD_OVERVIEWS,
  getProfileByNumber,
} from '../data/enneagramData';
import { OperationType, db, handleFirestoreError } from '../firebase';
import { AuthGateNotice } from './AuthGateNotice';
import { CenteredArtwork } from './CenteredArtwork';

interface SavedDiagnosticRecord extends DiagnosticSummary {
  id: string;
  createdAtLabel: string;
}

interface DiagnosticViewProps {
  onApplyProfile: (num: number) => void;
  onGoToProfile: (num: number) => void;
  onGoToMeditation: (num: number) => void;
  onGoToActionPlan: (num: number) => void;
}

export function DiagnosticView({
  onApplyProfile,
  onGoToProfile,
  onGoToMeditation,
  onGoToActionPlan,
}: DiagnosticViewProps) {
  const { user, saveDetectedType } = useAuth();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<DiagnosticSummary | null>(null);
  const [savedFlag, setSavedFlag] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [history, setHistory] = useState<SavedDiagnosticRecord[]>([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const colPath = `users/${user.uid}/diagnostics`;
    const q = query(
      collection(db, 'users', user.uid, 'diagnostics'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SavedDiagnosticRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate ? data.createdAt.toDate() : null;
          return {
            id: d.id,
            primaryType: Number(data.primaryType ?? 1),
            secondaryType: Number(data.secondaryType ?? 2),
            wing: String(data.wing ?? '1w9'),
            dominantTriad: (data.dominantTriad ?? 'instinctive') as DiagnosticSummary['dominantTriad'],
            scores: Array.isArray(data.scores) ? data.scores.map(Number) : Array(9).fill(0),
            createdAtLabel: ts
              ? ts.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Reciente',
          };
        });
        setHistory(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colPath);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[stepIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;

  const persistDiagnostic = async (summary: DiagnosticSummary) => {
    if (!user) return;
    setSaving(true);
    const colPath = `users/${user.uid}/diagnostics`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'diagnostics'), {
        uid: user.uid,
        primaryType: summary.primaryType,
        secondaryType: summary.secondaryType,
        wing: summary.wing,
        dominantTriad: summary.dominantTriad,
        scores: summary.scores,
        createdAt: serverTimestamp(),
      });
      await saveDetectedType(summary.primaryType, summary.wing);
      setSavedFlag(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    if (stepIndex < totalQuestions - 1) {
      setTimeout(() => {
        setStepIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      }, 150);
    }
  };

  const handleFinishTest = async () => {
    const summary = computeDiagnosticResult(answers);
    setResult(summary);
    setSavedFlag(false);
    onApplyProfile(summary.primaryType);
    if (user) {
      await persistDiagnostic(summary);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setAnswers({});
    setResult(null);
    setSavedFlag(false);
  };

  const handleDeleteHistory = async (recordId: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/diagnostics/${recordId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'diagnostics', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const resultProfile = result ? getProfileByNumber(result.primaryType) : null;
  const maxScore = result ? Math.max(...result.scores, 1) : 1;
  const triadMeta = result
    ? TRIAD_OVERVIEWS.find((t) => t.key === result.dominantTriad)
    : null;

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
            <span className="font-mono tabular-nums text-[#D4A853]">
              Diagnóstico Inicial · 12 Preguntas
            </span>
            <span aria-hidden="true">·</span>
            <span>Detección Automática de Eneatipo y Ala</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
            Descubre Tu Eneatipo Esencial
          </h1>
          <p className="text-sm sm:text-base text-[#B8B4AC] max-w-2xl leading-relaxed">
            Responde con honestidad según tu tendencia habitual bajo presión y en calma, no según
            cómo desearías responder.
          </p>
        </header>

        <div className="px-6 sm:px-10 py-8 space-y-8">
          {!user && (
            <AuthGateNotice
              description="Puedes realizar el test ahora mismo; si inicias sesión con Google, tu resultado y tu historial quedarán guardados en tu perfil personal."
            />
          )}

          {!result && currentQuestion ? (
            <section aria-label="Cuestionario de diagnóstico" className="space-y-6">
              {/* Progress Bar & Numeric Counter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#9E9B93]">
                  <span className="font-mono tabular-nums text-[#D4A853]">
                    Pregunta {String(stepIndex + 1).padStart(2, '0')} / {totalQuestions}
                  </span>
                  <span className="font-mono tabular-nums">
                    {answeredCount} de {totalQuestions} respondidas
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#1C1F27] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4A853] transition-all duration-200"
                    style={{ width: `${((stepIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
                    const isCurrent = idx === stepIndex;
                    const isAnswered = Boolean(answers[q.id]);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setStepIndex(idx)}
                        aria-label={`Ir a pregunta ${idx + 1}`}
                        className={`h-7 min-w-7 px-2 rounded text-[11px] font-mono tabular-nums border transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#D4A853] text-[#111318] border-[#D4A853] font-semibold'
                            : isAnswered
                            ? 'bg-[#1D202A] text-[#E9E5DC] border-[#383D4D]'
                            : 'bg-[#111318] text-[#7D7B74] border-[#252833] hover:border-[#494E5F]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question */}
              <div className="p-6 sm:p-8 rounded-xl border border-[#282B36] bg-[#12141A] space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-mono text-[#D4A853]">{currentQuestion.chapter}</p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9] leading-snug">
                    {currentQuestion.prompt}
                  </h2>
                </div>

                <div className="space-y-3" role="radiogroup" aria-label={currentQuestion.prompt}>
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#1E212B] border-[#D4A853]'
                            : 'bg-[#15171F] border-[#252833] hover:border-[#494E5F]'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="block text-sm sm:text-base font-medium text-[#F2EFE9]">
                            {opt.label}
                          </span>
                          <span className="block text-xs sm:text-sm text-[#A8A49C] leading-relaxed">
                            {opt.description}
                          </span>
                        </div>
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#D4A853] border-[#D4A853] text-[#111318]'
                              : 'border-[#3E4352]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1C1F27] text-[#D6D2C9] border border-[#2C303D] rounded-md hover:border-[#D4A853] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-3">
                  {stepIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setStepIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={answeredCount < totalQuestions || saving}
                    onClick={() => void handleFinishTest()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {saving
                        ? 'Calculando y guardando...'
                        : answeredCount < totalQuestions
                        ? `Responde las ${totalQuestions - answeredCount} restantes`
                        : 'Revelar Mi Eneatipo'}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          ) : result && resultProfile ? (
            /* Result Summary View */
            <section aria-label="Resultado del diagnóstico" className="space-y-8">
              <div className="p-6 sm:p-8 rounded-xl border border-[#3B3424] bg-[#12141A] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5">
                  <CenteredArtwork
                    src={resultProfile.image}
                    alt={`Eneatipo detectado ${resultProfile.number}: ${resultProfile.name}`}
                    caption={resultProfile.imageCaption}
                    roman={resultProfile.roman}
                    title={resultProfile.name}
                    accentHex={resultProfile.accentHex}
                    size="thumb"
                  />
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
                    <span className="font-mono tabular-nums text-[#D4A853]">
                      Eneatipo Detectado · 0{resultProfile.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-[#E9E5DC]">
                      Ala probable: {result.wing}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{triadMeta?.title ?? resultProfile.triadLabel}</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#F2EFE9]">
                    {resultProfile.name}
                  </h2>
                  <p className="text-sm text-[#B8B4AC]">{resultProfile.archetype}</p>
                  <p className="font-serif italic text-lg text-[#E8E3D9] leading-relaxed">
                    «{resultProfile.essence}»
                  </p>

                  {savedFlag && (
                    <p className="text-xs text-[#84B59F]">
                      Resultado guardado y sincronizado con tu cuenta personal.
                    </p>
                  )}

                  {user && !savedFlag && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void persistDiagnostic(result)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors cursor-pointer"
                    >
                      <span>{saving ? 'Guardando...' : 'Guardar resultado en mi perfil'}</span>
                    </button>
                  )}

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onGoToProfile(resultProfile.number)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Explorar Perfil {resultProfile.number}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onGoToMeditation(resultProfile.number)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
                      <span>Meditar 432 Hz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onGoToActionPlan(resultProfile.number)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
                      <span>Plan Semanal IA</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#9E9B93] hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Repetir Test</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 9-Type Resonance Spectrum */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#232630] pb-2">
                  <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                    Mapa de Resonancia por Eneatipo
                  </h3>
                  <span className="text-xs text-[#9E9B93]">
                    Segundo perfil más afín: Eneatipo {result.secondaryType}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {ENNEAGRAM_PROFILES.map((p) => {
                    const score = result.scores[p.number - 1] ?? 0;
                    const pct = Math.round((score / maxScore) * 100);
                    const isPrimary = p.number === result.primaryType;
                    return (
                      <div key={p.number} className="grid grid-cols-12 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onGoToProfile(p.number)}
                          className={`col-span-5 sm:col-span-4 text-left text-xs sm:text-sm truncate cursor-pointer hover:text-[#D4A853] transition-colors ${
                            isPrimary ? 'text-[#D4A853] font-medium' : 'text-[#C6C2B9]'
                          }`}
                        >
                          <span className="font-mono tabular-nums mr-2">0{p.number}</span>
                          {p.name}
                        </button>
                        <div className="col-span-5 sm:col-span-7 h-2 bg-[#1A1D26] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isPrimary ? 'bg-[#D4A853]' : 'bg-[#4B5164]'
                            }`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                        <span className="col-span-2 sm:col-span-1 text-right font-mono text-xs tabular-nums text-[#9E9B93]">
                          {score} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* Saved Diagnostic History for Logged-in Users */}
          {user && history.length > 0 && (
            <section aria-label="Historial de diagnósticos" className="pt-6 border-t border-[#232630] space-y-4">
              <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                Historial de Diagnósticos Guardados
              </h3>
              <div className="divide-y divide-[#20232C]">
                {history.map((item) => {
                  const p = getProfileByNumber(item.primaryType);
                  return (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                          <span className="font-mono tabular-nums text-[#D4A853]">
                            0{p.number} · {item.wing}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.createdAtLabel}</span>
                        </div>
                        <p className="text-sm font-medium text-[#F2EFE9]">{p.name}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onApplyProfile(p.number);
                            void saveDetectedType(p.number, item.wing);
                            onGoToProfile(p.number);
                          }}
                          className="text-xs font-medium text-[#D4A853] hover:text-[#E5BC6E] transition-colors cursor-pointer"
                        >
                          Abrir Perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteHistory(item.id)}
                          aria-label="Eliminar registro"
                          className="p-1.5 text-[#7D7B74] hover:text-[#C86D5B] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
