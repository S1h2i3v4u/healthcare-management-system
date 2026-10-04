import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, UserX, UserCheck } from 'lucide-react';
import { getAdminPatientList, suspendPatient, activatePatient } from '@/api/adminApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';

export default function PatientManagementPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patients', debouncedSearch],
    queryFn: () => getAdminPatientList(debouncedSearch || undefined),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendPatient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] }),
  });

  const activateMutation = useMutation({
    mutationFn: activatePatient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] }),
  });

  if (isLoading) return <Loader />;

  const patients = data?.content ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Manage Patients</h1>
        <p className="text-ink-400 mt-1">View and manage patient accounts on the platform.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
        />
      </div>

      {patients.length === 0 ? (
        <EmptyState icon={Users} message="No patients found" subtext="Try a different search term." />
      ) : (
        <div className="grid gap-3">
          {patients.map((p) => (
            <Card key={p.id} className={`p-5 flex items-center justify-between ${!p.active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 font-display text-sm">
                  {p.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{p.fullName}</p>
                    {!p.active && (
                      <span className="text-xs bg-danger-50 text-danger-700 px-2 py-0.5 rounded-full font-medium">Suspended</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-400">{p.email} · {p.mobileNumber}</p>
                </div>
              </div>

              {p.active ? (
                <Button
                  variant="danger"
                  className="!py-1.5 !px-3 text-xs"
                  isLoading={suspendMutation.isPending && suspendMutation.variables === p.id}
                  onClick={() => suspendMutation.mutate(p.id)}
                >
                  <UserX className="w-3.5 h-3.5" /> Suspend
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="!py-1.5 !px-3 text-xs"
                  isLoading={activateMutation.isPending && activateMutation.variables === p.id}
                  onClick={() => activateMutation.mutate(p.id)}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Activate
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}