import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => (
      <div key={step.number} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            step.number === currentStep ? 'bg-blue-500' : 
            step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {step.number < currentStep ? <CheckCircle2 size={20} /> : step.number}
          </div>
          <div className="text-center mt-2">
            <div className={`font-medium ${step.number === currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
              {step.title}
            </div>
            <div className="text-sm text-gray-500">{step.subtitle}</div>
          </div>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-24 h-0.5 mx-4 ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;

