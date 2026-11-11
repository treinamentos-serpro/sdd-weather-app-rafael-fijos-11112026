interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/75"
      role="status"
    >
      {message}
    </div>
  );
}
