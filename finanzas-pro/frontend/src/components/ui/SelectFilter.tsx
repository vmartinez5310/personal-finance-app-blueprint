interface Option { value: string; label: string }
interface Props { value: string; onChange: (v: string) => void; options: Option[] }

export default function SelectFilter({ value, onChange, options }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs border-0 outline-none"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
