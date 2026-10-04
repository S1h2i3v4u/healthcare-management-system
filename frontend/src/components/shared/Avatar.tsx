import { useState } from 'react';

interface AvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tint?: 'teal' | 'sage';
}

// One avatar component for the whole app — renders a real photo when
// available, falls back to initials when there's no URL OR when the URL
// fails to load (broken link, deleted image, etc.). The onError fallback
// matters: without it, a doctor with a stale/broken photoUrl would show a
// broken-image icon instead of gracefully degrading to initials.
const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

const TINT_CLASSES = {
  teal: 'bg-teal-50 text-teal-500',
  sage: 'bg-sage-50 text-sage-500',
};

export function Avatar({ photoUrl, name, size = 'md', tint = 'teal' }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');

  if (photoUrl && !imgFailed) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setImgFailed(true)}
        className={`${SIZE_CLASSES[size]} rounded-full object-cover flex-shrink-0 border border-line`}
      />
    );
  }

  return (
    <div className={`${SIZE_CLASSES[size]} ${TINT_CLASSES[tint]} rounded-full flex items-center justify-center font-display flex-shrink-0`}>
      {initials}
    </div>
  );
}