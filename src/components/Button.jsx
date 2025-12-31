import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        loading && 'btn-loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="btn-spinner"></span>
                    <span>Cargando...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
