import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { RegisterDoctorRequest } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export default function DoctorRegisterPage() {
  const { registerDoctor, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterDoctorRequest>();

  const password = watch('password');

  const onSubmit = async (data: RegisterDoctorRequest) => {
    setServerError(null);
    try {
      // consultationFee arrives from an <input type="number"> as a string
      // in the form's raw values unless coerced — react-hook-form's
      // valueAsNumber (used below on that field's register call) handles
      // this, so `data.consultationFee` is already a real number here.
      await registerDoctor(data);
      navigate('/');
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-primary-700 mb-1">Doctor Registration</h1>
        <p className="text-gray-500 mb-6">
          Create your professional profile. Your account will be reviewed and verified by an admin before you can accept appointments.
        </p>

        <ErrorBanner message={serverError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />

          <Input
            label="Mobile Number"
            error={errors.mobileNumber?.message}
            {...register('mobileNumber', {
              required: 'Mobile number is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
            })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Input
              label="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Professional Details</p>
            <div className="space-y-4">
              <Input
                label="Medical Registration Number"
                error={errors.medicalRegistrationNumber?.message}
                {...register('medicalRegistrationNumber', { required: 'Registration number is required' })}
              />

              <Input
                label="Medical Qualification"
                placeholder="e.g. MBBS, MD"
                error={errors.medicalQualification?.message}
                {...register('medicalQualification', { required: 'Qualification is required' })}
              />

              <Input
                label="Specialization"
                placeholder="e.g. General Medicine"
                error={errors.specialization?.message}
                {...register('specialization', { required: 'Specialization is required' })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Years of Experience"
                  type="number"
                  error={errors.yearsOfExperience?.message}
                  {...register('yearsOfExperience', {
                    required: 'Experience is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                />
                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  error={errors.consultationFee?.message}
                  {...register('consultationFee', {
                    required: 'Consultation fee is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                />
              </div>

              <Input
                label="Hospital / Clinic Name"
                error={errors.hospitalName?.message}
                {...register('hospitalName')}
              />

              <Input
                label="City"
                error={errors.city?.message}
                {...register('city', { required: 'City is required' })}
              />

              <Input
                label="Address"
                error={errors.address?.message}
                {...register('address', { required: 'Address is required' })}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Optional</p>
            <Input label="Professional Bio" {...register('professionalBio')} />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Register as Doctor
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}