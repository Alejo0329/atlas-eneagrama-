import { ArrowUpRight, Check, LogIn, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  contextTitle?: string;
}

export function UpgradeModal({
  open,
  onClose,
  contextTitle = 'Desbloquea la Experiencia Pro del Atlas',
}: UpgradeModalProps) {
  const { user, signInWithGoogle } = useAuth();
  const stripePaymentLink = (import.meta.env.VITE_STRIPE_PAYMENT_LINK || '').trim();

  if (!open) return null;

  const checkoutUrl =
    stripePaymentLink && user?.email
      ? `${stripePaymentLink}${stripePaymentLink.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(user.email)}`
      : stripePaymentLink;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#15171D] border border-[#2D313E] shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-5 border-b border-[#232630] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4A853]">
              <Star className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Membresía Pro · Atlas del Eneagrama</span>
            </div>
            <h2
              id="upgrade-modal-title"
              className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]"
            >
              {contextTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-[#9E9B93] hover:text-[#F2EFE9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <p className="text-sm text-[#B8B4AC] leading-relaxed">
            Tu cuenta actual tiene acceso gratuito al Mapa 3D, los 9 arquetipos, el Test de
            Diagnóstico y la videoteca pública. Actualiza a Pro para desbloquear todas las
            herramientas de transformación profunda:
          </p>

          <ul className="space-y-3 text-sm text-[#E9E5DC]">
            <li className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#84B59F] mt-0.5 shrink-0" aria-hidden="true" />
              <span>Generación ilimitada del Plan de Acción Semanal de 7 días con IA.</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#84B59F] mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Reproductor completo de afirmaciones programadas con frecuencias de 432 Hz, 528 Hz
                y bitácora de esencia.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#84B59F] mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Acceso completo a los videos de estudio y meditaciones guiadas en audio exclusivas
                para miembros Pro.
              </span>
            </li>
          </ul>

          {!user ? (
            <div className="pt-2 space-y-3">
              <p className="text-xs text-[#9E9B93]">
                Primero inicia sesión con tu cuenta de Google para vincular tu membresía.
              </p>
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Iniciar sesión con Google</span>
              </button>
            </div>
          ) : checkoutUrl ? (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-[#B8B4AC] bg-[#1C1F27] border border-[#2C303D] rounded-md hover:text-[#F2EFE9] transition-colors cursor-pointer"
              >
                Seguir en plan gratuito
              </button>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors whitespace-nowrap"
              >
                <span>Actualizar a Pro con Stripe</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[#343025] bg-[#171613] space-y-2">
              <p className="text-xs text-[#D4A853] font-medium">
                Pasarela Stripe pendiente de enlace
              </p>
              <p className="text-xs text-[#B8B4AC] leading-relaxed">
                Configura la variable de entorno <code className="font-mono">VITE_STRIPE_PAYMENT_LINK</code>{' '}
                con tu Payment Link de Stripe para habilitar el pago directo desde este modal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
