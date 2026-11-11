import { RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-rose-300/20 bg-rose-300/5 px-4 py-6 text-center"
      role="alert"
    >
      <p className="text-sm text-rose-200">{message}</p>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onRetry}
        type="button"
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        Tentar novamente
      </button>
    </div>
  );
}
