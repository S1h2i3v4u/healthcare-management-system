import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, BadgeCheck, Clock3 } from 'lucide-react';
import { getMyDoctorProfile, updateMyDoctorProfile } from '@/api/doctorProfileApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/shared/Loader';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Avatar } from '@/components/shared/Avatar';

export default function DoctorProfileSettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
  } = useQuery({
    queryKey: ['doctors', 'me'],
    queryFn: getMyDoctorProfile,
  });

  const [form, setForm] = useState({
    medicalQualification: '',
    specialization: '',
    yearsOfExperience: 0,
    consultationFee: 0,
    city: '',
    address: '',
    professionalBio: '',
    profilePhotoUrl: '',
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        medicalQualification: profile.medicalQualification,
        specialization: profile.specialization,
        yearsOfExperience: profile.yearsOfExperience,
        consultationFee: profile.consultationFee,
        city: profile.city,
        address: profile.address,
        professionalBio: profile.professionalBio ?? '',
        profilePhotoUrl: profile.profilePhotoUrl ?? '',
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => updateMyDoctorProfile(form),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['doctors', 'me'],
      });

      setSaveMessage('Profile updated');

      setTimeout(() => {
        setSaveMessage(null);
      }, 2500);
    },

    onError: (err: any) => {
      setError(
        err?.response?.data?.message ?? 'Could not save changes.'
      );
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          Profile Settings
        </h1>

        <p className="text-ink-400 mt-1">
          Manage your professional details.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        {/* Verification Status */}
        <div className="flex items-center gap-2 mb-5 pb-5 border-b border-line">
          {profile.verificationStatus === 'VERIFIED' ? (
            <span className="flex items-center gap-1.5 text-sm text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full font-medium">
              <BadgeCheck className="w-4 h-4" />
              Verified Doctor
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-warning-700 bg-warning-50 px-3 py-1.5 rounded-full font-medium">
              <Clock3 className="w-4 h-4" />
              Verification Pending
            </span>
          )}
        </div>

        <ErrorBanner message={error} />

        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar
              photoUrl={form.profilePhotoUrl}
              name={profile.fullName}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <Input
                label="Profile Photo URL"
                placeholder="https://..."
                value={form.profilePhotoUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    profilePhotoUrl: e.target.value,
                  })
                }
              />

              <p className="text-xs text-ink-400 mt-1.5">
                Paste a publicly accessible image URL.
              </p>
            </div>
          </div>

          {/* Qualification */}
          <Input
            label="Qualification"
            value={form.medicalQualification}
            onChange={(e) =>
              setForm({
                ...form,
                medicalQualification: e.target.value,
              })
            }
          />

          {/* Specialization */}
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={(e) =>
              setForm({
                ...form,
                specialization: e.target.value,
              })
            }
          />

          {/* Experience + Consultation Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Years of Experience"
              type="number"
              value={form.yearsOfExperience}
              onChange={(e) =>
                setForm({
                  ...form,
                  yearsOfExperience: Number(e.target.value),
                })
              }
            />

            <Input
              label="Consultation Fee (₹)"
              type="number"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({
                  ...form,
                  consultationFee: Number(e.target.value),
                })
              }
            />
          </div>

          {/* City */}
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

          {/* Address */}
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

          {/* Professional Bio */}
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              Professional Bio
            </label>

            <textarea
              value={form.professionalBio}
              onChange={(e) =>
                setForm({
                  ...form,
                  professionalBio: e.target.value,
                })
              }
              rows={4}
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 pt-6 border-t border-line">
          <Button
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            isLoading={mutation.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>

          {saveMessage && (
            <span className="text-sm text-success-700">
              {saveMessage}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}