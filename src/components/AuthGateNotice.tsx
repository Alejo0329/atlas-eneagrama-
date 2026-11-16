import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthGateNoticeProps {
  title?: string;
  description: string;
}

export function AuthGateNotice({
  title = 'Guarda tu progreso en tu cuenta personal',
  description,
}: AuthGateNoticeProps) {
  const { signInWithGoogle, authError } = useAuth();

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#343025] bg-[#171613] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="font-serif text-lg font-medium text-[#F2EFE9]">{title}</p>
        <p className="text-xs sm:text-sm text-[#B8B4AC] leading-relaxed">{description}</p>
        {authError && (
          <p className="text-xs text-[#C86D5B] pt-1">{authError}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Iniciar sesión con Google</span>
      </button>
    </div>
  );
}
