import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Check,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ENNEAGRAM_PROFILES, getProfileByNumber } from '../data/enneagramData';
import { OperationType, db, handleFirestoreError } from '../firebase';
import { AuthGateNotice } from './AuthGateNotice';

interface DailyChallenge {
  day: number;
  title: string;
  practice: string;
  reflectionPrompt: string;
}

interface ActionPlanRecord {
  id?: string;
  enneatypeNumber: number;
  wing: string;
  focusArea: string;
  title: string;
  integrationDirection: string;
  weeklyMantra: string;
  warningSign: string;
  dailyChallenges: DailyChallenge[];
  completedDays: number[];
  createdAtLabel?: string;
}

interface ActionPlanViewProps {
  activeNumber: number;
  onSelectNumber: (num: number) => void;
}

const FOCUS_AREAS = [
  'Integración personal y presencia cotidiana',
  'Vínculos, empatía y límites saludables',
  'Trabajo consciente sin desgaste egoico',
  'Silencio mental y gestión de la reactividad',
  'Creatividad, propósito y acción enfocada',
];

const BAND_OPTIONS = ['Niveles Sanos', 'Niveles Promedio', 'Niveles de Estrés'];

export function ActionPlanView({ activeNumber, onSelectNumber }: ActionPlanViewProps) {
  const { user, userProfile } = useAuth();
  const profile = getProfileByNumber(activeNumber);

  const defaultWing =
    userProfile?.detectedType === profile.number && userProfile.preferredWing
      ? userProfile.preferredWing
      : profile.wings[0].code;

  const [wing, setWing] = useState<string>(defaultWing);
  const [focusArea, setFocusArea] = useState<string>(FOCUS_AREAS[0]);
  const [developmentBand, setDevelopmentBand] = useState<string>(BAND_OPTIONS[1]);
  const [userReflection, setUserReflection] = useState<string>('');

  const [generating, setGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<ActionPlanRecord | null>(null);
  const [savedPlans, setSavedPlans] = useState<ActionPlanRecord[]>([]);

  useEffect(() => {
    const nextWing =
      userProfile?.detectedType === profile.number && userProfile.preferredWing
        ? userProfile.preferredWing
        : profile.wings[0].code;
    setWing(nextWing);
  }, [profile.number, profile.wings, userProfile]);

  useEffect(() => {
    if (!user) {
      setSavedPlans([]);
      return;
    }

    const colPath = `users/${user.uid}/actionPlans`;
    const q = query(
      collection(db, 'users', user.uid, 'actionPlans'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items: ActionPlanRecord[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate ? data.createdAt.toDate() : null;
          return {
            id: d.id,
            enneatypeNumber: Number(data.enneatypeNumber ?? 1),
            wing: String(data.wing ?? '1w9'),
            focusArea: String(data.focusArea ?? FOCUS_AREAS[0]),
            title: String(data.title ?? ''),
            integrationDirection: String(data.integrationDirection ?? ''),
            weeklyMantra: String(data.weeklyMantra ?? ''),
            warningSign: String(data.warningSign ?? ''),
            dailyChallenges: Array.isArray(data.dailyChallenges)
              ? (data.dailyChallenges as DailyChallenge[])
              : [],
            completedDays: Array.isArray(data.completedDays)
              ? data.completedDays.map(Number)
              : [],
            createdAtLabel: ts
              ? ts.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Reciente',
          };
        });
        setSavedPlans(items);
        if (items.length > 0) {
          setActivePlan((prev) => {
            if (prev?.id) {
              return items.find((item) => item.id === prev.id) ?? items[0];
            }
            return items[0];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colPath);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setApiError(null);

    try {
      const response = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enneatypeNumber: profile.number,
          wing,
          developmentBand,
          focusArea,
          userReflection,
        }),
      });

      const data = (await response.json()) as Partial<ActionPlanRecord> & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error || 'No se pudo generar el plan semanal.');
      }

      const newPlan: ActionPlanRecord = {
        enneatypeNumber: profile.number,
        wing,
        focusArea,
        title: String(data.title ?? 'Plan de Integración Semanal'),
        integrationDirection: String(data.integrationDirection ?? ''),
        weeklyMantra: String(data.weeklyMantra ?? ''),
        warningSign: String(data.warningSign ?? ''),
        dailyChallenges: Array.isArray(data.dailyChallenges) ? data.dailyChallenges : [],
        completedDays: [],
      };

      if (user) {
        const colPath = `users/${user.uid}/actionPlans`;
        try {
          const docRef = await addDoc(collection(db, 'users', user.uid, 'actionPlans'), {
            uid: user.uid,
            enneatypeNumber: newPlan.enneatypeNumber,
            wing: newPlan.wing,
            focusArea: newPlan.focusArea,
            title: newPlan.title,
            integrationDirection: newPlan.integrationDirection,
            weeklyMantra: newPlan.weeklyMantra,
            warningSign: newPlan.warningSign,
            dailyChallenges: newPlan.dailyChallenges,
            completedDays: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setActivePlan({ ...newPlan, id: docRef.id });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, colPath);
        }
      } else {
        setActivePlan(newPlan);
      }
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Error inesperado al consultar la IA.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleDay = async (dayNumber: number) => {
    if (!activePlan) return;
    const exists = activePlan.completedDays.includes(dayNumber);
    const nextDays = exists
      ? activePlan.completedDays.filter((d) => d !== dayNumber)
      : [...activePlan.completedDays, dayNumber].sort((a, b) => a - b);

    setActivePlan({ ...activePlan, completedDays: nextDays });

    if (user && activePlan.id) {
      const docPath = `users/${user.uid}/actionPlans/${activePlan.id}`;
      try {
        await updateDoc(doc(db, 'users', user.uid, 'actionPlans', activePlan.id), {
          completedDays: nextDays,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/actionPlans/${planId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'actionPlans', planId));
      if (activePlan?.id === planId) {
        setActivePlan(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
              <span className="font-mono tabular-nums text-[#84B59F]">
                Integración: Eneatipo 0{profile.number} → 0{profile.integration.targetNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.integration.targetName}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
              Plan de Acción Personalizado
            </h1>
            <p className="text-sm sm:text-base text-[#B8B4AC] max-w-2xl leading-relaxed">
              Convierte la teoría en práctica viva: genera un mini-reto semanal de 7 días diseñado
              con inteligencia artificial para activar la flecha de integración de tu perfil.
            </p>
          </div>

          <div className="shrink-0">
            <label htmlFor="plan-type-select" className="sr-only">
              Elegir Eneatipo para el Plan
            </label>
            <select
              id="plan-type-select"
              value={profile.number}
              onChange={(e) => onSelectNumber(Number(e.target.value))}
              className="px-3 py-2 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
            >
              {ENNEAGRAM_PROFILES.map((p) => (
                <option key={p.number} value={p.number}>
                  Eneatipo {p.number} · {p.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="px-6 sm:px-10 py-8 space-y-10">
          {!user && (
            <AuthGateNotice
              description="Inicia sesión con Google para guardar tus planes semanales de integración y marcar tu progreso diario en tu cuenta."
            />
          )}

          {/* Generator Form */}
          <section aria-label="Configurar mini-reto semanal" className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] space-y-5">
            <div className="flex items-center gap-2 text-xs text-[#84B59F]">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>
                Dirección de crecimiento: cultivar la virtud de {profile.virtue} integrando el{' '}
                {profile.integration.targetName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="plan-wing" className="block text-xs font-medium text-[#9E9B93]">
                  Ala predominante
                </label>
                <select
                  id="plan-wing"
                  value={wing}
                  onChange={(e) => setWing(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                >
                  {profile.wings.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-band" className="block text-xs font-medium text-[#9E9B93]">
                  Momento actual
                </label>
                <select
                  id="plan-band"
                  value={developmentBand}
                  onChange={(e) => setDevelopmentBand(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                >
                  {BAND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-focus" className="block text-xs font-medium text-[#9E9B93]">
                  Área de enfoque semanal
                </label>
                <select
                  id="plan-focus"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                >
                  {FOCUS_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="plan-reflection" className="block text-xs font-medium text-[#9E9B93]">
                Contexto o situación actual (opcional)
              </label>
              <textarea
                id="plan-reflection"
                rows={2}
                maxLength={400}
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                placeholder="Ej. Siento mucha autoexigencia en un proyecto nuevo y me cuesta soltar el control..."
                className="w-full p-3.5 rounded-lg bg-[#0E1015] border border-[#2A2E3A] text-sm text-[#F2EFE9] placeholder:text-[#66645E] focus:border-[#D4A853] focus:outline-none resize-none"
              />
            </div>

            {apiError && (
              <p className="text-xs text-[#C86D5B]">{apiError}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#7D7B74]">
                Genera 7 micro-retos diarios de 5 a 15 minutos adaptados a tu perfil.
              </span>
              <button
                type="button"
                disabled={generating}
                onClick={() => void handleGeneratePlan()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{generating ? 'Diseñando tu semana...' : 'Generar Mini-Reto Semanal'}</span>
              </button>
            </div>
          </section>

          {/* Active Weekly Action Plan Display */}
          {activePlan && (
            <section aria-label="Mini-reto semanal activo" className="space-y-8">
              <div className="space-y-4 border-b border-[#232630] pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
                    <span className="font-mono tabular-nums text-[#D4A853]">
                      Eneatipo 0{activePlan.enneatypeNumber} · {activePlan.wing}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activePlan.focusArea}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#84B59F]">
                    {activePlan.completedDays.length} / 7 días completados
                  </span>
                </div>

                <h2 className="font-serif text-3xl font-medium text-[#F2EFE9]">
                  {activePlan.title}
                </h2>

                <blockquote className="py-4 border-y border-[#232630] font-serif italic text-lg text-[#E8E3D9]">
                  «{activePlan.weeklyMantra}»
                </blockquote>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-[#84B59F]">
                      Dinámica de Integración
                    </h3>
                    <p className="text-sm text-[#C6C2B9] leading-relaxed">
                      {activePlan.integrationDirection}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-[#C86D5B]">
                      Señal del Ego a Observar
                    </h3>
                    <p className="text-sm text-[#C6C2B9] leading-relaxed">
                      {activePlan.warningSign}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Day Micro-Challenge List */}
              <div className="divide-y divide-[#222530]">
                {activePlan.dailyChallenges.map((item) => {
                  const isDone = activePlan.completedDays.includes(item.day);
                  return (
                    <div
                      key={item.day}
                      className={`py-5 flex items-start gap-4 transition-opacity ${
                        isDone ? 'opacity-75' : 'opacity-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void handleToggleDay(item.day)}
                        aria-label={`Marcar Día ${item.day} como ${isDone ? 'pendiente' : 'completado'}`}
                        className={`mt-1 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-[#84B59F] border-[#84B59F] text-[#111318]'
                            : 'bg-[#12141A] border-[#383D4D] hover:border-[#D4A853]'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <span className="font-mono text-xs tabular-nums text-[#D4A853]">
                            Día 0{item.day}
                          </span>
                          <h3
                            className={`font-serif text-xl font-medium ${
                              isDone ? 'line-through text-[#9E9B93]' : 'text-[#F2EFE9]'
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[#D3CFC6] leading-relaxed">{item.practice}</p>
                        <p className="text-xs italic text-[#9E9B93]">
                          Autoobservación: {item.reflectionPrompt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Saved Weekly Plans List */}
          {user && savedPlans.length > 0 && (
            <section aria-label="Planes semanales guardados" className="pt-4 border-t border-[#232630] space-y-4">
              <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                Tus Planes Semanales Guardados
              </h3>
              <div className="divide-y divide-[#20232C]">
                {savedPlans.map((plan) => {
                  const isCurrent = activePlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => setActivePlan(plan)}
                        className="text-left space-y-0.5 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                          <span className="font-mono tabular-nums text-[#D4A853]">
                            0{plan.enneatypeNumber} · {plan.wing}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {plan.completedDays.length}/7 días
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{plan.createdAtLabel}</span>
                        </div>
                        <p
                          className={`text-sm font-medium transition-colors ${
                            isCurrent
                              ? 'text-[#D4A853]'
                              : 'text-[#F2EFE9] group-hover:text-[#D4A853]'
                          }`}
                        >
                          {plan.title}
                        </p>
                      </button>

                      {plan.id && (
                        <button
                          type="button"
                          onClick={() => void handleDeletePlan(plan.id!)}
                          aria-label="Eliminar plan"
                          className="p-1.5 text-[#7D7B74] hover:text-[#C86D5B] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
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
