import React from 'react';

const OptionCard = ({ icon, label, onClick, isImage = false }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 w-full"
    >
      <div className="flex items-center justify-center w-full aspect-square bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 border border-transparent group-hover:border-gray-200 p-3 md:p-6">
        <div className="h-10 w-10 md:h-16 md:w-16 flex items-center justify-center">
          {isImage ? (
            <img src={icon} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <img src={icon} alt={label} className="max-h-full max-w-full object-contain" />
          )}
        </div>
      </div>
      <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-900 uppercase text-center group-hover:text-black leading-tight">
        {label}
      </span>
    </button>
  );
};

export default OptionCard;
