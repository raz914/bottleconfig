import React from 'react';

const BottomBar = ({ onRemove, onReview, isDisabled }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-end space-x-4">
            <button
                onClick={onRemove}
                disabled={isDisabled}
                className={`px-8 py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors
                    ${isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                    }`}
            >
                REMOVE
            </button>
            <button
                onClick={onReview}
                disabled={isDisabled}
                className={`px-8 py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors
                    ${isDisabled
                        ? 'bg-gray-300 text-white cursor-not-allowed'
                        : 'bg-slate-500 text-white hover:bg-slate-600'
                    }`}
            >
                REVIEW
            </button>
        </div>
    );
};

export default BottomBar;
