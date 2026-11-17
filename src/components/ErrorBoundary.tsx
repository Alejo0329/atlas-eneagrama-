import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Se produjo un error inesperado al cargar la vista.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111318] text-[#F2EFE9] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#15171D] border border-[#2B2F3B] rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <p className="font-mono text-xs text-[#D4A853]">Recuperación de sesión</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2EFE9]">
              No se pudo mostrar esta vista
            </h1>
            <p className="text-sm text-[#B8B4AC] leading-relaxed">
              Ocurrió un inconveniente al inicializar un componente de la página. Puedes recargar
              para restaurar el Atlas del Eneagrama.
            </p>
            {this.state.errorMessage && (
              <p className="text-xs font-mono text-[#9E9B93] bg-[#0E1015] border border-[#252833] rounded-lg p-3 break-words">
                {this.state.errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-medium bg-[#D4A853] text-[#111318] rounded-md hover:bg-[#E0B96A] transition-colors cursor-pointer"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
