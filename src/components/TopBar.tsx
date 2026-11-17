import {
  BookOpen,
  Box,
  Compass,
  Headphones,
  Layers,
  LogIn,
  LogOut,
  NotebookPen,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AppViewMode =
  | 'profile'
  | 'diagnostic'
  | 'meditation'
  | 'plan'
  | 'journal'
  | 'levels'
  | 'scene3d'
  | 'admin';

interface TopBarProps {
  viewMode: AppViewMode;
  onChangeView: (mode: AppViewMode) => void;
  activeNumber: number;
  activeName: string;
  onOpenUpgrade: () => void;
}

export function TopBar({
  viewMode,
  onChangeView,
  activeNumber,
  activeName,
  onOpenUpgrade,
}: TopBarProps) {
  const { user, authLoading, isPro, isAdmin, signInWithGoogle, logout } = useAuth();

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Cuenta';

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-[#111318]/[0.95] border-b border-[#242731]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('profile')}
          className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#F2EFE9] hover:text-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Atlas del Eneagrama
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-4 xl:gap-5">
          <button
            type="button"
            onClick={() => onChangeView('profile')}
            title={`Perfil ${activeNumber} · ${activeName}`}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'profile'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Perfil {activeNumber}
          </button>

          <button
            type="button"
            onClick={() => onChangeView('diagnostic')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'diagnostic'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Diagnóstico
          </button>

          <button
            type="button"
            onClick={() => onChangeView('meditation')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'meditation'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Meditación
          </button>

          <button
            type="button"
            onClick={() => onChangeView('plan')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'plan'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Plan IA
          </button>

          <button
            type="button"
            onClick={() => onChangeView('journal')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'journal'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Diario
          </button>

          <button
            type="button"
            onClick={() => onChangeView('levels')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'levels'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            9 Niveles
          </button>

          <button
            type="button"
            onClick={() => onChangeView('scene3d')}
            className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'scene3d'
                ? 'text-[#F2EFE9] border-[#D4A853]'
                : 'text-[#A09D95] border-transparent hover:text-[#F2EFE9] hover:border-[#4B4F5C]'
            }`}
          >
            Escultura 3D
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onChangeView('admin')}
              className={`text-sm font-medium py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'admin'
                  ? 'text-[#D4A853] border-[#D4A853]'
                  : 'text-[#A09D95] border-transparent hover:text-[#D4A853] hover:border-[#4B4F5C]'
              }`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Membership Status Indicator + Auth Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!authLoading && (
            isPro ? (
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#D4A853] bg-[#1A1813] border border-[#3B3424] rounded-md whitespace-nowrap shrink-0">
                Miembro Pro 🌟
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#D4A853] bg-[#181714] border border-[#3A3220] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Actualizar a Pro ⭐
              </button>
            )
          )}

          {authLoading ? (
            <span className="text-xs text-[#8E8B82] whitespace-nowrap">Conectando...</span>
          ) : user ? (
            <button
              type="button"
              onClick={() => void logout()}
              title="Cerrar sesión"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1C1F27] text-[#F2EFE9] border border-[#323644] rounded-md hover:border-[#D4A853] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="max-w-[90px] truncate">{firstName}</span>
              <LogOut className="w-3.5 h-3.5 text-[#D4A853]" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile compact view selector row */}
      <div className="lg:hidden border-t border-[#20232C] px-3 py-2 flex items-center justify-start sm:justify-center gap-4 overflow-x-auto bg-[#111318]">
        <button
          type="button"
          onClick={() => onChangeView('profile')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'profile' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Perfil</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('diagnostic')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'diagnostic' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Diagnóstico</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('meditation')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'meditation' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Meditación</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('plan')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'plan' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Plan IA</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('journal')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'journal' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <NotebookPen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Diario</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('levels')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'levels' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>9 Niveles</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeView('scene3d')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'scene3d' ? 'text-[#D4A853]' : 'text-[#A09D95]'
          }`}
        >
          <Box className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Mapa 3D</span>
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onChangeView('admin')}
            className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'admin' ? 'text-[#D4A853]' : 'text-[#A09D95]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
}
