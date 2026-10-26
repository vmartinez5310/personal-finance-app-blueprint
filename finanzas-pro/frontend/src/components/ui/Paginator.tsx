interface Props {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}

export default function Paginator({ page, total, pageSize, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-2 py-1 rounded disabled:opacity-30">←</button>
      <span className="text-zinc-500">{page} / {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="px-2 py-1 rounded disabled:opacity-30">→</button>
    </div>
  );
}
