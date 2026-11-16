import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, TrendingDown, TrendingUp } from 'lucide-react';
import {
  EnneagramProfile,
  HEALTH_BANDS_META,
  HealthBand,
} from '../data/enneagramData';
import { CenteredArtwork } from './CenteredArtwork';

interface ProfileViewProps {
  profile: EnneagramProfile;
  onSelectNumber: (num: number) => void;
  onInspectIn3D: () => void;
}

type ProfileTab = 'overview' | 'levels';

export function ProfileView({ profile, onSelectNumber, onInspectIn3D }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const prevNumber = profile.number === 1 ? 9 : profile.number - 1;
  const nextNumber = profile.number === 9 ? 1 : profile.number + 1;

  const activeLevelObj =
    profile.levels.find((l) => l.level === selectedLevel) ?? profile.levels[0];

  const bandOrder: HealthBand[] = ['healthy', 'average', 'unhealthy'];

  const bandAccentClass = (band: HealthBand) => {
    if (band === 'healthy') return 'text-[#84B59F]';
    if (band === 'average') return 'text-[#D4A853]';
    return 'text-[#C86D5B]';
  };

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <article className="max-w-4xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Profile Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#232630] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            {/* Unboxed Metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E9B93]">
              <span className="font-mono tabular-nums text-[#D4A853]">
                Eneatipo 0{profile.number} ({profile.roman})
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.triadLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Virtud: {profile.virtue}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
              {profile.name}
            </h1>
            <p className="text-sm sm:text-base text-[#B8B4AC]">{profile.archetype}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectNumber(prevNumber)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#D6D2C9] bg-[#1C1F28] border border-[#2C303D] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="tabular-nums">Perfil {prevNumber}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectNumber(nextNumber)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#D6D2C9] bg-[#1C1F28] border border-[#2C303D] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="tabular-nums">Perfil {nextNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Centered Focal Artwork Section */}
        <section className="px-6 sm:px-10 py-8 sm:py-10 border-b border-[#232630] bg-[#12141A]">
          <CenteredArtwork
            src={profile.image}
            alt={`Representación escultórica del Eneatipo ${profile.number}: ${profile.name}`}
            caption={profile.imageCaption}
            roman={profile.roman}
            title={profile.name}
            accentHex={profile.accentHex}
            size="hero"
          />

          <p className="mt-6 max-w-2xl mx-auto text-center font-serif italic text-lg sm:text-xl text-[#E8E3D9] leading-relaxed">
            «{profile.essence}»
          </p>
        </section>

        {/* Segmented Tab Switcher */}
        <div className="px-6 sm:px-10 pt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#232630] pb-4">
          <div className="inline-flex items-center gap-1 p-1 bg-[#101217] border border-[#242731] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#222631] text-[#F2EFE9]'
                  : 'text-[#9E9B93] hover:text-[#F2EFE9]'
              }`}
            >
              Descripción y Dinámica
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('levels')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'levels'
                  ? 'bg-[#222631] text-[#F2EFE9]'
                  : 'text-[#9E9B93] hover:text-[#F2EFE9]'
              }`}
            >
              Los 9 Niveles de Desarrollo
            </button>
          </div>

          <button
            type="button"
            onClick={onInspectIn3D}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#E5BC6E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enfocar en escultura 3D</span>
          </button>
        </div>

        {/* Tab Panel Content */}
        {activeTab === 'overview' ? (
          <div className="px-6 sm:px-10 py-8 space-y-10">
            {/* Key Psychological Coordinates (2x2 clean hairline grid, zero nested card clutter) */}
            <section aria-label="Coordenadas psicológicas fundamentales">
              <h2 className="font-serif text-2xl font-medium text-[#F2EFE9] mb-5">
                Estructura Motivacional
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[#252833]">
                <div className="p-5 border-r border-b border-[#252833]">
                  <dt className="text-xs font-medium text-[#9E9B93] mb-1.5">Miedo Básico</dt>
                  <dd className="text-sm text-[#E9E5DC] leading-relaxed">{profile.coreFear}</dd>
                </div>
                <div className="p-5 border-r border-b border-[#252833]">
                  <dt className="text-xs font-medium text-[#9E9B93] mb-1.5">Deseo Básico</dt>
                  <dd className="text-sm text-[#E9E5DC] leading-relaxed">{profile.coreDesire}</dd>
                </div>
                <div className="p-5 border-r border-b border-[#252833]">
                  <dt className="text-xs font-medium text-[#9E9B93] mb-1.5">
                    Pasión del Ego vs. Virtud
                  </dt>
                  <dd className="text-sm text-[#E9E5DC] leading-relaxed">
                    <span>{profile.passion}</span>
                    <span className="mx-2 text-[#696760]" aria-hidden="true">
                      /
                    </span>
                    <span className="text-[#D4A853] font-medium">{profile.virtue}</span>
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[#252833]">
                  <dt className="text-xs font-medium text-[#9E9B93] mb-1.5">Motivación Clave</dt>
                  <dd className="text-sm text-[#E9E5DC] leading-relaxed">
                    {profile.keyMotivation}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Editorial Long-Form Prose */}
            <section aria-label="Análisis del perfil" className="max-w-prose space-y-4">
              <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                Retrato Psicológico
              </h2>
              {profile.overview.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-[15px] sm:text-base text-[#D3CFC6] leading-[1.78] ${
                    index === 0
                      ? 'first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-[#D4A853] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none'
                      : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </section>

            {/* Wings & Integration/Disintegration Arrows */}
            <section aria-label="Alas y líneas de movimiento" className="pt-4 border-t border-[#232630] space-y-6">
              <h2 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                Alas y Líneas de Movimiento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.wings.map((wing) => (
                  <button
                    key={wing.code}
                    type="button"
                    onClick={() => onSelectNumber(wing.targetNumber)}
                    className="text-left p-5 rounded-xl border border-[#282B36] bg-[#12141A] hover:border-[#D4A853] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-[#F2EFE9] group-hover:text-[#D4A853] transition-colors">
                        {wing.title}
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-[#7D7B74] group-hover:text-[#D4A853] shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm text-[#A8A49C] leading-relaxed">{wing.description}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => onSelectNumber(profile.integration.targetNumber)}
                  className="text-left p-5 rounded-xl border border-[#282B36] bg-[#12141A] hover:border-[#84B59F] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#84B59F]">
                      <TrendingUp className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Integración hacia el {profile.integration.targetNumber} ·{' '}
                        {profile.integration.targetName}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="w-4 h-4 text-[#7D7B74] group-hover:text-[#84B59F] shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-[#A8A49C] leading-relaxed">
                    {profile.integration.description}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectNumber(profile.disintegration.targetNumber)}
                  className="text-left p-5 rounded-xl border border-[#282B36] bg-[#12141A] hover:border-[#C86D5B] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C86D5B]">
                      <TrendingDown className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Desintegración hacia el {profile.disintegration.targetNumber} ·{' '}
                        {profile.disintegration.targetName}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="w-4 h-4 text-[#7D7B74] group-hover:text-[#C86D5B] shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-[#A8A49C] leading-relaxed">
                    {profile.disintegration.description}
                  </p>
                </button>
              </div>
            </section>
          </div>
        ) : (
          /* 9 Levels of Development Interactive View for this Profile */
          <div className="px-6 sm:px-10 py-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
                Los 9 Niveles de Desarrollo del Eneatipo {profile.number}
              </h2>
              <p className="text-sm text-[#A8A49C] leading-relaxed">
                Cada perfil psicológico evoluciona a lo largo de un espectro continuo de nueve
                niveles de conciencia: desde la libertad plena del Nivel 1 hasta la fijación
                defensiva del Nivel 9.
              </p>
            </div>

            {/* Interactive 1-9 Level Stepper Strip */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2" role="tablist" aria-label="Niveles del 1 al 9">
                {profile.levels.map((lvl) => {
                  const isSelected = lvl.level === selectedLevel;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedLevel(lvl.level)}
                      className={`py-2.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4A853] text-[#111318] border-[#D4A853] font-semibold'
                          : 'bg-[#12141A] text-[#C6C2B9] border-[#282B36] hover:border-[#4D5263]'
                      }`}
                    >
                      <span className="block font-mono text-xs tabular-nums">
                        N{lvl.level}
                      </span>
                      <span className="block text-[10px] opacity-80 mt-0.5 truncate">
                        {lvl.band === 'healthy'
                          ? 'Sano'
                          : lvl.band === 'average'
                          ? 'Medio'
                          : 'Insano'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Level Spotlight Box */}
              <div className="p-6 rounded-xl border border-[#2D313E] bg-[#12141A] space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono tabular-nums text-[#D4A853]">
                    Nivel 0{activeLevelObj.level}
                  </span>
                  <span aria-hidden="true" className="text-[#696760]">
                    ·
                  </span>
                  <span className={`font-medium ${bandAccentClass(activeLevelObj.band)}`}>
                    {HEALTH_BANDS_META[activeLevelObj.band].label}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#F2EFE9]">
                  {activeLevelObj.title}
                </h3>
                <p className="text-sm sm:text-base text-[#D3CFC6] leading-relaxed max-w-prose">
                  {activeLevelObj.summary}
                </p>
              </div>
            </div>

            {/* Complete 9-Level Catalogue grouped by Health Band */}
            <div className="space-y-8 pt-2">
              {bandOrder.map((band) => {
                const bandMeta = HEALTH_BANDS_META[band];
                const items = profile.levels.filter((l) => l.band === band);
                return (
                  <section key={band} className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#232630] pb-2">
                      <h3 className={`font-serif text-xl font-medium ${bandAccentClass(band)}`}>
                        {bandMeta.label}
                      </h3>
                      <span className="font-mono text-xs tabular-nums text-[#8E8B82]">
                        {bandMeta.range}
                      </span>
                    </div>

                    <div className="divide-y divide-[#20232C]">
                      {items.map((item) => {
                        const isSelected = item.level === selectedLevel;
                        return (
                          <button
                            key={item.level}
                            type="button"
                            onClick={() => setSelectedLevel(item.level)}
                            className={`w-full text-left py-4 px-3 -mx-3 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5 cursor-pointer ${
                              isSelected ? 'bg-[#1B1E27]' : 'hover:bg-[#171921]'
                            }`}
                          >
                            <span className="font-mono text-xs tabular-nums text-[#D4A853] shrink-0 w-16">
                              Nivel 0{item.level}
                            </span>
                            <div className="space-y-1">
                              <span className="block text-sm font-medium text-[#F2EFE9]">
                                {item.title}
                              </span>
                              <span className="block text-sm text-[#A8A49C] leading-relaxed">
                                {item.summary}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
