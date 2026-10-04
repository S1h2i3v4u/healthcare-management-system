import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Stethoscope,
  BadgeCheck,
  IndianRupee,
  SlidersHorizontal,
  MapPinned,
  ChevronLeft,
} from 'lucide-react';

import {
  searchDoctors,
  getAvailableCities,
  getSpecializationsForCity,
} from '@/api/doctorApi';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar } from '@/components/shared/Avatar';
import { SaveDoctorButton } from '@/components/shared/SaveDoctorButton';
import { useDebounce } from '@/hooks/useDebounce';

export default function FindDoctorsPage() {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Browse state
  const [browseCity, setBrowseCity] = useState<string | null>(null);

  // City search inside Browse by city
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const debouncedName = useDebounce(name, 400);
  const debouncedSpecialization = useDebounce(specialization, 400);
  const debouncedCity = useDebounce(city, 400);

  /* =========================
     BROWSE DATA
     ========================= */

  const { data: cities } = useQuery({
    queryKey: ['doctors', 'cities'],
    queryFn: getAvailableCities,
  });

  const { data: specializations } = useQuery({
    queryKey: ['doctors', 'specializations', browseCity],
    queryFn: () => getSpecializationsForCity(browseCity!),
    enabled: !!browseCity,
  });

  // Client-side city filtering
  const filteredCities = (cities ?? []).filter((c) =>
    c.toLowerCase().includes(citySearchTerm.toLowerCase()),
  );

  /* =========================
     DOCTOR SEARCH
     ========================= */

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'doctors',
      'search',
      debouncedName,
      debouncedSpecialization,
      debouncedCity,
    ],
    queryFn: () =>
      searchDoctors({
        name: debouncedName || undefined,
        specialization: debouncedSpecialization || undefined,
        city: debouncedCity || undefined,
        size: 20,
      }),
  });

  /* =========================
     BROWSE HANDLERS
     ========================= */

  const handleBrowseSpecialization = (spec: string) => {
    if (!browseCity) return;

    setSpecialization(spec);
    setCity(browseCity);
    setShowFilters(true);
  };

  const handleBackToCities = () => {
    setBrowseCity(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

      {/* =========================
          HEADER
          ========================= */}

      <div>
        <h1 className="font-display text-2xl text-ink">
          Find a Doctor
        </h1>

        <p className="text-ink-400 mt-1">
          Search verified doctors by name, specialty, or city.
        </p>
      </div>

      {/* =========================
          BROWSE BY CITY
          ========================= */}

      {!name && !specialization && !city && (
        <Card className="p-6">
          {!browseCity ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <MapPinned className="w-4 h-4 text-teal-500" />

                <p className="font-medium text-ink">
                  Browse by city
                </p>
              </div>

              {/* City search appears only when there are more than 8 cities */}
              {cities && cities.length > 8 && (
                <div className="relative mb-4 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />

                  <input
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full rounded-full border border-line bg-cream-100/60 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                  />
                </div>
              )}

              {!cities || cities.length === 0 ? (
                <p className="text-sm text-ink-400">
                  No cities available yet.
                </p>
              ) : filteredCities.length === 0 ? (
                <p className="text-sm text-ink-400">
                  No cities match "{citySearchTerm}".
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBrowseCity(c)}
                      className="px-4 py-2 rounded-full border border-line text-sm font-medium text-ink-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Back to cities */}
              <button
                type="button"
                onClick={handleBackToCities}
                className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 mb-4"
              >
                <ChevronLeft className="w-3.5 h-3.5" />

                Back to cities
              </button>

              <p className="font-medium text-ink mb-4">
                Specializations in {browseCity}
              </p>

              {!specializations || specializations.length === 0 ? (
                <p className="text-sm text-ink-400">
                  No doctors listed in this city yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {specializations.map((s) => (
                    <button
                      key={s.specialization}
                      type="button"
                      onClick={() =>
                        handleBrowseSpecialization(s.specialization)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-sm font-medium text-ink-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 transition-colors"
                    >
                      {s.specialization}

                      <span className="text-xs text-ink-400">
                        ({s.doctorCount})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* =========================
          SEARCH BAR
          ========================= */}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by doctor name..."
              className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />

            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
            <Input
              label="Specialization"
              placeholder="e.g. Cardiology"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />

            <Input
              label="City"
              placeholder="e.g. Pune"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* =========================
          RESULTS
          ========================= */}

      {isLoading && <Loader />}

      {isError && (
        <div className="text-center text-danger-700 py-8">
          Something went wrong. Please try again.
        </div>
      )}

      {!isLoading &&
        !isError &&
        (data?.content.length ?? 0) === 0 && (
          <EmptyState
            icon={Search}
            message="No doctors found matching your search."
            subtext="Try adjusting your filters or searching a different specialty."
          />
        )}

      {!isLoading && data && data.content.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.content.map((doctor) => (
            <Link
              key={doctor.id}
              to={`/patient/doctors/${doctor.id}`}
            >
              <Card
                hoverable
                className="p-4 sm:p-5 h-full flex flex-col"
              >
                {/* Doctor header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      photoUrl={doctor.profilePhotoUrl}
                      name={doctor.fullName}
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-ink truncate">
                          Dr. {doctor.fullName}
                        </p>

                        {doctor.verificationStatus === 'VERIFIED' && (
                          <BadgeCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5" />

                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Save doctor */}
                  <SaveDoctorButton
                    doctorId={doctor.id}
                    isSaved={doctor.isSaved ?? false}
                    size="sm"
                  />
                </div>

                {/* Qualification + experience */}
                <p className="text-sm text-ink-400 mt-3">
                  {doctor.medicalQualification} ·{' '}
                  {doctor.yearsOfExperience} yrs experience
                </p>

                {/* City + fee */}
                <div className="flex items-center justify-between mt-auto pt-4 gap-3">
                  <p className="text-sm text-ink-400 flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />

                    <span className="truncate">
                      {doctor.city}
                    </span>
                  </p>

                  <p className="text-sm font-medium text-ink flex items-center flex-shrink-0">
                    <IndianRupee className="w-3.5 h-3.5" />

                    {doctor.consultationFee}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}