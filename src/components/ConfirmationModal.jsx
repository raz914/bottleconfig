import React, { useState } from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const [agreed, setAgreed] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden">
                    <h2 className="text-xl font-bold text-[#007db5] text-center uppercase tracking-wider mb-6">
                        Confirm This
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 mb-6 text-sm text-gray-600 leading-relaxed space-y-4 custom-scrollbar">
                        <p>
                            The submitted image and/or text is not unlawful, harmful, threatening, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable, does not infringe upon any patent, trademark, copyright, trade secret, or other proprietary rights of any third party (this includes but is not limited to sports teams and licensed university logos or slogans), and does not otherwise violate any of the rights or other categories listed in our FAQs. All personalized orders are subject to review. If any of the above conditions are violated, the entire order will be canceled.
                        </p>
                        <p>
                            Once you submit your order, you cannot edit or modify it. Any changes to the imprint of your order must be made before the order ships.
                        </p>
                        <p>
                            Personalized items are non-refundable and cannot be canceled after you place your order. All sales of personalized products are final.
                        </p>
                        <p>
                            We do not offer personalization of our stainless steel drinkware or Yonder bottles.
                        </p>
                        <p>
                            If you need assistance ordering custom drinkware, for example, if you want to place an order for products with a trademarked or copyrighted image for which you have permission, or if you have any questions, please contact our Outfitter team before placing your order.
                        </p>
                        <p>
                            For company logos, please visit our Corporate Sales page for information and quotes.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <label className="flex items-start space-x-3 mb-8 cursor-pointer group">
                        <div className="flex items-center h-5 mt-0.5">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-[#007db5] focus:ring-[#007db5] cursor-pointer transition-colors"
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-black transition-colors">
                            I agree to these terms and conditions
                        </span>
                    </label>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#007db5] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#006da0] transition-colors rounded shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!agreed}
                            className={`flex-1 py-3 font-bold uppercase tracking-widest text-xs rounded transition-all shadow-md ${agreed
                                    ? 'bg-[#007db5] text-white hover:bg-[#006da0]'
                                    : 'bg-[#9CA3AF] text-white cursor-not-allowed'
                                }`}
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
