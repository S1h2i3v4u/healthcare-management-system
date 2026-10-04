
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, IndianRupee } from 'lucide-react';
import { getSavedDoctors } from '@/api/doctorApi';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/shared/Avatar';
import { SaveDoctorButton } from '@/components/shared/SaveDoctorButton';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function SavedDoctorsPage() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['saved-doctors'],
    queryFn: getSavedDoctors,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Saved Doctors</h1>
        <p className="text-ink-400 mt-1">Doctors you've bookmarked for quick access.</p>
      </div>

      {!doctors || doctors.length === 0 ? (
        <EmptyState
          icon={Heart}
          message="No saved doctors yet"
          subtext="Tap the heart on any doctor's profile to save them here for next time."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} hoverable className="p-5">
              <div className="flex items-start justify-between">
                <Link to={`/patient/doctors/${doctor.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar photoUrl={doctor.profilePhotoUrl} name={doctor.fullName} size="lg" />
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">Dr. {doctor.fullName}</p>
                    <p className="text-sm text-ink-400 truncate">{doctor.specialization}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-ink-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {doctor.city}</span>
                      <span className="flex items-center"><IndianRupee className="w-3.5 h-3.5" />{doctor.consultationFee}</span>
                    </div>
                  </div>
                </Link>
                <SaveDoctorButton doctorId={doctor.id} isSaved={true} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}