interface Props {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}

export default function KpiCard({ label, value, color = 'text-zinc-100', sub }: Props) {
  return (
    <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-[10px] text-zinc-500">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-zinc-600">{sub}</div>}
    </div>
  );
}
