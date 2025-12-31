import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    icon,
    type = 'text',
    className = '',
    fullWidth = false,
    ...props
}) => {
    const inputClasses = [
        'input-wrapper',
        fullWidth && 'input-full',
        error && 'input-error',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={inputClasses}>
            {label && <label className="input-label">{label}</label>}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    className={`input-field ${icon ? 'input-with-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
