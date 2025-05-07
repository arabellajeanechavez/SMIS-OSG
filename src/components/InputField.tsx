//InputField.tsx
import React, { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

interface InputFieldProps {
    id: string;
    name: string;
    suffix?: string;
    label: string;
    type?: HTMLInputTypeAttribute;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    error?: string;
    placeholder?: string;
    required?: boolean;
    autoFocus?: boolean;
    step?: string | number;
    min?: string | number;
    max?: string | number;
}

const InputField: React.FC<InputFieldProps> = ({
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required,
    autoFocus,
    step,
    min,
    max,
}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoFocus={autoFocus}
                step={step}
                min={min}
                max={max}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283971] ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;