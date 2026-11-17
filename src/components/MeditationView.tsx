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
  Headphones,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Video,
  Volume2,
  Waves,
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
import type { GuidedAudioRecord, VideoRecord } from './AdminView';
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

type MeditationSubTab = 'frequencies' | 'videos' | 'guided';
type MediaFilter = 'all' | 'public' | 'pro' | 'activeType';

interface MeditationViewProps {
  activeNumber: number;
  onSelectNumber: (num: number) => void;
  onRequestUpgrade: (reason: string) => void;
  onOpenAdmin?: () => void;
}

export function MeditationView({
  activeNumber,
  onSelectNumber,
  onRequestUpgrade,
  onOpenAdmin,
}: MeditationViewProps) {
  const { user, isPro, isAdmin } = useAuth();
  const profile = getProfileByNumber(activeNumber);
  const essenceGuide = ESSENCE_PROGRAMMING_BY_TYPE[profile.number];

  const [subTab, setSubTab] = useState<MeditationSubTab>('frequencies');

  // Frequency + Affirmations state
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

  // Videoteca & Guided Audio state
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});
  const [audios, setAudios] = useState<GuidedAudioRecord[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<GuidedAudioRecord | null>(null);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

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

  // Listen to user's saved essence programs
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

  // Listen to YouTube Videoteca catalog
  useEffect(() => {
    const qVideos = query(
      collection(db, 'videos'),
      where('visibility', 'in', ['public', 'pro']),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      qVideos,
      (snap) => {
        const items: VideoRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            youtubeId: String(data.youtubeId ?? ''),
            enneatypeNumber: Number(data.enneatypeNumber ?? 0),
            visibility: data.visibility === 'pro' ? 'pro' : 'public',
          };
        });
        setVideos(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'videos');
      },
    );

    return () => unsub();
  }, []);

  // Listen to Guided Audios catalog
  useEffect(() => {
    const qAudios = query(
      collection(db, 'guidedAudios'),
      where('visibility', 'in', ['public', 'pro']),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      qAudios,
      (snap) => {
        const items: GuidedAudioRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            enneatypeNumber: Number(data.enneatypeNumber ?? 0),
            visibility: data.visibility === 'pro' ? 'pro' : 'public',
            audioUrl: String(data.audioUrl ?? ''),
            storagePath: String(data.storagePath ?? ''),
            durationLabel: String(data.durationLabel ?? '10 min'),
          };
        });
        setAudios(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'guidedAudios');
      },
    );

    return () => unsub();
  }, []);

  const togglePlay = () => {
    if (!isPro) {
      onRequestUpgrade('Reproductor de Afirmaciones y Frecuencias Armónicas Pro');
      return;
    }
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
    if (!isPro) {
      onRequestUpgrade('Bitácora de Programación de Esencia Pro');
      return;
    }
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

  const handleSelectVideo = (video: VideoRecord) => {
    if (video.visibility === 'pro' && !isPro) {
      onRequestUpgrade(`Video Exclusivo Pro: ${video.title}`);
      return;
    }
    setSelectedVideo(video);
  };

  const handleSelectAudio = (audio: GuidedAudioRecord) => {
    if (audio.visibility === 'pro' && !isPro) {
      onRequestUpgrade(`Meditación Guiada Pro: ${audio.title}`);
      return;
    }
    setSelectedAudio(audio);
  };

  const filterMediaItem = <T extends { visibility: 'public' | 'pro'; enneatypeNumber: number }>(
    item: T,
  ) => {
    if (mediaFilter === 'public') return item.visibility === 'public';
    if (mediaFilter === 'pro') return item.visibility === 'pro';
    if (mediaFilter === 'activeType') {
      return item.enneatypeNumber === profile.number || item.enneatypeNumber === 0;
    }
    return true;
  };

  const filteredVideos = videos.filter(filterMediaItem);
  const filteredAudios = audios.filter(filterMediaItem);

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
                Contemplación · {selectedHz} Hz
              </span>
              <span aria-hidden="true">·</span>
              <span>Eneatipo 0{profile.number} ({profile.name})</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
              Meditación, Frecuencias y Videoteca
            </h1>
            <p className="text-sm sm:text-base text-[#B8B4AC] max-w-2xl leading-relaxed">
              Espacio sereno para armonizar con frecuencias de 432 Hz y 528 Hz, programar
              afirmaciones esenciales y explorar prácticas en video y audio guiado.
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

        {/* Sub-navigation Switcher */}
        <div className="px-6 sm:px-10 pt-5 pb-4 border-b border-[#232630] flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 bg-[#101217] border border-[#242731] rounded-lg overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setSubTab('frequencies')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'frequencies'
                  ? 'bg-[#222631] text-[#F2EFE9]'
                  : 'text-[#9E9B93] hover:text-[#F2EFE9]'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
              <span>Frecuencias y Afirmaciones</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('videos')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'videos'
                  ? 'bg-[#222631] text-[#F2EFE9]'
                  : 'text-[#9E9B93] hover:text-[#F2EFE9]'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
              <span>Videoteca ({videos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('guided')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'guided'
                  ? 'bg-[#222631] text-[#F2EFE9]'
                  : 'text-[#9E9B93] hover:text-[#F2EFE9]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
              <span>Audios Guiados ({audios.length})</span>
            </button>
          </div>

          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#E5BC6E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Gestionar Contenidos</span>
            </button>
          )}
        </div>

        <div className="px-6 sm:px-10 py-8 space-y-10">
          {!user && (
            <AuthGateNotice
              description="Explora libremente las prácticas públicas. Inicia sesión con Google para sincronizar tu perfil, membresía Pro y bitácora de esencia."
            />
          )}

          {subTab === 'frequencies' && (
            <>
              {/* Frequency & Breathing Studio */}
              <section
                aria-label="Sintonizador de frecuencias armónicas"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
                {/* Left: Audio Control Chamber */}
                <div className="lg:col-span-7 p-6 rounded-xl border border-[#282B36] bg-[#12141A] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs text-[#D4A853] tabular-nums">
                          {activeFrequencyMeta.label}
                        </p>
                        <p className="text-xs text-[#9E9B93] mt-0.5">
                          {activeFrequencyMeta.subtitle}
                        </p>
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
                            <span className="block font-mono text-xs tabular-nums">
                              {freq.hz} Hz
                            </span>
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
                        {!isPro ? (
                          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : isPlaying ? (
                          <Pause className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Play className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span>
                          {!isPro
                            ? `Desbloquear Resonancia ${selectedHz} Hz (Pro)`
                            : isPlaying
                            ? 'Pausar Resonancia'
                            : `Iniciar Resonancia ${selectedHz} Hz`}
                        </span>
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
                      Frecuencia sugerida para el Eneatipo {profile.number}:{' '}
                      {essenceGuide.recommendedHz} Hz
                    </p>
                  </div>
                </div>
              </section>

              {/* Personalized Affirmations & Essence Programming */}
              <section
                aria-label="Afirmaciones y programaciones para la esencia"
                className="space-y-6 pt-2 border-t border-[#232630]"
              >
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
                    Afirmación {affirmationIdx + 1} de {essenceGuide.affirmations.length} · Eneatipo
                    0{profile.number} ({profile.name})
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
                    Edita o personaliza esta declaración para anclar el tránsito desde tu patrón
                    egoico ({profile.passion}) hacia tu virtud esencial ({profile.virtue}) mientras
                    escuchas {selectedHz} Hz.
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
                            ? isPro
                              ? 'Registrar Sesión y Programación'
                              : 'Guardar (Miembro Pro)'
                            : 'Inicia sesión para guardar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Saved Essence Programs Journal */}
              {user && savedPrograms.length > 0 && (
                <section
                  aria-label="Bitácora de programaciones de esencia"
                  className="pt-4 border-t border-[#232630] space-y-4"
                >
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
                            <p className="text-sm text-[#E9E5DC] leading-relaxed">
                              {item.intention}
                            </p>
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
            </>
          )}

          {subTab === 'videos' && (
            <section aria-label="Videoteca integrada de YouTube" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
                    Videoteca de Estudio y Meditación
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A8A49C]">
                    Reproduce lecciones y prácticas guiadas directamente aquí sin salir de la
                    plataforma.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="inline-flex items-center gap-1 p-1 bg-[#101217] border border-[#242731] rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'public', label: 'Públicos' },
                      { id: 'pro', label: 'Pro' },
                      { id: 'activeType', label: `Tipo ${profile.number}` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMediaFilter(f.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        mediaFilter === f.id
                          ? 'bg-[#222631] text-[#F2EFE9]'
                          : 'text-[#9E9B93] hover:text-[#F2EFE9]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Inline YouTube Embed */}
              {selectedVideo && (
                <div className="rounded-xl border border-[#343025] bg-[#101218] overflow-hidden">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?rel=0`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                        <span className="font-mono text-[#D4A853]">
                          {selectedVideo.enneatypeNumber === 0
                            ? 'General'
                            : `Eneatipo 0${selectedVideo.enneatypeNumber}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedVideo.visibility === 'pro' ? 'Exclusivo Pro' : 'Acceso Público'}</span>
                      </div>
                      <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                        {selectedVideo.title}
                      </h3>
                      <p className="text-sm text-[#B8B4AC] leading-relaxed">
                        {selectedVideo.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Gallery Grid */}
              {filteredVideos.length === 0 ? (
                <div className="p-8 rounded-xl border border-[#252833] bg-[#12141A] text-center space-y-3">
                  <Video className="w-7 h-7 text-[#7D7B74] mx-auto" aria-hidden="true" />
                  <p className="font-serif text-xl text-[#F2EFE9]">
                    Aún no hay videos en esta selección
                  </p>
                  <p className="text-xs sm:text-sm text-[#9E9B93] max-w-md mx-auto">
                    El administrador puede añadir videos de YouTube públicos o exclusivos Pro desde
                    el panel de gestión.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVideos.map((video) => {
                    const isLocked = video.visibility === 'pro' && !isPro;
                    const isActive = selectedVideo?.id === video.id;
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => handleSelectVideo(video)}
                        className={`group text-left rounded-xl border overflow-hidden transition-colors cursor-pointer flex flex-col ${
                          isActive
                            ? 'bg-[#1B1E28] border-[#D4A853]'
                            : 'bg-[#12141A] border-[#252833] hover:border-[#494E5F]'
                        }`}
                      >
                        <div className="relative aspect-video w-full bg-[#0D0F14] overflow-hidden">
                          {!brokenThumbs[video.id] ? (
                            <img
                              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                              alt={video.title}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setBrokenThumbs((prev) => ({ ...prev, [video.id]: true }))
                              }
                              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                                isLocked ? 'opacity-60' : 'opacity-90'
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#141720]">
                              <Video className="w-8 h-8 text-[#D4A853]/60" aria-hidden="true" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="w-11 h-11 rounded-full bg-[#111318]/90 border border-[#D4A853]/70 flex items-center justify-center text-[#D4A853]">
                              {isLocked ? (
                                <Lock className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                            <span className="font-mono tabular-nums text-[#D4A853]">
                              {video.enneatypeNumber === 0
                                ? 'General'
                                : `Eneatipo 0${video.enneatypeNumber}`}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                video.visibility === 'pro' ? 'text-[#D4A853]' : 'text-[#84B59F]'
                              }
                            >
                              {video.visibility === 'pro' ? 'Miembro Pro' : 'Público'}
                            </span>
                          </div>
                          <h3 className="font-serif text-xl font-medium text-[#F2EFE9] group-hover:text-[#D4A853] transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-xs text-[#A8A49C] leading-relaxed line-clamp-2">
                            {video.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {subTab === 'guided' && (
            <section aria-label="Meditaciones guiadas en audio" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
                    Meditaciones Guiadas en Audio
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A8A49C]">
                    Sesiones guiadas almacenadas de forma segura en la nube para acompañar tu
                    práctica contemplativa.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-[#101217] border border-[#242731] rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'public', label: 'Públicos' },
                      { id: 'pro', label: 'Pro' },
                      { id: 'activeType', label: `Tipo ${profile.number}` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMediaFilter(f.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        mediaFilter === f.id
                          ? 'bg-[#222631] text-[#F2EFE9]'
                          : 'text-[#9E9B93] hover:text-[#F2EFE9]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAudio && (
                <div className="p-6 rounded-xl border border-[#343025] bg-[#101218] space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                      <span className="font-mono text-[#D4A853]">
                        {selectedAudio.durationLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {selectedAudio.enneatypeNumber === 0
                          ? 'General'
                          : `Eneatipo 0${selectedAudio.enneatypeNumber}`}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                      {selectedAudio.title}
                    </h3>
                    <p className="text-sm text-[#B8B4AC]">{selectedAudio.description}</p>
                  </div>
                  <audio
                    controls
                    src={selectedAudio.audioUrl}
                    className="w-full"
                    preload="metadata"
                  />
                </div>
              )}

              {filteredAudios.length === 0 ? (
                <div className="p-8 rounded-xl border border-[#252833] bg-[#12141A] text-center space-y-3">
                  <Headphones className="w-7 h-7 text-[#7D7B74] mx-auto" aria-hidden="true" />
                  <p className="font-serif text-xl text-[#F2EFE9]">
                    Aún no hay audios guiados disponibles
                  </p>
                  <p className="text-xs sm:text-sm text-[#9E9B93] max-w-md mx-auto">
                    Los audios subidos por administración a Firebase Storage aparecerán aquí con su
                    nivel de acceso correspondiente.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#20232C]">
                  {filteredAudios.map((audio) => {
                    const isLocked = audio.visibility === 'pro' && !isPro;
                    const isActive = selectedAudio?.id === audio.id;
                    return (
                      <button
                        key={audio.id}
                        type="button"
                        onClick={() => handleSelectAudio(audio)}
                        className={`w-full text-left py-4 px-4 -mx-4 rounded-xl transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                          isActive ? 'bg-[#1B1E28]' : 'hover:bg-[#171A22]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
                            <span className="font-mono tabular-nums text-[#D4A853]">
                              {audio.durationLabel}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {audio.enneatypeNumber === 0
                                ? 'General'
                                : `Eneatipo 0${audio.enneatypeNumber}`}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                audio.visibility === 'pro' ? 'text-[#D4A853]' : 'text-[#84B59F]'
                              }
                            >
                              {audio.visibility === 'pro' ? 'Miembro Pro' : 'Público'}
                            </span>
                          </div>
                          <p className="font-serif text-xl font-medium text-[#F2EFE9]">
                            {audio.title}
                          </p>
                          <p className="text-xs sm:text-sm text-[#A8A49C]">{audio.description}</p>
                        </div>

                        <span className="w-10 h-10 rounded-full border border-[#323644] bg-[#14171F] flex items-center justify-center shrink-0 text-[#D4A853]">
                          {isLocked ? (
                            <Lock className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
