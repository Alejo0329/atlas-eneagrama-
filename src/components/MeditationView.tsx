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
  Check,
  Pause,
  Play,
  RefreshCw,
  Save,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ESSENCE_FREQUENCIES,
  ESSENCE_PROGRAMMING_BY_TYPE,
} from '../data/diagnosticQuestions';
import { ENNEAGRAM_PROFILES, getProfileByNumber } from '../data/enneagramData';
import { OperationType, db, handleFirestoreError } from '../firebase';
import { HarmonicSoundEngine } from '../utils/soundEngine';
import { AuthGateNotice } from './AuthGateNotice';

interface SavedEssenceProgram {
  id: string;
  enneatypeNumber: number;
  frequencyHz: number;
  intention: string;
  affirmation: string;
  durationMinutes: number;
  createdAtLabel: string;
}

interface MeditationViewProps {
  activeNumber: number;
  onSelectNumber: (num: number) => void;
}

export function MeditationView({ activeNumber, onSelectNumber }: MeditationViewProps) {
  const { user } = useAuth();
  const profile = getProfileByNumber(activeNumber);
  const essenceGuide = ESSENCE_PROGRAMMING_BY_TYPE[profile.number];

  const [selectedHz, setSelectedHz] = useState<number>(432);
  const [volume, setVolume] = useState<number>(0.3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [durationMin, setDurationMin] = useState<number>(5);
  const [remainingSec, setRemainingSec] = useState<number>(5 * 60);

  const [affirmationIdx, setAffirmationIdx] = useState<number>(0);
  const [intentionText, setIntentionText] = useState<string>(
    essenceGuide.programmingDeclaration,
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedPrograms, setSavedPrograms] = useState<SavedEssenceProgram[]>([]);

  const engineRef = useRef<HarmonicSoundEngine | null>(null);

  useEffect(() => {
    const engine = new HarmonicSoundEngine();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    setAffirmationIdx(0);
    setIntentionText(ESSENCE_PROGRAMMING_BY_TYPE[profile.number].programmingDeclaration);
    setSaveSuccess(false);
  }, [profile.number]);

  useEffect(() => {
    if (isPlaying) {
      engineRef.current?.setFrequency(selectedHz);
    }
  }, [selectedHz, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      engineRef.current?.setVolume(volume);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    if (durationMin === 0) return;

    const timer = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          engineRef.current?.stop();
          setIsPlaying(false);
          return durationMin * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, durationMin]);

  useEffect(() => {
    if (!user) {
      setSavedPrograms([]);
      return;
    }

    const colPath = `users/${user.uid}/essencePrograms`;
    const q = query(
      collection(db, 'users', user.uid, 'essencePrograms'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items: SavedEssenceProgram[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate ? data.createdAt.toDate() : null;
          return {
            id: d.id,
            enneatypeNumber: Number(data.enneatypeNumber ?? 1),
            frequencyHz: Number(data.frequencyHz ?? 432),
            intention: String(data.intention ?? ''),
            affirmation: String(data.affirmation ?? ''),
            durationMinutes: Number(data.durationMinutes ?? 5),
            createdAtLabel: ts
              ? ts.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Hoy',
          };
        });
        setSavedPrograms(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colPath);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const togglePlay = () => {
    if (isPlaying) {
      engineRef.current?.stop();
      setIsPlaying(false);
    } else {
      if (remainingSec <= 0 && durationMin > 0) {
        setRemainingSec(durationMin * 60);
      }
      engineRef.current?.start(selectedHz, volume);
      setIsPlaying(true);
    }
  };

  const handleSelectDuration = (mins: number) => {
    setDurationMin(mins);
    setRemainingSec(mins * 60);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeAffirmation =
    essenceGuide.affirmations[affirmationIdx % essenceGuide.affirmations.length];

  const handleSaveProgram = async () => {
    if (!user) return;
    const cleanIntention = intentionText.trim().slice(0, 600);
    if (cleanIntention.length < 3) return;

    setSaving(true);
    setSaveSuccess(false);
    const colPath = `users/${user.uid}/essencePrograms`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'essencePrograms'), {
        uid: user.uid,
        enneatypeNumber: profile.number,
        frequencyHz: Math.round(selectedHz),
        intention: cleanIntention,
        affirmation: activeAffirmation.slice(0, 400),
        durationMinutes: durationMin,
        createdAt: serverTimestamp(),
      });
      setSaveSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/essencePrograms/${programId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'essencePrograms', programId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const activeFrequencyMeta =
    ESSENCE_FREQUENCIES.find((f) => f.hz === selectedHz) ?? ESSENCE_FREQUENCIES[0];

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
              <span className="font-mono tabular-nums text-[#D4A853]">
                Modo Contemplativo · {selectedHz} Hz
              </span>
              <span aria-hidden="true">·</span>
              <span>Eneatipo 0{profile.number} ({profile.name})</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
              Meditación y Programación de Esencia
            </h1>
            <p className="text-sm sm:text-base text-[#B8B4AC] max-w-2xl leading-relaxed">
              Armoniza el sistema nervioso con tonos puros desde 432 Hz mientras reprogramas la
              pasión del ego hacia la virtud esencial de tu perfil.
            </p>
          </div>

          <div className="shrink-0">
            <label htmlFor="meditation-type-select" className="sr-only">
              Elegir Eneatipo
            </label>
            <select
              id="meditation-type-select"
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
              description="El sintetizador de frecuencias 432 Hz funciona al instante. Inicia sesión con Google para guardar tus programaciones de esencia y sesiones en tu diario personal."
            />
          )}

          {/* Frequency & Breathing Studio */}
          <section aria-label="Sintonizador de frecuencias armónicas" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Audio Control Chamber */}
            <div className="lg:col-span-7 p-6 rounded-xl border border-[#282B36] bg-[#12141A] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-[#D4A853] tabular-nums">
                      {activeFrequencyMeta.label}
                    </p>
                    <p className="text-xs text-[#9E9B93] mt-0.5">{activeFrequencyMeta.subtitle}</p>
                  </div>
                  <span className="font-mono text-2xl tabular-nums text-[#F2EFE9]">
                    {durationMin === 0 ? 'Libre' : formatTimer(remainingSec)}
                  </span>
                </div>

                <p className="text-sm text-[#B8B4AC] leading-relaxed">
                  {activeFrequencyMeta.description}
                </p>

                {/* Frequency Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ESSENCE_FREQUENCIES.map((freq) => {
                    const active = freq.hz === selectedHz;
                    return (
                      <button
                        key={freq.hz}
                        type="button"
                        onClick={() => setSelectedHz(freq.hz)}
                        className={`py-2 px-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#D4A853] text-[#111318] border-[#D4A853] font-semibold'
                            : 'bg-[#161922] text-[#D6D2C9] border-[#282C38] hover:border-[#494E5F]'
                        }`}
                      >
                        <span className="block font-mono text-xs tabular-nums">{freq.hz} Hz</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Playback & Volume & Timer */}
              <div className="pt-4 border-t border-[#222530] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isPlaying
                        ? 'bg-[#252936] text-[#F2EFE9] border border-[#D4A853]'
                        : 'bg-[#D4A853] text-[#111318] hover:bg-[#E0B96A]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" aria-hidden="true" />
                        <span>Pausar Resonancia</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" aria-hidden="true" />
                        <span>Iniciar Resonancia {selectedHz} Hz</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-[#9E9B93]" aria-hidden="true" />
                    <label htmlFor="meditation-volume" className="sr-only">
                      Volumen de frecuencia
                    </label>
                    <input
                      id="meditation-volume"
                      type="range"
                      min={0.05}
                      max={0.8}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-28 accent-[#D4A853] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#9E9B93] mr-1">Duración:</span>
                  {[3, 5, 10, 15, 0].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSelectDuration(mins)}
                      className={`px-2.5 py-1 rounded border font-mono tabular-nums transition-colors cursor-pointer ${
                        durationMin === mins
                          ? 'bg-[#222631] text-[#F2EFE9] border-[#4A5063]'
                          : 'bg-transparent text-[#9E9B93] border-[#252833] hover:text-[#F2EFE9]'
                      }`}
                    >
                      {mins === 0 ? 'Libre' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Calm Resonance Visual Anchor & Breathing Guide */}
            <div className="lg:col-span-5 p-6 rounded-xl border border-[#282B36] bg-[#101218] flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border border-[#D4A853]/35 transition-transform duration-[4000ms] ease-in-out ${
                    isPlaying ? 'scale-110 opacity-90' : 'scale-95 opacity-45'
                  }`}
                />
                <div
                  className={`w-24 h-24 rounded-full border border-[#D4A853]/70 bg-[#171A23] flex flex-col items-center justify-center transition-transform duration-[4000ms] ease-in-out ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <span className="font-mono text-lg tabular-nums text-[#D4A853]">
                    {selectedHz} Hz
                  </span>
                  <span className="text-[11px] text-[#9E9B93] mt-0.5">
                    {isPlaying ? 'En resonancia' : 'En reposo'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-mono text-[#D4A853]">
                  Cadencia · {profile.virtue}
                </p>
                <p className="text-sm text-[#E9E5DC] leading-relaxed">
                  {essenceGuide.breathingPattern}
                </p>
                <p className="text-xs text-[#9E9B93]">
                  Frecuencia sugerida para el Eneatipo {profile.number}: {essenceGuide.recommendedHz} Hz
                </p>
              </div>
            </div>
          </section>

          {/* Personalized Affirmations & Essence Programming */}
          <section aria-label="Afirmaciones y programaciones para la esencia" className="space-y-6 pt-2 border-t border-[#232630]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-mono text-[#D4A853]">{essenceGuide.essenceCode}</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
                  Afirmaciones y Programaciones para la Esencia
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAffirmationIdx((prev) => (prev + 1) % essenceGuide.affirmations.length)
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#E5BC6E] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Siguiente afirmación</span>
              </button>
            </div>

            {/* Active Affirmation Pull-Quote */}
            <blockquote className="py-6 px-6 sm:px-10 border-y border-[#262934] text-center space-y-2">
              <p className="font-serif italic text-xl sm:text-2xl text-[#F2EFE9] leading-relaxed max-w-2xl mx-auto">
                «{activeAffirmation}»
              </p>
              <footer className="text-xs text-[#9E9B93]">
                Afirmación {affirmationIdx + 1} de {essenceGuide.affirmations.length} · Eneatipo 0
                {profile.number} ({profile.name})
              </footer>
            </blockquote>

            {/* Interactive Essence Programming Form */}
            <div className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label
                  htmlFor="essence-programming-input"
                  className="font-serif text-xl font-medium text-[#F2EFE9]"
                >
                  Tu Programación Consciente para la Esencia
                </label>
                <button
                  type="button"
                  onClick={() => setIntentionText(essenceGuide.programmingDeclaration)}
                  className="text-xs text-[#9E9B93] hover:text-[#D4A853] transition-colors cursor-pointer"
                >
                  Restaurar base del Eneatipo {profile.number}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#A8A49C] leading-relaxed">
                Edita o personaliza esta declaración para anclar el tránsito desde tu patrón egoico (
                {profile.passion}) hacia tu virtud esencial ({profile.virtue}) mientras escuchas{' '}
                {selectedHz} Hz.
              </p>

              <textarea
                id="essence-programming-input"
                rows={3}
                maxLength={600}
                value={intentionText}
                onChange={(e) => {
                  setIntentionText(e.target.value);
                  setSaveSuccess(false);
                }}
                className="w-full p-4 rounded-lg bg-[#0E1015] border border-[#2A2E3A] text-sm text-[#F2EFE9] leading-relaxed focus:border-[#D4A853] focus:outline-none resize-none"
                placeholder="Escribe tu programación de esencia para esta sesión..."
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] tabular-nums text-[#7D7B74]">
                  {intentionText.length} / 600 caracteres
                </span>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#84B59F]">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Programación guardada</span>
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!user || saving || intentionText.trim().length < 3}
                    onClick={() => void handleSaveProgram()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {saving
                        ? 'Guardando...'
                        : user
                        ? 'Registrar Sesión y Programación'
                        : 'Inicia sesión para guardar'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Saved Essence Programs Journal */}
          {user && savedPrograms.length > 0 && (
            <section aria-label="Bitácora de programaciones de esencia" className="pt-4 border-t border-[#232630] space-y-4">
              <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                Bitácora de Programaciones Guardadas
              </h3>
              <div className="divide-y divide-[#20232C]">
                {savedPrograms.map((item) => {
                  const p = getProfileByNumber(item.enneatypeNumber);
                  return (
                    <div
                      key={item.id}
                      className="py-4 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
                          <span className="font-mono tabular-nums text-[#D4A853]">
                            0{p.number} · {item.frequencyHz} Hz
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.durationMinutes === 0
                              ? 'Sesión libre'
                              : `${item.durationMinutes} min`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.createdAtLabel}</span>
                        </div>
                        <p className="text-sm text-[#E9E5DC] leading-relaxed">{item.intention}</p>
                        <p className="text-xs italic text-[#9E9B93]">«{item.affirmation}»</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDeleteProgram(item.id)}
                        aria-label="Eliminar programación"
                        className="p-1.5 text-[#7D7B74] hover:text-[#C86D5B] transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
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
