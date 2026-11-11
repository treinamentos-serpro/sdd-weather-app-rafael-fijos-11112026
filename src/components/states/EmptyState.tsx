interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'Nenhum resultado encontrado.' }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/75">
      {message}
    </div>
  );
}
