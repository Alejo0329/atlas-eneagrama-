import {
  ENNEAGRAM_PROFILES,
  HEALTH_BANDS_META,
  HealthBand,
  TRIAD_OVERVIEWS,
} from '../data/enneagramData';
import { CenteredArtwork } from './CenteredArtwork';

interface NineLevelsGuideProps {
  activeNumber: number;
  onSelectProfile: (num: number) => void;
}

export function NineLevelsGuide({ activeNumber, onSelectProfile }: NineLevelsGuideProps) {
  const bands: HealthBand[] = ['healthy', 'average', 'unhealthy'];

  return (
    <main className="relative z-10 min-h-screen pt-28 md:pt-24 pb-28 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto bg-[#15171D]/[0.96] border border-[#262934] rounded-2xl shadow-2xl p-6 sm:p-10 space-y-12">
        {/* Intro Header */}
        <header className="max-w-2xl space-y-3 border-b border-[#232630] pb-8">
          <p className="text-xs font-mono text-[#D4A853] tabular-nums">
            Arquitectura del Sistema · 9 Eneatipos y 9 Niveles
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#F2EFE9]">
            Los 9 Perfiles y Sus Niveles de Desarrollo
          </h1>
          <p className="text-sm sm:text-base text-[#B8B4AC] leading-relaxed">
            El Eneagrama describe nueve estructuras fundamentales de la personalidad organizadas en
            tres centros de inteligencia. A su vez, cada perfil se despliega verticalmente a lo
            largo de nueve niveles de salud psicológica.
          </p>
        </header>

        {/* Visual Gallery of all 9 Profiles with Centered Artwork */}
        <section aria-label="Galería de los 9 Eneatipos" className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
              Galería de los 9 Eneatipos
            </h2>
            <span className="text-xs text-[#9E9B93]">
              Selecciona cualquier perfil para abrir su estudio detallado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENNEAGRAM_PROFILES.map((p) => {
              const isActive = p.number === activeNumber;
              return (
                <button
                  key={p.number}
                  type="button"
                  onClick={() => onSelectProfile(p.number)}
                  className={`group text-left p-5 rounded-xl border transition-colors cursor-pointer flex flex-col ${
                    isActive
                      ? 'bg-[#1B1E28] border-[#D4A853]'
                      : 'bg-[#12141A] border-[#252833] hover:border-[#494E5F]'
                  }`}
                >
                  <CenteredArtwork
                    src={p.image}
                    alt={`Eneatipo ${p.number}: ${p.name}`}
                    caption={p.imageCaption}
                    roman={p.roman}
                    title={p.name}
                    accentHex={p.accentHex}
                    size="thumb"
                  />

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
                      <span className="font-mono tabular-nums text-[#D4A853]">
                        0{p.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{p.triadLabel}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#F2EFE9] group-hover:text-[#D4A853] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#B8B4AC] leading-relaxed line-clamp-2">
                      {p.essence}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Three Centers of Intelligence */}
        <section aria-label="Los Tres Centros de Inteligencia" className="space-y-6 pt-4 border-t border-[#232630]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
            Los Tres Centros de Inteligencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRIAD_OVERVIEWS.map((triad) => (
              <div
                key={triad.key}
                className="p-5 rounded-xl border border-[#252833] bg-[#12141A] space-y-3"
              >
                <div className="text-xs text-[#D4A853] font-mono tabular-nums">
                  Tipos {triad.types.join(' · ')}
                </div>
                <h3 className="font-serif text-xl font-medium text-[#F2EFE9]">{triad.title}</h3>
                <p className="text-xs text-[#9E9B93]">Emoción raíz: {triad.coreEmotion}</p>
                <p className="text-sm text-[#B8B4AC] leading-relaxed">{triad.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The 3 Tiers of the 9 Developmental Levels */}
        <section aria-label="Franjas de los 9 Niveles de Desarrollo" className="space-y-6 pt-4 border-t border-[#232630]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
            Escala Vertical: Los 9 Niveles de Conciencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bands.map((band) => {
              const meta = HEALTH_BANDS_META[band];
              const colorClass =
                band === 'healthy'
                  ? 'text-[#84B59F]'
                  : band === 'average'
                  ? 'text-[#D4A853]'
                  : 'text-[#C86D5B]';
              return (
                <div
                  key={band}
                  className="p-5 rounded-xl border border-[#252833] bg-[#12141A] space-y-2.5"
                >
                  <span className="font-mono text-xs tabular-nums text-[#8E8B82]">
                    {meta.range}
                  </span>
                  <h3 className={`font-serif text-xl font-medium ${colorClass}`}>{meta.label}</h3>
                  <p className="text-sm text-[#B8B4AC] leading-relaxed">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
