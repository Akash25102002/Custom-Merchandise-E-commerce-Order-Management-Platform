import React from 'react';

export const Card = ({ children, className = '', hoverEffect = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-warm-grey-light rounded-2xl p-6 transition-all duration-200 shadow-sm ${
        hoverEffect ? 'hover:border-ink hover:shadow-md' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
