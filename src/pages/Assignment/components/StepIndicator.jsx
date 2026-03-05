import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const StepIndicator = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => (
      <div key={step.number} className="flex items-center">
        <div
          className="flex flex-col items-center"
          onClick={() => {
            // Allow clicking to go back to completed steps
            if (onStepClick && step.number < currentStep) {
              onStepClick(step.number);
            }
          }}
          style={{ cursor: step.number < currentStep ? 'pointer' : 'default' }}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
            step.number === currentStep ? 'bg-blue-500 ring-4 ring-blue-100 scale-110' :
            step.number < currentStep ? 'bg-green-500 hover:bg-green-600 hover:scale-105' : 'bg-gray-300'
          }`}>
            {step.number < currentStep ? <CheckCircle2 size={20} /> : step.number}
          </div>
          <div className="text-center mt-2">
            <div className={`font-medium transition-colors ${
              step.number === currentStep ? 'text-blue-600' :
              step.number < currentStep ? 'text-green-600' : 'text-gray-400'
            }`}>
              {step.title}
            </div>
            <div className={`text-sm ${
              step.number <= currentStep ? 'text-gray-500' : 'text-gray-400'
            }`}>{step.subtitle}</div>
          </div>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-24 h-0.5 mx-4 transition-colors duration-500 ${
            step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
