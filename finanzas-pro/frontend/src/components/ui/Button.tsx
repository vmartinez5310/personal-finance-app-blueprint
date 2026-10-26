interface Props {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'ghost' | 'primary';
}

export default function Button({ onClick, children, variant = 'ghost' }: Props) {
  const base = 'px-3 py-1.5 rounded-lg text-sm';
  const styles = variant === 'primary'
    ? 'bg-blue-600 text-white'
    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300';
  return <button onClick={onClick} className={`${base} ${styles}`}>{children}</button>;
}
