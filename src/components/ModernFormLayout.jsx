// src/components/forms/ModernFormLayout.jsx
import React from 'react';
import Select from 'react-select';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ModernFormLayout = ({ fields, state, setState, errors = {}, optionListState = {}, onChangeCallBack = {}, isDisabled = false, validationErrors = [], isMobile = false }) => {
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: isMobile ? '6px 2px' : '4px 2px',
            minHeight: isMobile ? '44px' : '40px',
            backgroundColor: state.isFocused ? '#f8fafc' : 'white',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            borderColor: state.isFocused ? '#3b82f6' : provided.borderColor,
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
            },
            transition: 'all 0.2s ease',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
            padding: '10px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: state.isSelected ? '#3b82f6' : '#e2e8f0',
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 9999,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af',
            fontSize: '14px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1f2937',
            fontSize: '14px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#6b7280',
            '&:hover': {
                color: '#4b5563',
            },
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };

    const renderFieldIcon = (icon) => {
        if (!icon) return null;

        if (typeof icon === 'string' && icon.length <= 3) {
            return <span className="text-lg">{icon}</span>;
        }

        return <span className="text-gray-400">📝</span>;
    };

    const renderField = (field, index) => {
        const fieldError = errors[field.name] || validationErrors.find((err) => err.field === field.name);
        const fieldStyle = field.fieldStyle || {};
        const isRequired = field.require;

        // Condition check
        if (field.condition && !field.condition(state)) {
            return null;
        }

        const commonInputClasses = `
      ${fieldStyle.input || 'form-input'}
      ${fieldError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}
      ${isMobile ? 'text-base py-3' : 'text-sm py-2.5'}
      transition-all duration-200
      hover:shadow-sm
      focus:shadow-md
    `.trim();

        const renderLabel = () => (
            <div className="flex items-center justify-between">
                <label className={fieldStyle.label || 'block text-sm font-medium text-gray-700 mb-2'}>
                    <span className="flex items-center gap-2">
                        {renderFieldIcon(field.icon)}
                        {field.label}
                        {isRequired && <span className="text-rose-500 ml-1">*</span>}
                    </span>
                </label>
                {field.helpText && (
                    <Tippy content={field.helpText}>
                        <span className="text-gray-400 hover:text-gray-600 cursor-help">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0 0h-1m1 0v4m-5-4h.01M11 12h2" />
                            </svg>
                        </span>
                    </Tippy>
                )}
            </div>
        );

        switch (field.inputType) {
            case 'text':
            case 'number':
            case 'email':
            case 'tel':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="relative">
                            <input
                                type={field.inputType}
                                id={field.name}
                                name={field.name}
                                value={state[field.name] || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setState({ ...state, [field.name]: value });

                                    if (onChangeCallBack[field.name]) {
                                        onChangeCallBack[field.name](value, field.name);
                                    }
                                }}
                                className={commonInputClasses}
                                placeholder={field.placeholder}
                                disabled={isDisabled || field.isDisabled}
                                required={isRequired}
                            />
                            {fieldError && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="text-rose-500 text-sm">⚠️</span>
                                </div>
                            )}
                        </div>
                        {fieldError && (
                            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                {typeof fieldError === 'object' ? fieldError.message : fieldError}
                            </p>
                        )}
                        {field.helpText && !fieldError && <p className="text-gray-500 text-xs mt-1">{field.helpText}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="relative">
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={state[field.name] || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setState({ ...state, [field.name]: value });
                                }}
                                className={`${commonInputClasses} resize-none min-h-[100px]`}
                                placeholder={field.placeholder}
                                disabled={isDisabled}
                                rows={field.rows || 3}
                                required={isRequired}
                            />
                            {fieldError && (
                                <div className="absolute right-3 top-3">
                                    <span className="text-rose-500 text-sm">⚠️</span>
                                </div>
                            )}
                        </div>
                        {fieldError && <p className="text-rose-600 text-xs mt-1">{fieldError.message}</p>}
                    </div>
                );

            case 'select':
                const options = optionListState[field.optionList] || [];
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <Select
                            options={options}
                            value={options.find((opt) => opt.value === state[field.name]) || null}
                            onChange={(selected) => {
                                setState({ ...state, [field.name]: selected?.value || '' });

                                if (onChangeCallBack[field.name]) {
                                    onChangeCallBack[field.name](selected?.value || '', field.name);
                                }
                            }}
                            placeholder={field.placeholder || `Select ${field.label}`}
                            styles={customSelectStyles}
                            isDisabled={isDisabled || field.isDisabled}
                            isClearable={!isRequired}
                            required={isRequired}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                        {fieldError && <p className="text-rose-600 text-xs mt-1">{fieldError.message}</p>}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                id={field.name}
                                name={field.name}
                                checked={!!state[field.name]}
                                onChange={(e) => {
                                    setState({ ...state, [field.name]: e.target.checked });
                                }}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                                disabled={isDisabled}
                            />
                            <label htmlFor={field.name} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                {renderFieldIcon(field.icon)}
                                {field.label}
                                {isRequired && <span className="text-rose-500 ml-1">*</span>}
                            </label>
                        </div>
                        {field.helpText && <p className="text-gray-500 text-xs mt-2 ml-8">{field.helpText}</p>}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="space-y-2 mt-2">
                            {field.options?.map((option) => (
                                <label key={option.value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field.name}
                                        value={option.value}
                                        checked={state[field.name] === option.value}
                                        onChange={(e) => {
                                            setState({ ...state, [field.name]: e.target.value });
                                        }}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        disabled={isDisabled}
                                    />
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                    {option.score && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{option.score} pts</span>}
                                </label>
                            ))}
                        </div>
                        {fieldError && <p className="text-rose-600 text-xs mt-2">{fieldError.message}</p>}
                    </div>
                );

            case 'date':
            case 'time':
            case 'month':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="relative">
                            <input
                                type={field.inputType}
                                id={field.name}
                                name={field.name}
                                value={state[field.name] || ''}
                                onChange={(e) => {
                                    setState({ ...state, [field.name]: e.target.value });
                                }}
                                className={commonInputClasses}
                                disabled={isDisabled}
                                required={isRequired}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{field.inputType === 'date' ? '📅' : field.inputType === 'time' ? '⏰' : '📆'}</div>
                        </div>
                        {fieldError && <p className="text-rose-600 text-xs mt-1">{fieldError.message}</p>}
                    </div>
                );

            case 'file':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            name={field.name}
                                            className="sr-only"
                                            multiple={field.multiple}
                                            accept={field.accept}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                setState({ ...state, [field.name]: files });
                                            }}
                                            disabled={isDisabled}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">{field.accept ? `Accepted: ${field.accept}` : 'Any file up to 5MB'}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'checkboxGroup':
                return (
                    <div key={field.name} className={fieldStyle.container || field.classStyle}>
                        {renderLabel()}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {field.options?.map((option) => (
                                <label key={option.value} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={state[field.name]?.includes(option.value) || false}
                                        onChange={(e) => {
                                            const currentValues = state[field.name] || [];
                                            const newValues = e.target.checked ? [...currentValues, option.value] : currentValues.filter((v) => v !== option.value);
                                            setState({ ...state, [field.name]: newValues });
                                        }}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        disabled={isDisabled}
                                    />
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                    {option.color && option.bgColor && <span className={`ml-auto text-xs px-2 py-1 rounded-full ${option.bgColor} ${option.color}`}>{option.label}</span>}
                                </label>
                            ))}
                        </div>
                        {fieldError && <p className="text-rose-600 text-xs mt-2">{fieldError.message}</p>}
                    </div>
                );

            default:
                return null;
        }
    };

    return <div className="space-y-6">{fields.map((field, index) => renderField(field, index))}</div>;
};

export default ModernFormLayout;
