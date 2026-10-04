import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Power, MapPin, Phone } from 'lucide-react';
import {
  createHospital,
  updateHospital,
  deactivateHospital,
  getAllHospitalsForAdmin,
  reactivateHospital,
} from '@/api/hospitalApi';
import type { Hospital } from '@/types';
import type { HospitalFormData } from '@/api/hospitalApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

const EMPTY_FORM: HospitalFormData = {
  name: '',
  address: '',
  city: '',
  phone: '',
  description: '',
  specialties: '',
  state: '',
  pincode: '',
  email: '',
  website: '',
};

// §6's hospital CRUD. One form component handles BOTH create and edit —
// distinguished by whether `editingHospital` is set — rather than two
// near-identical forms, since every field is shared between the two modes.
export default function HospitalManagementPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'hospitals'],
    queryFn: () => getAllHospitalsForAdmin(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [form, setForm] = useState<HospitalFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createHospital(form),
    onSuccess: () => {
      closeForm();
      queryClient.invalidateQueries({
        queryKey: ['admin', 'hospitals'],
      });
    },
    onError: (err: any) =>
      setError(
        err?.response?.data?.message ?? 'Could not create hospital.'
      ),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateHospital(editingHospital!.id, form),
    onSuccess: () => {
      closeForm();
      queryClient.invalidateQueries({
        queryKey: ['admin', 'hospitals'],
      });
    },
    onError: (err: any) =>
      setError(
        err?.response?.data?.message ?? 'Could not update hospital.'
      ),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateHospital,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin', 'hospitals'],
      }),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateHospital,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin', 'hospitals'],
      }),
  });

  const openCreateForm = () => {
    setEditingHospital(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (hospital: Hospital) => {
    setEditingHospital(hospital);

    setForm({
      name: hospital.name,
      description: hospital.description ?? '',
      address: hospital.address,
      city: hospital.city,
      state: hospital.state ?? '',
      pincode: hospital.pincode ?? '',
      phone: hospital.phone,
      email: hospital.email ?? '',
      website: hospital.website ?? '',
      specialties: hospital.specialties ?? '',
      imageUrl: hospital.imageUrl ?? '',
    });

    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingHospital(null);
  };

  const handleSubmit = () => {
    setError(null);

    if (editingHospital) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isLoading) return <Loader />;

  const hospitals = data?.content ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">
            Hospital Management
          </h1>

          <p className="text-ink-400 mt-1">
            Add and manage hospitals on the platform.
          </p>
        </div>

        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          Add Hospital
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <p className="font-medium text-ink">
            {editingHospital ? 'Edit Hospital' : 'New Hospital'}
          </p>

          <ErrorBanner message={error} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

            <Input
              label="Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />

            <Input
              label="City"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                })
              }
            />

            <Input
              label="State"
              value={form.state}
              onChange={(e) =>
                setForm({
                  ...form,
                  state: e.target.value,
                })
              }
            />

            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value,
                })
              }
            />

            <Input
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <Input
              label="Website"
              value={form.website}
              onChange={(e) =>
                setForm({
                  ...form,
                  website: e.target.value,
                })
              }
            />
          </div>

          <Input
            label="Specialties (comma-separated)"
            placeholder="Cardiology, Orthopedics, Pediatrics"
            value={form.specialties}
            onChange={(e) =>
              setForm({
                ...form,
                specialties: e.target.value,
              })
            }
          />

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              isLoading={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingHospital
                ? 'Save Changes'
                : 'Create Hospital'}
            </Button>

            <Button
              variant="ghost"
              onClick={closeForm}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {hospitals.length === 0 ? (
        <EmptyState
          icon={Building2}
          message="No hospitals yet"
          subtext="Add your first hospital to get started."
        />
      ) : (
        <div className="grid gap-3">
          {hospitals.map((h) => (
            <Card
              key={h.id}
              className={`p-5 flex items-center justify-between ${
                h.status === 'INACTIVE'
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">
                    {h.name}
                  </p>

                  {h.status === 'INACTIVE' && (
                    <span className="text-xs bg-cream-200 text-ink-400 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {h.address}, {h.city}
                </p>

                <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {h.phone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditForm(h)}
                  className="p-2 rounded-lg text-ink-400 hover:bg-cream-100 hover:text-ink-600"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {h.status === 'ACTIVE' ? (
                  <button
                    onClick={() =>
                      deactivateMutation.mutate(h.id)
                    }
                    className="p-2 rounded-lg text-ink-400 hover:bg-danger-50 hover:text-danger-700"
                    title="Deactivate"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      reactivateMutation.mutate(h.id)
                    }
                    className="p-2 rounded-lg text-teal-500 hover:bg-teal-50"
                    title="Reactivate"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

