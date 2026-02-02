import React from 'react';

const BottomBar = ({ onRemove, onReview, isDisabled, isPreparing }) => {
    const reviewDisabled = isDisabled || isPreparing;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
            <div className="max-w-6xl mx-auto flex space-x-4 w-full">
                <button
                    onClick={onRemove}
                    disabled={isDisabled || isPreparing}
                    className={`flex-1 px-8 py-2 md:py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors
                    ${isDisabled || isPreparing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                        }`}
                >
                    REMOVE
                </button>
                <button
                    onClick={onReview}
                    disabled={reviewDisabled}
                    className={`flex-1 px-8 py-2 md:py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors
                    ${reviewDisabled
                            ? 'bg-gray-300 text-white cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {isPreparing ? 'PREPARING...' : 'REVIEW'}
                </button>
            </div>
        </div>
    );
};

export default BottomBar;
