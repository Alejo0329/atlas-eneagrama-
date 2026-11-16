import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Compass } from 'lucide-react';
import { ENNEAGRAM_PROFILES } from '../data/enneagramData';
import { CameraPreset } from '../three/enneagramScene';

interface ControlDockProps {
  activeNumber: number;
  onSelectNumber: (num: number) => void;
  cameraPreset: CameraPreset;
  onChangeCameraPreset: (preset: CameraPreset) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  showCameraControls: boolean;
}

export function ControlDock({
  activeNumber,
  onSelectNumber,
  cameraPreset,
  onChangeCameraPreset,
  collapsed,
  onToggleCollapse,
  showCameraControls,
}: ControlDockProps) {
  const handlePrev = () => {
    onSelectNumber(activeNumber === 1 ? 9 : activeNumber - 1);
  };

  const handleNext = () => {
    onSelectNumber(activeNumber === 9 ? 1 : activeNumber + 1);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[min(900px,95vw)] pointer-events-none"
      role="region"
      aria-label="Navegador rápido del Eneagrama"
    >
      {/* Collapse / Expand toggle tab */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-[#B8B4AC] bg-[#16181F] border border-b-0 border-[#2B2F3B] rounded-t-md hover:text-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mostrar Navegador (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ocultar (H)</span>
          </>
        )}
      </button>

      {/* Main horizontal dock surface (solid rgba, zero backdrop-filter over WebGL) */}
      <div
        className={`pointer-events-auto w-full bg-[#16181F]/[0.96] border border-[#2B2F3B] rounded-xl shadow-2xl transition-transform duration-200 ease-out ${
          collapsed ? 'translate-y-[140%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="px-3 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-center gap-3">
          {/* Prev / 1-9 Selector / Next */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Perfil anterior"
              className="w-9 h-9 flex items-center justify-center rounded-md text-[#B8B4AC] hover:text-[#F2EFE9] hover:bg-[#222530] transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1" role="tablist" aria-label="Seleccionar eneatipo">
              {ENNEAGRAM_PROFILES.map((p) => {
                const isActive = p.number === activeNumber;
                return (
                  <button
                    key={p.number}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    title={`Eneatipo ${p.number}: ${p.name}`}
                    onClick={() => onSelectNumber(p.number)}
                    className={`w-8 h-9 sm:w-9 sm:h-9 flex items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#D4A853] text-[#111318] font-semibold'
                        : 'text-[#C6C2B9] hover:bg-[#222530] hover:text-[#F2EFE9]'
                    }`}
                  >
                    {p.number}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente perfil"
              className="w-9 h-9 flex items-center justify-center rounded-md text-[#B8B4AC] hover:text-[#F2EFE9] hover:bg-[#222530] transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Camera preset selector (shown cleanly when viewing 3D scene) */}
          {showCameraControls && (
            <>
              <div className="hidden sm:block w-px h-6 bg-[#2A2E3A]" aria-hidden="true" />
              <div className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#8E8B82] mr-1 hidden sm:block" aria-hidden="true" />
                {(
                  [
                    { id: 'overview', label: 'General' },
                    { id: 'focus', label: 'Enfoque' },
                    { id: 'zenith', label: 'Cenital' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeCameraPreset(preset.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cameraPreset === preset.id
                        ? 'bg-[#252936] text-[#F2EFE9] border border-[#3B4052]'
                        : 'text-[#9E9B93] hover:text-[#F2EFE9] hover:bg-[#1E212B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
