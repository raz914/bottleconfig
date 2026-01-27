import React, { useState, useRef } from 'react';

const UploadView = ({ setView, setGraphic, graphicInput }) => {
    const fileInputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // Aspect ratio limits: 2:3 (0.67) to 3:2 (1.5)
    const MIN_RATIO = 0.67;
    const MAX_RATIO = 1.5;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadError(null);
            setIsLoading(true);
            setShowModal(false);

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const ratio = img.width / img.height;
                    if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
                        setUploadError(`Image aspect ratio (${ratio.toFixed(2)}) is outside the allowed range. Please use an image closer to square (between 2:3 and 3:2).`);
                        setIsLoading(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        return;
                    }
                    setGraphic({ src: event.target.result, name: file.name, isUpload: true, scale: 0.5 });
                    setIsLoading(false);
                };
                img.onerror = () => {
                    setUploadError('Failed to load image. Please try another file.');
                    setIsLoading(false);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setGraphic(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full max-w-2xl relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
            />

            {/* Mini Nav for Tools */}
            <div className="hidden md:flex items-center justify-center space-x-4 mb-8">
                <button className="p-4 bg-white rounded-xl shadow-sm border-2 border-black">
                    <img src="UI/icons/upload.svg" className="w-10 h-10" alt="Upload" />
                </button>
                <button onClick={() => setView('text')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/text.png" className="w-10 h-10 object-contain" alt="Text" />
                </button>
                <button onClick={() => setView('monogram')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/monogram.svg" className="w-10 h-10" alt="Monogram" />
                </button>
                <button onClick={() => setView('gallery')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/gallery.svg" className="w-10 h-10" alt="Gallery" />
                </button>
            </div>

            <div className="hidden md:block text-center mb-8">
                <span className="text-xs font-bold tracking-wider text-gray-900 uppercase block mb-1">UPLOAD YOUR OWN IMAGE</span>
            </div>

            {/* Back Button */}
            <button
                onClick={() => setView('main')}
                className="flex items-center text-[#002C5F] font-bold text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6 hover:opacity-80 transition-opacity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                BACK
            </button>

            {/* Scale Slider */}
            {graphicInput && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">SIZE</span>
                        <span className="text-xs font-bold text-gray-500">{Math.round((graphicInput.scale || 0.5) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={graphicInput.scale || 0.5}
                        onChange={(e) => setGraphic({ ...graphicInput, scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#002C5F]"
                    />
                </div>
            )}

            {/* Error Message */}
            {uploadError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Upload Failed</p>
                        <p className="text-xs text-red-600">{uploadError}</p>
                    </div>
                    <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200 flex flex-col items-center justify-center text-center min-h-[300px]">

                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#002C5F] rounded-full animate-spin mb-4"></div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">UPLOADING IMAGE...</span>
                    </div>
                ) : graphicInput ? (
                    // PREVIEW STATE
                    <div className="flex flex-col items-center w-full">


                        <div className="border-2 border-dashed border-gray-300 p-2 mb-4 rounded bg-gray-50 w-32 h-32 flex items-center justify-center">
                            <img
                                src={graphicInput.src}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                                style={{ filter: 'grayscale(100%) contrast(1.2) brightness(1.2)' }}
                            />
                        </div>



                        <button
                            onClick={handleRemove}
                            className="text-xs font-bold text-gray-400 underline hover:text-red-500 uppercase tracking-wider"
                        >
                            Remove Image
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2">
                            Please check the preview to ensure your image looks good to you!
                        </p>
                    </div>
                ) : (
                    // INITIAL STATE
                    <div className="flex flex-col items-center">

                        <button
                            onClick={() => setShowModal(true)}
                            className="px-8 py-3 bg-[#002C5F] text-white font-bold rounded hover:bg-[#003d82] transition-colors mb-4 uppercase tracking-wider"
                        >
                            Upload Image
                        </button>

                        <p className="text-xs text-gray-400">
                            Accepts .jpg and .png
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col relative animate-fade-in-up">

                        {/* Modal Header */}
                        <div className="p-6 pb-2 relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-normal text-center text-gray-800 mb-2">Upload Guidelines For Engraving</h2>
                            <p className="text-xs text-center text-gray-600 px-4">
                                Laser engraving is done on the surface of your product without using ink, so there will be no colours. Follow the guidelines below for best results.
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 pt-2 space-y-6 overflow-y-auto custom-scrollbar">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Tips to create a winning personalised product include:</h3>
                                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-2">
                                    <li>For the best visual quality, upload print-ready or vector quality files for your artwork.</li>
                                    <li>Use a PNG file with a transparent background for best results (other acceptable files include JPG, JPEG).</li>
                                    <li>One colour artworks will work better than photos or gradients.</li>
                                    <li>Use a clear image or graphic.</li>
                                    <li><strong>Images should be close to square</strong> (aspect ratio between 2:3 and 3:2). Very wide or very tall images will not be accepted.</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">Simple illustrations are ideal</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        Notice the clear lines of the image. The engraving will address the darkest lines and skip transparent backgrounds.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">Results may vary with photographs</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        Photographs will be rendered in black and white, various gradients, and will be reduced to simple shapes with subtle details removed. Some images will work better than others.
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200" />

                            {/* Terms Checkbox */}
                            <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded">
                                <input
                                    type="checkbox"
                                    id="terms-check"
                                    checked={isAccepted}
                                    onChange={(e) => setIsAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-[#002C5F] focus:ring-[#002C5F] border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="terms-check" className="text-[10px] text-gray-600 leading-snug cursor-pointer select-none">
                                    I confirm that my content complies with all requirements of BeFit's Customised-Product Terms of Sale. I understand that my upload may be rejected, or my order cancelled if BeFit determines or reasonably suspects I may have violated these terms.
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-0 flex justify-center sticky bottom-0 bg-white">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={!isAccepted}
                                className={`w-full py-3 rounded font-bold uppercase tracking-widest transition-all
                                    ${isAccepted
                                        ? 'bg-[#002C5F] text-white hover:bg-[#003d82] shadow-md'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                Select Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadView;
