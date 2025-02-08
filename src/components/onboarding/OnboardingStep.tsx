interface OnboardingStepProps {
  currentStep: number;
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function OnboardingStep({
  currentStep,
  stepNumber,
  title,
  description,
  children,
}: OnboardingStepProps) {
  const isActive = currentStep === stepNumber;
  const isCompleted = currentStep > stepNumber;

  return (
    <div className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full
              ${isCompleted ? 'bg-green-500' : 'bg-blue-600'} text-white`}
          >
            {isCompleted ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-lg font-semibold">{stepNumber}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="ml-14">{children}</div>
      </div>
    </div>
  );
}
