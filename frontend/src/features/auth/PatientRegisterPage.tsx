import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { RegisterPatientRequest } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

// react-hook-form's own validation handles the simple per-field rules
// (required, min length) exactly like the backend's @NotBlank/@Size —
// but password-confirmation matching is a CROSS-field rule, same
// limitation flagged back when we built RegisterPatientRequest.java.
// react-hook-form's watch() is how that gets checked here, mirroring
// AuthService.registerPatient()'s explicit equals() check server-side.
export default function PatientRegisterPage() {
  const { registerPatient, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterPatientRequest>();

  const password = watch('password');

  const onSubmit = async (data: RegisterPatientRequest) => {
    setServerError(null);
    try {
      await registerPatient(data);
      navigate('/');
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-primary-700 mb-1">Create your account</h1>
        <p className="text-gray-500 mb-6">Register as a patient to book appointments and manage your health records</p>

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
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
            />
            <Select
              label="Gender"
              placeholder="Select..."
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender', { required: 'Gender is required' })}
            />
          </div>

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

          {/* Optional fields, per §4 */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Optional</p>
            <div className="space-y-4">
              <Input label="Blood Group" {...register('bloodGroup')} />
              <Input label="Address" {...register('address')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
                <Input label="Emergency Contact Mobile" {...register('emergencyContactMobile')} />
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
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