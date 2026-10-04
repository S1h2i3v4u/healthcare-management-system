import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveDoctor, unsaveDoctor } from '@/api/doctorApi';

interface SaveDoctorButtonProps {
  doctorId: number;
  isSaved: boolean;
  size?: 'sm' | 'md';
}

export function SaveDoctorButton({
  doctorId,
  isSaved,
  size = 'md',
}: SaveDoctorButtonProps) {
  const queryClient = useQueryClient();

  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);

  useEffect(() => {
    setOptimisticSaved(isSaved);
  }, [isSaved]);

  const mutation = useMutation({
    mutationFn: () =>
      optimisticSaved
        ? unsaveDoctor(doctorId)
        : saveDoctor(doctorId),

    onMutate: () => {
      setOptimisticSaved((current) => !current);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['doctors'],
      });

      queryClient.invalidateQueries({
        queryKey: ['saved-doctors'],
      });
    },

    onError: () => {
      setOptimisticSaved(isSaved);
    },
  });

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      title={
        optimisticSaved
          ? 'Remove from saved'
          : 'Save this doctor'
      }
      className={`p-2 rounded-full transition-colors ${
        optimisticSaved
          ? 'bg-danger-50 text-danger-500'
          : 'bg-cream-100 text-ink-400 hover:text-danger-500'
      }`}
    >
      <Heart
        className={iconSize}
        fill={optimisticSaved ? 'currentColor' : 'none'}
        strokeWidth={1.75}
      />
    </button>
  );
}