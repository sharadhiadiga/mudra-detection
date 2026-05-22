import { Hand } from 'lucide-react';

export default function CircleEmptyState({
  icon: Icon = Hand,
  label = 'Choose an image',
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-cream/45">
      <Icon
        className="h-8 w-8 text-gold opacity-80 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="text-xs font-medium uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}
