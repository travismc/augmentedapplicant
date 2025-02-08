'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    resume: null as File | null,
    jobTitles: '',
    industries: '',
    locations: '',
  });

  const totalSteps = 3;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        resume: e.target.files![0],
      }));
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.resume) {
          setError('Please upload your resume');
          return false;
        }
        break;
      case 2:
        if (!formData.jobTitles.trim()) {
          setError('Please enter at least one job title');
          return false;
        }
        if (!formData.industries.trim()) {
          setError('Please enter at least one industry');
          return false;
        }
        if (!formData.locations.trim()) {
          setError('Please enter at least one location');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = async () => {
    setError(null);

    if (!validateStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      try {
        // Create form data for file upload
        const formDataToSend = new FormData();
        if (formData.resume) {
          formDataToSend.append('resume', formData.resume);
        }
        formDataToSend.append('jobTitles', formData.jobTitles);
        formDataToSend.append('industries', formData.industries);
        formDataToSend.append('locations', formData.locations);

        const response = await fetch('/api/onboarding', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error('Failed to save onboarding data');
        }

        const result = await response.json();
        console.log('Onboarding completed:', result);

        router.push('/dashboard');
      } catch (err) {
        console.error('Error saving onboarding data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return {
    currentStep,
    formData,
    progressPercentage,
    isLoading,
    error,
    handleFileChange,
    handleInputChange,
    handleBack,
    handleNext,
  };
}
