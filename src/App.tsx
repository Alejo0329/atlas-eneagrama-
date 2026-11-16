import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionPlanView } from './components/ActionPlanView';
import { ControlDock } from './components/ControlDock';
import { DiagnosticView } from './components/DiagnosticView';
import { EnneagramCanvas } from './components/EnneagramCanvas';
import { MeditationView } from './components/MeditationView';
import { NineLevelsGuide } from './components/NineLevelsGuide';
import { ProfileView } from './components/ProfileView';
import { AppViewMode, TopBar } from './components/TopBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getProfileByNumber } from './data/enneagramData';
import { CameraPreset } from './three/enneagramScene';

function AtlasAppContent() {
  const { user, userProfile } = useAuth();
  const [activeNumber, setActiveNumber] = useState<number>(1);
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<AppViewMode>('profile');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const syncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && userProfile && syncedUidRef.current !== user.uid) {
      syncedUidRef.current = user.uid;
      if (userProfile.detectedType >= 1 && userProfile.detectedType <= 9) {
        setActiveNumber(userProfile.detectedType);
      }
    } else if (!user) {
      syncedUidRef.current = null;
    }
  }, [user, userProfile]);

  const activeProfile = getProfileByNumber(activeNumber);
  const hoveredProfile = hoveredNumber ? getProfileByNumber(hoveredNumber) : null;

  const handleSelectProfile = useCallback((num: number) => {
    setActiveNumber(num);
    if (viewMode === 'levels') {
      setViewMode('profile');
    }
  }, [viewMode]);

  const handleSelectFrom3D = useCallback((num: number) => {
    setActiveNumber(num);
  }, []);

  const handleInspectIn3D = useCallback(() => {
    setViewMode('scene3d');
    setCameraPreset('focus');
  }, []);

  // Keyboard shortcuts: 1-9 jump to profile, ArrowLeft/Right step, H toggles dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key >= '1' && e.key <= '9') {
        setActiveNumber(Number(e.key));
      } else if (e.key === 'ArrowLeft') {
        setActiveNumber((prev) => (prev === 1 ? 9 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveNumber((prev) => (prev === 9 ? 1 : prev + 1));
      } else if (e.key.toLowerCase() === 'h') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#111318] text-[#F2EFE9]">
      {/* Persistent Full-Viewport Three.js 3D Astrolabe */}
      <EnneagramCanvas
        activeNumber={activeNumber}
        cameraPreset={cameraPreset}
        onSelectProfile={handleSelectFrom3D}
        onHoverProfile={setHoveredNumber}
      />

      {/* Clean 3-Zone Top Navigation */}
      <TopBar
        viewMode={viewMode}
        onChangeView={(mode) => {
          setViewMode(mode);
          if (mode !== 'scene3d') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        activeNumber={activeNumber}
        activeName={activeProfile.name}
      />

      {/* Active Content View */}
      {viewMode === 'profile' && (
        <ProfileView
          profile={activeProfile}
          onSelectNumber={handleSelectProfile}
          onInspectIn3D={handleInspectIn3D}
        />
      )}

      {viewMode === 'diagnostic' && (
        <DiagnosticView
          onApplyProfile={(num) => setActiveNumber(num)}
          onGoToProfile={(num) => {
            setActiveNumber(num);
            setViewMode('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onGoToMeditation={(num) => {
            setActiveNumber(num);
            setViewMode('meditation');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onGoToActionPlan={(num) => {
            setActiveNumber(num);
            setViewMode('plan');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {viewMode === 'meditation' && (
        <MeditationView
          activeNumber={activeNumber}
          onSelectNumber={(num) => setActiveNumber(num)}
        />
      )}

      {viewMode === 'plan' && (
        <ActionPlanView
          activeNumber={activeNumber}
          onSelectNumber={(num) => setActiveNumber(num)}
        />
      )}

      {viewMode === 'levels' && (
        <NineLevelsGuide
          activeNumber={activeNumber}
          onSelectProfile={(num) => {
            setActiveNumber(num);
            setViewMode('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Unobtrusive Top-Left Active Caption when inspecting the Pure 3D Scene */}
      {viewMode === 'scene3d' && (
        <div className="fixed top-24 left-4 sm:left-8 z-20 pointer-events-none max-w-xs">
          <div className="pointer-events-auto bg-[#16181F]/[0.94] border border-[#2A2E3A] rounded-xl p-4 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#9E9B93]">
              <span className="font-mono tabular-nums text-[#D4A853]">
                {hoveredProfile
                  ? `Apuntando · 0${hoveredProfile.number}`
                  : `Seleccionado · 0${activeProfile.number}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{(hoveredProfile ?? activeProfile).triadLabel}</span>
            </div>
            <p className="font-serif text-2xl font-medium text-[#F2EFE9]">
              {(hoveredProfile ?? activeProfile).name}
            </p>
            <p className="text-xs text-[#B8B4AC] leading-relaxed">
              Arrastra para orbitar · Haz clic en cualquier columna del círculo para seleccionarla.
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] text-[#9E9B93]">
              <span>
                <span className="text-[#E5B85C] font-medium">Integración:</span>{' '}
                {activeProfile.integration.targetNumber}
              </span>
              <span>
                <span className="text-[#C86D5B] font-medium">Desintegración:</span>{' '}
                {activeProfile.disintegration.targetNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <ControlDock
        activeNumber={activeNumber}
        onSelectNumber={handleSelectProfile}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={(preset) => {
          setCameraPreset(preset);
          if (viewMode !== 'scene3d') {
            setViewMode('scene3d');
          }
        }}
        collapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((prev) => !prev)}
        showCameraControls={viewMode === 'scene3d'}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AtlasAppContent />
    </AuthProvider>
  );
}
