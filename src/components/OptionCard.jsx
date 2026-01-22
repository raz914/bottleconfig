import React from 'react';

const OptionCard = ({ icon, label, onClick, isImage = false }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square group border border-transparent hover:border-gray-200"
    >
      <div className="mb-2 md:mb-4 h-10 w-10 md:h-16 md:w-16 flex items-center justify-center">
        {isImage ? (
          <img src={icon} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <img src={icon} alt={label} className="max-h-full max-w-full object-contain" />
        )}
      </div>
      <span className="text-[8px] md:text-xs font-bold tracking-wider text-gray-900 uppercase text-center group-hover:text-black leading-tight">
        {label}
      </span>
    </button>
  );
};

export default OptionCard;
