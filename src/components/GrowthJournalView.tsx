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
  Calendar,
  Check,
  Edit3,
  Lock,
  NotebookPen,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ENNEAGRAM_PROFILES, getProfileByNumber } from '../data/enneagramData';
import { OperationType, db, handleFirestoreError } from '../firebase';
import { AuthGateNotice } from './AuthGateNotice';

type JournalStateTag = 'ego' | 'observacion' | 'esencia';

interface JournalEntryRecord {
  id: string;
  enneatypeNumber: number;
  entryDate: string;
  stateTag: JournalStateTag;
  note: string;
}

interface GrowthJournalViewProps {
  activeNumber: number;
  onSelectNumber: (num: number) => void;
}

const STATE_TAG_META: Record<
  JournalStateTag,
  { label: string; hint: string; accentClass: string }
> = {
  ego: {
    label: 'Patrón del Ego',
    hint: 'Reacción automática, defensa o hábito observado',
    accentClass: 'text-[#C86D5B] border-[#C86D5B]/40 bg-[#C86D5B]/10',
  },
  observacion: {
    label: 'Autoobservación',
    hint: 'Pausa consciente sin juicio en medio del día',
    accentClass: 'text-[#E5B85C] border-[#D4A853]/40 bg-[#D4A853]/10',
  },
  esencia: {
    label: 'Momento de Esencia',
    hint: 'Presencia, virtud encarnada o paso de integración',
    accentClass: 'text-[#84B59F] border-[#84B59F]/40 bg-[#84B59F]/10',
  },
};

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatReadableDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function GrowthJournalView({
  activeNumber,
  onSelectNumber,
}: GrowthJournalViewProps) {
  const { user } = useAuth();
  const profile = getProfileByNumber(activeNumber);

  const [entryDate, setEntryDate] = useState<string>(getTodayIsoDate);
  const [stateTag, setStateTag] = useState<JournalStateTag>('observacion');
  const [noteText, setNoteText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [entries, setEntries] = useState<JournalEntryRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'active'>('all');
  const [stateFilter, setStateFilter] = useState<'all' | JournalStateTag>('all');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string>('');
  const [editDate, setEditDate] = useState<string>(getTodayIsoDate);
  const [editStateTag, setEditStateTag] = useState<JournalStateTag>('observacion');
  const [editType, setEditType] = useState<number>(activeNumber);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Private real-time Firestore subscription scoped strictly to authenticated user
  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const colPath = `users/${user.uid}/journalEntries`;
    const q = query(
      collection(db, 'users', user.uid, 'journalEntries'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list: JournalEntryRecord[] = snap.docs.map((d) => {
          const data = d.data();
          const rawTag = data.stateTag;
          const safeTag: JournalStateTag =
            rawTag === 'ego' || rawTag === 'esencia' || rawTag === 'observacion'
              ? rawTag
              : 'observacion';
          return {
            id: d.id,
            enneatypeNumber: Number(data.enneatypeNumber ?? 1),
            entryDate: String(data.entryDate ?? getTodayIsoDate()),
            stateTag: safeTag,
            note: String(data.note ?? ''),
          };
        });
        setEntries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colPath);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSaveFeedback(null);

    const cleanNote = noteText.trim().slice(0, 1200);
    if (cleanNote.length < 3) {
      setFormError('Escribe al menos 3 caracteres para registrar tu reflexión.');
      return;
    }

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(entryDate) ? entryDate : getTodayIsoDate();
    const safeType = Math.min(9, Math.max(1, Math.round(profile.number)));

    setSaving(true);
    const colPath = `users/${user.uid}/journalEntries`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'journalEntries'), {
        uid: user.uid,
        enneatypeNumber: safeType,
        entryDate: validDate,
        stateTag,
        note: cleanNote,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNoteText('');
      setSaveFeedback('Reflexión guardada de forma privada.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: JournalEntryRecord) => {
    setEditingId(item.id);
    setEditNote(item.note);
    setEditDate(item.entryDate);
    setEditStateTag(item.stateTag);
    setEditType(item.enneatypeNumber);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNote('');
  };

  const handleSaveEdit = async (entryId: string) => {
    if (!user) return;
    const cleanNote = editNote.trim().slice(0, 1200);
    if (cleanNote.length < 3) return;

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(editDate) ? editDate : getTodayIsoDate();
    const safeType = Math.min(9, Math.max(1, Math.round(editType)));
    const docPath = `users/${user.uid}/journalEntries/${entryId}`;

    setUpdatingId(entryId);
    try {
      await updateDoc(doc(db, 'users', user.uid, 'journalEntries', entryId), {
        enneatypeNumber: safeType,
        entryDate: validDate,
        stateTag: editStateTag,
        note: cleanNote,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/journalEntries/${entryId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId));
      if (editingId === entryId) {
        setEditingId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        if (typeFilter === 'active' && entry.enneatypeNumber !== profile.number) {
          return false;
        }
        if (stateFilter !== 'all' && entry.stateTag !== stateFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }, [entries, typeFilter, stateFilter, profile.number]);

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
              <span className="inline-flex items-center gap-1.5 font-mono text-[#D4A853]">
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span>Bitácora Privada</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Eneatipo 0{profile.number} ({profile.name})</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
              Diario de Crecimiento
            </h1>
            <p className="text-sm sm:text-base text-[#B8B4AC] max-w-2xl leading-relaxed">
              Registra reflexiones breves del día asociadas a tu Eneatipo. Todas las notas se
              almacenan de manera privada en tu cuenta.
            </p>
          </div>

          <div className="shrink-0">
            <label htmlFor="journal-type-select" className="sr-only">
              Eneatipo asociado a la nota
            </label>
            <select
              id="journal-type-select"
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

        <div className="px-6 sm:px-10 py-8 space-y-8">
          {!user && (
            <AuthGateNotice
              title="Tu Diario de Crecimiento es privado"
              description="Inicia sesión con Google para escribir y consultar tus reflexiones diarias asociadas a cada Eneatipo de forma privada en la nube."
            />
          )}

          {/* Contextual Reflection Prompt for Active Enneatype */}
          <section
            aria-label="Guía breve de autoobservación"
            className="p-5 rounded-xl border border-[#282B36] bg-[#12141A] space-y-2"
          >
            <p className="font-mono text-xs text-[#D4A853]">
              Guía de hoy · Eneatipo 0{profile.number} ({profile.virtue})
            </p>
            <p className="text-sm text-[#D6D2C9] leading-relaxed">
              ¿En qué momento de hoy notaste la inercia de tu pasión ({profile.passion.toLowerCase()})
              y cómo puedes abrir espacio hacia tu flecha de integración (Eneatipo{' '}
              {profile.integration.targetNumber} · {profile.integration.targetName})?
            </p>
          </section>

          {/* Daily Reflection Composer */}
          <form
            onSubmit={(e) => void handleSaveEntry(e)}
            className="p-6 rounded-xl border border-[#282B36] bg-[#12141A] space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <NotebookPen className="w-4 h-4 text-[#D4A853]" aria-hidden="true" />
                <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                  Nueva reflexión diaria
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#9E9B93]" aria-hidden="true" />
                <label htmlFor="journal-entry-date" className="sr-only">
                  Fecha de la reflexión
                </label>
                <input
                  id="journal-entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono bg-[#0E1015] text-[#F2EFE9] border border-[#2D3140] rounded-md focus:border-[#D4A853] focus:outline-none"
                />
              </div>
            </div>

            {/* State of Presence Selector */}
            <div className="space-y-2">
              <span className="block text-xs text-[#9E9B93]">
                Momento observado
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['ego', 'observacion', 'esencia'] as const).map((tag) => {
                  const meta = STATE_TAG_META[tag];
                  const active = stateTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setStateTag(tag)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1D202A] border-[#D4A853]'
                          : 'bg-[#0E1015] border-[#252833] hover:border-[#414656]'
                      }`}
                    >
                      <span
                        className={`block text-xs font-medium ${
                          active ? 'text-[#D4A853]' : 'text-[#E9E5DC]'
                        }`}
                      >
                        {meta.label}
                      </span>
                      <span className="block text-[11px] text-[#8E8B82] mt-0.5 leading-snug">
                        {meta.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="journal-note-input" className="sr-only">
                Nota diaria de reflexión
              </label>
              <textarea
                id="journal-note-input"
                rows={4}
                maxLength={1200}
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  setSaveFeedback(null);
                  setFormError(null);
                }}
                disabled={!user}
                placeholder={
                  user
                    ? `Escribe una observación breve del día para el Eneatipo ${profile.number} (${profile.name})...`
                    : 'Inicia sesión con Google para registrar notas privadas...'
                }
                className="w-full p-4 rounded-lg bg-[#0E1015] border border-[#2A2E3A] text-sm text-[#F2EFE9] leading-relaxed focus:border-[#D4A853] focus:outline-none resize-none disabled:opacity-50"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] tabular-nums text-[#7D7B74]">
                  {noteText.length} / 1200 caracteres · Privado para tu cuenta
                </span>

                <div className="flex items-center gap-3">
                  {saveFeedback && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#84B59F]">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{saveFeedback}</span>
                    </span>
                  )}

                  {formError && (
                    <span className="text-xs text-[#C86D5B]">{formError}</span>
                  )}

                  <button
                    type="submit"
                    disabled={!user || saving || noteText.trim().length < 3}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{saving ? 'Guardando...' : 'Guardar reflexión'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Private Entries List */}
          {user && (
            <section aria-label="Entradas del Diario de Crecimiento" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#232630]">
                <div className="space-y-0.5">
                  <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                    Mis Reflexiones ({filteredEntries.length})
                  </h2>
                  <p className="text-xs text-[#8E8B82]">
                    Solo visibles cuando inicias sesión con tu cuenta.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Enneatype Scope Filter */}
                  <div className="inline-flex items-center gap-1 p-1 bg-[#101217] border border-[#242731] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTypeFilter('all')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        typeFilter === 'all'
                          ? 'bg-[#222631] text-[#F2EFE9]'
                          : 'text-[#9E9B93] hover:text-[#F2EFE9]'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeFilter('active')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        typeFilter === 'active'
                          ? 'bg-[#222631] text-[#F2EFE9]'
                          : 'text-[#9E9B93] hover:text-[#F2EFE9]'
                      }`}
                    >
                      Tipo {profile.number}
                    </button>
                  </div>

                  {/* State Tag Filter */}
                  <select
                    aria-label="Filtrar por momento observado"
                    value={stateFilter}
                    onChange={(e) =>
                      setStateFilter(e.target.value as 'all' | JournalStateTag)
                    }
                    className="px-2.5 py-1.5 text-xs bg-[#101217] text-[#D6D2C9] border border-[#242731] rounded-lg focus:border-[#D4A853] focus:outline-none cursor-pointer"
                  >
                    <option value="all">Cualquier estado</option>
                    <option value="ego">Patrón del Ego</option>
                    <option value="observacion">Autoobservación</option>
                    <option value="esencia">Momento de Esencia</option>
                  </select>
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="p-8 rounded-xl border border-[#252833] bg-[#12141A] text-center space-y-2">
                  <NotebookPen className="w-6 h-6 text-[#7D7B74] mx-auto" aria-hidden="true" />
                  <p className="font-serif text-xl text-[#F2EFE9]">
                    Aún no hay reflexiones en esta vista
                  </p>
                  <p className="text-xs sm:text-sm text-[#9E9B93] max-w-md mx-auto">
                    Escribe tu primera observación diaria arriba para comenzar a trazar tu evolución
                    por Eneatipo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEntries.map((item) => {
                    const entryProfile = getProfileByNumber(item.enneatypeNumber);
                    const tagMeta = STATE_TAG_META[item.stateTag];
                    const isEditing = editingId === item.id;

                    return (
                      <article
                        key={item.id}
                        className="p-5 rounded-xl border border-[#252833] bg-[#12141A] space-y-3"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="px-2.5 py-1.5 text-xs font-mono bg-[#0E1015] text-[#F2EFE9] border border-[#2D3140] rounded-md"
                              />
                              <select
                                value={editType}
                                onChange={(e) => setEditType(Number(e.target.value))}
                                className="px-2.5 py-1.5 text-xs bg-[#0E1015] text-[#F2EFE9] border border-[#2D3140] rounded-md"
                              >
                                {ENNEAGRAM_PROFILES.map((p) => (
                                  <option key={p.number} value={p.number}>
                                    Eneatipo {p.number} · {p.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editStateTag}
                                onChange={(e) =>
                                  setEditStateTag(e.target.value as JournalStateTag)
                                }
                                className="px-2.5 py-1.5 text-xs bg-[#0E1015] text-[#F2EFE9] border border-[#2D3140] rounded-md"
                              >
                                <option value="ego">Patrón del Ego</option>
                                <option value="observacion">Autoobservación</option>
                                <option value="esencia">Momento de Esencia</option>
                              </select>
                            </div>

                            <textarea
                              rows={3}
                              maxLength={1200}
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full p-3 rounded-lg bg-[#0E1015] border border-[#2D3140] text-sm text-[#F2EFE9] leading-relaxed focus:border-[#D4A853] focus:outline-none resize-none"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#9E9B93] border border-[#2D3140] rounded-md hover:text-[#F2EFE9] cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Cancelar</span>
                              </button>
                              <button
                                type="button"
                                disabled={
                                  updatingId === item.id || editNote.trim().length < 3
                                }
                                onClick={() => void handleSaveEdit(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] disabled:opacity-40 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>
                                  {updatingId === item.id ? 'Guardando...' : 'Guardar cambios'}
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono tabular-nums text-[#D4A853]">
                                  {formatReadableDate(item.entryDate)}
                                </span>
                                <span className="text-[#4B4F5C]" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-[#D6D2C9] font-medium">
                                  Eneatipo 0{entryProfile.number} · {entryProfile.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[11px] font-medium rounded border ${tagMeta.accentClass}`}
                                >
                                  {tagMeta.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startEditing(item)}
                                  aria-label="Editar reflexión"
                                  className="p-1.5 text-[#7D7B74] hover:text-[#D4A853] transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteEntry(item.id)}
                                  aria-label="Eliminar reflexión"
                                  className="p-1.5 text-[#7D7B74] hover:text-[#C86D5B] transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-[#E9E5DC] leading-relaxed whitespace-pre-line">
                              {item.note}
                            </p>
                          </>
                        )}
                      </article>
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
