import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  XCircle,
  CheckCircle2,
  Stethoscope,
  MapPin,
} from 'lucide-react';

import {
  getAdminDoctorList,
  verifyDoctor,
  rejectDoctor,
} from '@/api/adminApi';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar } from '@/components/shared/Avatar';

type StatusFilter =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | undefined;

// §6's doctor verification queue. Reads the initial filter from the URL
// query param (?status=PENDING) so the dashboard's banner link lands
// directly on the filtered view, rather than requiring a second click
// after arriving here.
export default function DoctorVerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus =
    (searchParams.get('status') as StatusFilter) ?? 'PENDING';

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(initialStatus);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'doctors', statusFilter],
    queryFn: () => getAdminDoctorList(statusFilter),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyDoctor,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'doctors'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard'],
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDoctor,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'doctors'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin', 'dashboard'],
      });
    },
  });

  const handleFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setSearchParams(status ? { status } : {});
  };

  if (isLoading) return <Loader />;

  const doctors = data?.content ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          Doctor Verification
        </h1>

        <p className="text-ink-400 mt-1">
          Review and verify doctor registrations.
        </p>
      </div>

      {/* Filters */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-full w-max">
          <FilterTab
            label="Pending"
            active={statusFilter === 'PENDING'}
            onClick={() => handleFilterChange('PENDING')}
          />

          <FilterTab
            label="Verified"
            active={statusFilter === 'VERIFIED'}
            onClick={() => handleFilterChange('VERIFIED')}
          />

          <FilterTab
            label="Rejected"
            active={statusFilter === 'REJECTED'}
            onClick={() => handleFilterChange('REJECTED')}
          />

          <FilterTab
            label="All"
            active={statusFilter === undefined}
            onClick={() => handleFilterChange(undefined)}
          />
        </div>
      </div>

      {doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          message="No doctors in this category"
          subtext="Try a different filter."
        />
      ) : (
        <div className="grid gap-3">
          {doctors.map((doc) => (
            <Card
              key={doc.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* Doctor information */}
              <div className="flex items-center gap-4 min-w-0">
                <Avatar
                  photoUrl={doc.profilePhotoUrl}
                  name={doc.fullName}
                  size="lg"
                />

                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">
                    Dr. {doc.fullName}
                  </p>

                  <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5 flex-wrap">
                    <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
                    {doc.specialization}

                    <span className="mx-1">·</span>

                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {doc.city}
                  </p>

                  <p className="text-xs text-ink-400 mt-0.5">
                    Reg. No: {doc.medicalRegistrationNumber}
                  </p>
                </div>
              </div>

              {/* Verification actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {doc.verificationStatus === 'PENDING' && (
                  <>
                    <Button
                      variant="secondary"
                      className="!py-1.5 !px-3 text-xs"
                      isLoading={
                        verifyMutation.isPending &&
                        verifyMutation.variables === doc.id
                      }
                      onClick={() => verifyMutation.mutate(doc.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify
                    </Button>

                    <Button
                      variant="danger"
                      className="!py-1.5 !px-3 text-xs"
                      isLoading={
                        rejectMutation.isPending &&
                        rejectMutation.variables === doc.id
                      }
                      onClick={() => rejectMutation.mutate(doc.id)}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </>
                )}

                {doc.verificationStatus === 'VERIFIED' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}

                {doc.verificationStatus === 'REJECTED' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-danger-700 bg-danger-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejected
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
        ${
          active
            ? 'bg-white text-teal-600 shadow-soft'
            : 'text-ink-400 hover:text-ink-600'
        }`}
    >
      {label}
    </button>
  );
}