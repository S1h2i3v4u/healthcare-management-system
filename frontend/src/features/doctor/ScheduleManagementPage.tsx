import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Clock } from 'lucide-react';
import { getMyAvailability, addAvailability, deleteAvailability } from '@/api/doctorAvailabilityApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ScheduleManagementPage() {
  const queryClient = useQueryClient();
  const { data: rules, isLoading } = useQuery({ queryKey: ['availability'], queryFn: getMyAvailability });

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30,
    breakStartTime: '', breakEndTime: '',
  });

  const addMutation = useMutation({
    mutationFn: () => addAvailability({
      ...form,
      breakStartTime: form.breakStartTime || undefined,
      breakEndTime: form.breakEndTime || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setShowForm(false);
      setError(null);
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Could not add this schedule.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
  });

  if (isLoading) return <Loader />;

  const grouped = DAYS.map((day) => ({
    day,
    rules: (rules ?? []).filter((r) => r.dayOfWeek === day),
  }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Schedule Management</h1>
          <p className="text-ink-400 mt-1">Set your weekly availability for patient bookings.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Shift
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <ErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Day"
              options={DAYS.map((d) => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() }))}
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            />
            <Input
              label="Slot Duration (min)"
              type="number"
              value={form.slotDurationMinutes}
              onChange={(e) => setForm({ ...form, slotDurationMinutes: Number(e.target.value) })}
            />
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <Input label="Break Start (optional)" type="time" value={form.breakStartTime} onChange={(e) => setForm({ ...form, breakStartTime: e.target.value })} />
            <Input label="Break End (optional)" type="time" value={form.breakEndTime} onChange={(e) => setForm({ ...form, breakEndTime: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addMutation.mutate()} isLoading={addMutation.isPending}>Save Shift</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {(!rules || rules.length === 0) && !showForm ? (
        <EmptyState icon={Clock} message="No availability set yet" subtext="Add your working hours so patients can book appointments with you." />
      ) : (
        <div className="space-y-4">
          {grouped.filter((g) => g.rules.length > 0).map(({ day, rules }) => (
            <Card key={day} className="p-5">
              <p className="text-sm font-medium text-ink-600 mb-3">{day.charAt(0) + day.slice(1).toLowerCase()}</p>
              <div className="space-y-2">
                {rules.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
                    <div className="text-sm text-ink">
                      {r.startTime} – {r.endTime}
                      <span className="text-ink-400 ml-2">({r.slotDurationMinutes} min slots)</span>
                      {r.breakStartTime && (
                        <span className="text-ink-400 ml-2">· Break {r.breakStartTime}–{r.breakEndTime}</span>
                      )}
                    </div>
                    <button onClick={() => deleteMutation.mutate(r.id)} className="text-ink-400 hover:text-danger-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}