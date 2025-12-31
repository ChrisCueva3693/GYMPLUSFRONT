import React from 'react';
import './Card.css';

const Card = ({
    children,
    className = '',
    hover = false,
    glass = false,
    ...props
}) => {
    const cardClasses = [
        'card-component',
        hover && 'card-hover',
        glass && 'glass',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    );
};

export default Card;
