import React, { useState } from 'react';

const UploadConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
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
                    <h2 className="text-lg md:text-xl font-bold text-[#007db5] text-center uppercase tracking-wider mb-6 leading-tight">
                        In order to proceed, please review and accept the following:
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 mb-6 text-sm text-gray-600 leading-relaxed space-y-4 custom-scrollbar">
                        <p>
                            Befit Coolers, LLC ("Befit", "Our") provides our customizer services to you through our website(s) located at Befit.com (the "Site") and related technologies (the "Service"). As a condition to the access and use of the Service you agree to the terms and conditions below:
                        </p>

                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Representation and Warranties</h3>
                        <p>
                            You represent and warrant that you: a) are of legal age to enter and agree to these terms and conditions; b) if you are using the Services on behalf of a company or other organization, then you are entering into this agreement on behalf of yourself and such organization, and you represent that you have the legal authority to bind such organization to these terms of service; c) you are solely responsible for, images, information, photographs, graphics, messages, and other materials ("content") that you make available to Befit by uploading, posting, publishing, or displaying via the Service (collectively, "User Content"); d) you own all right, title and interest in and to such User Content; e) the User Content is not unlawful, harmful, threatening, tortious, defamatory, vulgar, obscene, libelous, invasive of another’s privacy, hateful, or racially, ethnically or otherwise objectionable, is not connected to any political affiliations, associations or candidates, does not infringe on any patent, trademark, copyright, trade secret, or other proprietary rights of any third party (this includes, but is not limited to, sport teams and collegiate licensed logos or phrases), and does not otherwise violate anyone’s rights or other categories listed in our FAQ.
                        </p>

                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Limitation of Liability</h3>
                        <p className="uppercase">
                            You expressly understand and agree that Befit will not be liable for any indirect, incidental, special, consequential, exemplary damages, or damages for loss of profits including damages for loss of goodwill, use, or other intangible losses (even if Befit has been advised of the possibility of such damages), whether based on contract, tort, negligence, strict liability, or otherwise, resulting from: (a) the products or the use or the inability to use the service; or (b) the user content. Some jurisdictions do not allow the limitation or exclusion of liability for incidental or consequential damages, so some of the above may not apply to you. In such jurisdictions, liability is limited to the fullest extent permitted by law.
                        </p>

                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Indemnification</h3>
                        <p>
                            You agree to defend, indemnify, and hold harmless Befit, its affiliates, and its and their respective officers, employees, directors, service providers, licensors, and agents (collectively, the "Befit Parties") from any and all losses, damages, expenses, including reasonable attorneys’ fees, rights, claims, actions of any kind, and injury arising out of or relating to your use of the Service, any User Content, your connection to the Service, your violation of these this agreement, or your violation of any rights of another.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <label className="flex items-start space-x-3 mb-8 cursor-pointer group flex-shrink-0">
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
                    <div className="flex space-x-4 flex-shrink-0">
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
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadConfirmationModal;
