import { useEffect, useRef, useState } from 'react';
import { CameraPreset, EnneagramSceneController } from '../three/enneagramScene';

interface EnneagramCanvasProps {
  activeNumber: number;
  cameraPreset: CameraPreset;
  onSelectProfile: (num: number) => void;
  onHoverProfile?: (num: number | null) => void;
}

export function EnneagramCanvas({
  activeNumber,
  cameraPreset,
  onSelectProfile,
  onHoverProfile,
}: EnneagramCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<EnneagramSceneController | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const onSelectRef = useRef(onSelectProfile);
  onSelectRef.current = onSelectProfile;

  const onHoverRef = useRef(onHoverProfile);
  onHoverRef.current = onHoverProfile;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const controller = new EnneagramSceneController({
        container,
        initialNumber: activeNumber,
        onSelectProfile: (num) => onSelectRef.current(num),
        onHoverProfile: (num) => onHoverRef.current?.(num),
        onContextIssue: (lost) => setContextLost(lost),
      });
      controllerRef.current = controller;

      return () => {
        controller.dispose();
        controllerRef.current = null;
      };
    } catch {
      setContextLost(true);
      return undefined;
    }
    // Initialize WebGL scene once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    controllerRef.current?.setActiveProfile(activeNumber);
  }, [activeNumber]);

  useEffect(() => {
    controllerRef.current?.setCameraPreset(cameraPreset);
  }, [cameraPreset]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#111318]">
      <div
        ref={mountRef}
        className="w-full h-full"
        aria-label="Escultura interactiva en 3D del Eneagrama"
      />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111318] text-center p-8">
          <div className="max-w-md space-y-2 border border-[#2A2D36] bg-[#16181F] p-6 rounded-xl">
            <p className="font-serif text-xl text-[#F2EFE9]">Contexto gráfico en pausa</p>
            <p className="text-sm text-[#9E9B93]">
              El navegador suspendió temporalmente la vista WebGL. Puedes seguir explorando los 9 perfiles desde los controles inferiores.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
