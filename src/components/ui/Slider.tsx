"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueLabel?: string;
  minLabel?: string;
  maxLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      value,
      valueLabel,
      minLabel,
      maxLabel,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-primary-text">
            {label}
          </label>
          {valueLabel && (
            <span className="text-sm font-bold text-coral bg-background-deeper px-2 py-1 rounded">
              {valueLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {minLabel && <span className="text-xs text-secondary-text">{minLabel}</span>}
          <input
            ref={ref}
            type="range"
            value={value}
            className="w-full h-2 bg-border-dark rounded-lg appearance-none cursor-pointer slider-thumb"
            {...props}
          />
          {maxLabel && <span className="text-xs text-secondary-text">{maxLabel}</span>}
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export default Slider;
