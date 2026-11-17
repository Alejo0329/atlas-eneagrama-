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
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
  Eye,
  Lock,
  Plus,
  Shield,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth, type MembershipPlan } from '../context/AuthContext';
import { ENNEAGRAM_PROFILES } from '../data/enneagramData';
import { OperationType, db, handleFirestoreError, storage } from '../firebase';

export interface VideoRecord {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  enneatypeNumber: number;
  visibility: 'public' | 'pro';
}

export interface GuidedAudioRecord {
  id: string;
  title: string;
  description: string;
  enneatypeNumber: number;
  visibility: 'public' | 'pro';
  audioUrl: string;
  storagePath: string;
  durationLabel: string;
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').split('/')[0];
      return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }
    if (url.searchParams.has('v')) {
      const id = url.searchParams.get('v') || '';
      return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'live');
    if (embedIdx !== -1 && parts[embedIdx + 1]) {
      const id = parts[embedIdx + 1];
      return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function AdminView() {
  const { user, isAdmin, userPlan, adminSetUserPlan } = useAuth();

  // Videos state
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoType, setVideoType] = useState<number>(0);
  const [videoVisibility, setVideoVisibility] = useState<'public' | 'pro'>('public');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);

  // Audio state
  const [audios, setAudios] = useState<GuidedAudioRecord[]>([]);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioDesc, setAudioDesc] = useState('');
  const [audioType, setAudioType] = useState<number>(0);
  const [audioVisibility, setAudioVisibility] = useState<'public' | 'pro'>('pro');
  const [audioDuration, setAudioDuration] = useState('10 min');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Membership manager state
  const [targetUid, setTargetUid] = useState('');
  const [targetPlan, setTargetPlan] = useState<MembershipPlan>('pro');
  const [planStatusMsg, setPlanStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const qVideos = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubVideos = onSnapshot(
      qVideos,
      (snap) => {
        setVideos(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title ?? ''),
              description: String(data.description ?? ''),
              youtubeId: String(data.youtubeId ?? ''),
              enneatypeNumber: Number(data.enneatypeNumber ?? 0),
              visibility: data.visibility === 'pro' ? 'pro' : 'public',
            };
          }),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'videos');
      },
    );

    const qAudios = query(collection(db, 'guidedAudios'), orderBy('createdAt', 'desc'));
    const unsubAudios = onSnapshot(
      qAudios,
      (snap) => {
        setAudios(
          snap.docs.map((d) => {
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
          }),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'guidedAudios');
      },
    );

    return () => {
      unsubVideos();
      unsubAudios();
    };
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl p-8 text-center space-y-3">
          <Shield className="w-8 h-8 text-[#C86D5B] mx-auto" aria-hidden="true" />
          <h1 className="font-serif text-3xl text-[#F2EFE9]">Acceso Restringido</h1>
          <p className="text-sm text-[#B8B4AC]">
            Este panel de gestión está reservado exclusivamente para cuentas con rol de
            administración verificado.
          </p>
        </div>
      </main>
    );
  }

  const handleAddVideo = async (e: FormEvent) => {
    e.preventDefault();
    setVideoError(null);
    const youtubeId = extractYouTubeId(videoUrl);
    if (!youtubeId) {
      setVideoError('Ingresa una URL de YouTube válida o un ID de video de 11 caracteres.');
      return;
    }
    if (videoTitle.trim().length < 2 || videoDesc.trim().length < 2) {
      setVideoError('Completa el título y la descripción del video.');
      return;
    }

    setSavingVideo(true);
    try {
      await addDoc(collection(db, 'videos'), {
        title: videoTitle.trim().slice(0, 160),
        description: videoDesc.trim().slice(0, 600),
        youtubeId,
        enneatypeNumber: videoType,
        visibility: videoVisibility,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setVideoTitle('');
      setVideoUrl('');
      setVideoDesc('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videos');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleToggleVideoVisibility = async (video: VideoRecord) => {
    const nextVis = video.visibility === 'public' ? 'pro' : 'public';
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        visibility: nextVis,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${video.id}`);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteDoc(doc(db, 'videos', videoId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `videos/${videoId}`);
    }
  };

  const handleUploadAudio = async (e: FormEvent) => {
    e.preventDefault();
    setAudioError(null);
    if (!audioFile) {
      setAudioError('Selecciona un archivo de audio (.mp3, .wav, .m4a u .ogg).');
      return;
    }
    if (audioFile.size > 50 * 1024 * 1024) {
      setAudioError('El archivo supera el límite máximo de 50 MB.');
      return;
    }
    if (audioTitle.trim().length < 2 || audioDesc.trim().length < 2) {
      setAudioError('Completa el título y la descripción de la meditación.');
      return;
    }

    const safeFileName = audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `guided_meditations/type_${audioType}/${Date.now()}_${safeFileName}`;
    const storageRef = ref(storage, storagePath);

    try {
      setUploadProgress(1);
      const uploadTask = uploadBytesResumable(storageRef, audioFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            );
            setUploadProgress(pct);
          },
          (err) => reject(err),
          () => resolve(),
        );
      });

      const audioUrl = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(collection(db, 'guidedAudios'), {
        title: audioTitle.trim().slice(0, 160),
        description: audioDesc.trim().slice(0, 600),
        enneatypeNumber: audioType,
        visibility: audioVisibility,
        audioUrl: audioUrl.slice(0, 1000),
        storagePath: storagePath.slice(0, 400),
        durationLabel: (audioDuration.trim() || '10 min').slice(0, 30),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAudioTitle('');
      setAudioDesc('');
      setAudioFile(null);
      setUploadProgress(null);
    } catch (error) {
      setUploadProgress(null);
      setAudioError(
        error instanceof Error
          ? `No se pudo subir el audio a Firebase Storage: ${error.message}`
          : 'Error al subir el audio a Firebase Storage.',
      );
    }
  };

  const handleToggleAudioVisibility = async (audio: GuidedAudioRecord) => {
    const nextVis = audio.visibility === 'public' ? 'pro' : 'public';
    try {
      await updateDoc(doc(db, 'guidedAudios', audio.id), {
        visibility: nextVis,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `guidedAudios/${audio.id}`);
    }
  };

  const handleDeleteAudio = async (audio: GuidedAudioRecord) => {
    try {
      await deleteDoc(doc(db, 'guidedAudios', audio.id));
      if (audio.storagePath) {
        await deleteObject(ref(storage, audio.storagePath)).catch(() => undefined);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `guidedAudios/${audio.id}`);
    }
  };

  const handleUpdateMemberPlan = async (e: FormEvent) => {
    e.preventDefault();
    setPlanStatusMsg(null);
    const uidToUpdate = targetUid.trim() || user.uid;
    await adminSetUserPlan(uidToUpdate, targetPlan);
    setPlanStatusMsg(`Plan actualizado a "${targetPlan}" para el usuario ${uidToUpdate}.`);
  };

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4A853]">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Panel de Administración · Gestión de Contenidos</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
            Videoteca, Audios y Membresías
          </h1>
          <p className="text-sm text-[#B8B4AC]">
            Registra videos de YouTube, sube meditaciones guiadas en audio a Firebase Storage y
            define la visibilidad entre acceso público o exclusivo Pro.
          </p>
        </header>

        <div className="px-6 sm:px-10 py-8 space-y-12">
          {/* 1. YouTube Videoteca Manager */}
          <section aria-label="Gestión de Videoteca de YouTube" className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#232630] pb-3">
              <Video className="w-4 h-4 text-[#D4A853]" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                1. Videoteca Integrada de YouTube
              </h2>
            </div>

            <form
              onSubmit={(e) => void handleAddVideo(e)}
              className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="yt-title" className="block text-xs font-medium text-[#9E9B93]">
                    Título del video
                  </label>
                  <input
                    id="yt-title"
                    type="text"
                    maxLength={160}
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Ej. Introducción al Eneatipo 4 y la Ecuanimidad"
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="yt-url" className="block text-xs font-medium text-[#9E9B93]">
                    Enlace o ID de YouTube
                  </label>
                  <input
                    id="yt-url"
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-1.5">
                  <label htmlFor="yt-type" className="block text-xs font-medium text-[#9E9B93]">
                    Eneatipo asociado
                  </label>
                  <select
                    id="yt-type"
                    value={videoType}
                    onChange={(e) => setVideoType(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                  >
                    <option value={0}>General · Todos los tipos</option>
                    {ENNEAGRAM_PROFILES.map((p) => (
                      <option key={p.number} value={p.number}>
                        Eneatipo {p.number} · {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1 space-y-1.5">
                  <label htmlFor="yt-vis" className="block text-xs font-medium text-[#9E9B93]">
                    Visibilidad
                  </label>
                  <select
                    id="yt-vis"
                    value={videoVisibility}
                    onChange={(e) => setVideoVisibility(e.target.value as 'public' | 'pro')}
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                  >
                    <option value="public">Público (Gratis)</option>
                    <option value="pro">Exclusivo Pro</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={savingVideo}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{savingVideo ? 'Guardando...' : 'Añadir a Videoteca'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="yt-desc" className="block text-xs font-medium text-[#9E9B93]">
                  Descripción breve
                </label>
                <textarea
                  id="yt-desc"
                  rows={2}
                  maxLength={600}
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  placeholder="Resumen del contenido o práctica..."
                  className="w-full p-3 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none resize-none"
                />
              </div>

              {videoError && <p className="text-xs text-[#C86D5B]">{videoError}</p>}
            </form>

            {videos.length > 0 && (
              <div className="divide-y divide-[#20232C]">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                        <span className="font-mono text-[#D4A853]">{v.youtubeId}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {v.enneatypeNumber === 0 ? 'General' : `Eneatipo 0${v.enneatypeNumber}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            v.visibility === 'pro' ? 'text-[#D4A853]' : 'text-[#84B59F]'
                          }
                        >
                          {v.visibility === 'pro' ? 'Pro' : 'Público'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#F2EFE9]">{v.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleToggleVideoVisibility(v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1C1F27] text-[#D6D2C9] border border-[#2E3240] rounded hover:border-[#D4A853] transition-colors cursor-pointer"
                      >
                        {v.visibility === 'pro' ? (
                          <Lock className="w-3 h-3 text-[#D4A853]" aria-hidden="true" />
                        ) : (
                          <Eye className="w-3 h-3 text-[#84B59F]" aria-hidden="true" />
                        )}
                        <span>Cambiar a {v.visibility === 'pro' ? 'Público' : 'Pro'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteVideo(v.id)}
                        aria-label="Eliminar video"
                        className="p-2 text-[#7D7B74] hover:text-[#C86D5B] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Firebase Storage Guided Audio Manager */}
          <section aria-label="Subida de Meditaciones Guiadas" className="space-y-6 pt-4 border-t border-[#232630]">
            <div className="flex items-center gap-2 border-b border-[#232630] pb-3">
              <Upload className="w-4 h-4 text-[#D4A853]" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                2. Meditaciones Guiadas en Audio (Firebase Storage)
              </h2>
            </div>

            <form
              onSubmit={(e) => void handleUploadAudio(e)}
              className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="audio-title" className="block text-xs font-medium text-[#9E9B93]">
                    Título de la meditación
                  </label>
                  <input
                    id="audio-title"
                    type="text"
                    maxLength={160}
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    placeholder="Ej. Meditación guiada de Serenidad (432 Hz)"
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="audio-duration" className="block text-xs font-medium text-[#9E9B93]">
                    Duración estimada
                  </label>
                  <input
                    id="audio-duration"
                    type="text"
                    maxLength={30}
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    placeholder="12 min"
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="audio-type" className="block text-xs font-medium text-[#9E9B93]">
                    Eneatipo asociado
                  </label>
                  <select
                    id="audio-type"
                    value={audioType}
                    onChange={(e) => setAudioType(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                  >
                    <option value={0}>General · Todos los tipos</option>
                    {ENNEAGRAM_PROFILES.map((p) => (
                      <option key={p.number} value={p.number}>
                        Eneatipo {p.number} · {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="audio-vis" className="block text-xs font-medium text-[#9E9B93]">
                    Visibilidad
                  </label>
                  <select
                    id="audio-vis"
                    value={audioVisibility}
                    onChange={(e) => setAudioVisibility(e.target.value as 'public' | 'pro')}
                    className="w-full px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                  >
                    <option value="public">Público (Gratis)</option>
                    <option value="pro">Exclusivo Pro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="audio-file" className="block text-xs font-medium text-[#9E9B93]">
                    Archivo de audio (.mp3, .wav, .m4a)
                  </label>
                  <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-[#C6C2B9] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#1C1F27] file:text-[#D4A853] hover:file:bg-[#252936] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="audio-desc" className="block text-xs font-medium text-[#9E9B93]">
                  Descripción de la práctica
                </label>
                <textarea
                  id="audio-desc"
                  rows={2}
                  maxLength={600}
                  value={audioDesc}
                  onChange={(e) => setAudioDesc(e.target.value)}
                  placeholder="Guía breve de intención y postura recomendada..."
                  className="w-full p-3 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none resize-none"
                />
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-[#D4A853]">
                    <span>Subiendo a Firebase Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1C1F27] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4A853] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {audioError && <p className="text-xs text-[#C86D5B]">{audioError}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadProgress !== null}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Subir y Publicar Audio</span>
                </button>
              </div>
            </form>

            {audios.length > 0 && (
              <div className="divide-y divide-[#20232C]">
                {audios.map((a) => (
                  <div
                    key={a.id}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                        <span className="font-mono tabular-nums text-[#D4A853]">
                          {a.durationLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {a.enneatypeNumber === 0 ? 'General' : `Eneatipo 0${a.enneatypeNumber}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            a.visibility === 'pro' ? 'text-[#D4A853]' : 'text-[#84B59F]'
                          }
                        >
                          {a.visibility === 'pro' ? 'Pro' : 'Público'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#F2EFE9]">{a.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleToggleAudioVisibility(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1C1F27] text-[#D6D2C9] border border-[#2E3240] rounded hover:border-[#D4A853] transition-colors cursor-pointer"
                      >
                        <span>Cambiar a {a.visibility === 'pro' ? 'Público' : 'Pro'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteAudio(a)}
                        aria-label="Eliminar audio"
                        className="p-2 text-[#7D7B74] hover:text-[#C86D5B] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 3. Freemium Plan Administration */}
          <section aria-label="Control de Membresías" className="space-y-4 pt-4 border-t border-[#232630]">
            <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
              3. Control de Membresías (Free / Pro)
            </h2>
            <form
              onSubmit={(e) => void handleUpdateMemberPlan(e)}
              className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
            >
              <div className="flex-1 space-y-1.5">
                <label htmlFor="member-uid" className="block text-xs font-medium text-[#9E9B93]">
                  UID de usuario (dejar vacío para usar tu propio UID: {user.uid})
                </label>
                <input
                  id="member-uid"
                  type="text"
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  placeholder={user.uid}
                  className="w-full px-3 py-2.5 text-sm font-mono bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="member-plan" className="block text-xs font-medium text-[#9E9B93]">
                  Plan asignado
                </label>
                <select
                  id="member-plan"
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value as MembershipPlan)}
                  className="px-3 py-2.5 text-sm bg-[#0E1015] text-[#F2EFE9] border border-[#2A2E3A] rounded-md focus:border-[#D4A853] focus:outline-none cursor-pointer"
                >
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Aplicar Plan ({userPlan})
              </button>
            </form>
            {planStatusMsg && <p className="text-xs text-[#84B59F]">{planStatusMsg}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
