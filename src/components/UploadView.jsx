import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import UploadConfirmationModal from './UploadConfirmationModal';

// Set up the worker for PDF.js
// - Dev: use Vite-served worker URL
// - Prod: use a copied `.js` worker (some WP hosts serve `.mjs` as text/plain)
import pdfWorkerDevUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.env.PROD
    ? new URL('./pdf.worker.min.js', import.meta.url).toString()
    : pdfWorkerDevUrl;

const MAX_MASK_DIMENSION = 1024;

const sampleAverageColor = (data, width, height, xStart, yStart, sampleSize) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    const safeX = Math.max(0, xStart);
    const safeY = Math.max(0, yStart);
    const xEnd = Math.min(width, safeX + sampleSize);
    const yEnd = Math.min(height, safeY + sampleSize);

    for (let y = safeY; y < yEnd; y++) {
        for (let x = safeX; x < xEnd; x++) {
            const idx = (y * width + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
        }
    }

    if (!count) return { r: 0, g: 0, b: 0 };
    return { r: r / count, g: g / count, b: b / count };
};

const colorDistance = (c1, c2) => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
};

const applyLuminanceMask = (data, options = {}) => {
    const {
        invert = false,
        threshold = 170,
        softness = 40,
        gamma = 0.7
    } = options;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        const delta = invert ? (v - threshold) : (threshold - v);
        let a = (delta / softness) * 255;

        if (a < 0) a = 0;
        if (a > 255) a = 255;

        if (gamma !== 1 && a > 0) {
            a = Math.pow(a / 255, gamma) * 255;
        }

        if (a < 25) a = 0;
        else if (a > 230) a = 255;

        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = Math.round(a);
    }
};

const createMetalMaskFromImage = (img) => {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return null;

    const scale = Math.min(1, MAX_MASK_DIMENSION / Math.max(iw, ih));
    const width = Math.max(1, Math.round(iw * scale));
    const height = Math.max(1, Math.round(ih * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, width, height);

    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, width, height);
    } catch (err) {
        console.warn('Failed to read image data for metal mask:', err);
        return null;
    }

    const data = imageData.data;
    let hasAlpha = false;

    for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) {
            hasAlpha = true;
            break;
        }
    }

    if (hasAlpha) {
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = a;
        }
    } else {
        const sampleSize = Math.max(2, Math.round(Math.min(width, height) * 0.04));
        const corners = [
            sampleAverageColor(data, width, height, 0, 0, sampleSize),
            sampleAverageColor(data, width, height, width - sampleSize, 0, sampleSize),
            sampleAverageColor(data, width, height, 0, height - sampleSize, sampleSize),
            sampleAverageColor(data, width, height, width - sampleSize, height - sampleSize, sampleSize)
        ];

        const bg = corners.reduce((acc, c) => ({
            r: acc.r + c.r / corners.length,
            g: acc.g + c.g / corners.length,
            b: acc.b + c.b / corners.length
        }), { r: 0, g: 0, b: 0 });

        let maxCornerDist = 0;
        for (const c of corners) {
            maxCornerDist = Math.max(maxCornerDist, colorDistance(c, bg));
        }

        const bgLum = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
        const invertLum = bgLum < 130;
        const lumThreshold = invertLum
            ? Math.min(230, bgLum + 45)
            : Math.max(25, bgLum - 45);
        const lumSoftness = 45;

        const tolerance = Math.min(100, Math.max(14, maxCornerDist * 2.2));
        const edgeSoftness = 18;
        let foregroundCount = 0;
        const totalPixels = width * height;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 10) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0;
                continue;
            }

            const dist = colorDistance({ r, g, b }, bg);
            let distAlpha = 0;

            if (dist > tolerance) {
                if (dist < tolerance + edgeSoftness) {
                    distAlpha = Math.round(((dist - tolerance) / edgeSoftness) * 255);
                } else {
                    distAlpha = 255;
                }
            }

            const v = 0.299 * r + 0.587 * g + 0.114 * b;
            const lumDelta = invertLum ? (v - lumThreshold) : (lumThreshold - v);
            let lumAlpha = (lumDelta / lumSoftness) * 255;
            if (lumAlpha < 0) lumAlpha = 0;
            if (lumAlpha > 255) lumAlpha = 255;

            let nextAlpha = Math.max(distAlpha, lumAlpha);
            if (nextAlpha > 0 && nextAlpha < 255) {
                nextAlpha = Math.pow(nextAlpha / 255, 0.65) * 255;
            }
            if (nextAlpha < 20) nextAlpha = 0;
            else if (nextAlpha > 230) nextAlpha = 255;

            if (nextAlpha > 0) foregroundCount++;
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = nextAlpha;
        }

        const foregroundRatio = foregroundCount / Math.max(1, totalPixels);
        if (foregroundRatio > 0.95 || foregroundRatio < 0.01) {
            applyLuminanceMask(data, {
                invert: invertLum,
                threshold: lumThreshold,
                softness: lumSoftness,
                gamma: 0.7
            });
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
};

const UploadView = ({ setView, setGraphic, graphicInput, activeTab, selectedColor }) => {
    const fileInputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [pendingGraphicData, setPendingGraphicData] = useState(null);

    // Aspect ratio limits: 2:3 (0.67) to 3:2 (1.5)
    const MIN_RATIO = 0.67;
    const MAX_RATIO = 1.5;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError(null);
        setIsLoading(true);
        setShowModal(false);
        setPendingGraphicData(null);

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        try {
            let src = '';

            // Handle PDF
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                try {
                    src = await renderPdfFirstPage(file);
                } catch (err) {
                    console.error("PDF Render error:", err);
                    setUploadError("Failed to render PDF preview. File may be corrupted or password protected.");
                    setIsLoading(false);
                    return;
                }
            }
            // Handle Images (PNG, JPG, BMP, SVG)
            else {
                src = await readFileAsDataURL(file);
            }

            const img = new Image();
            img.onload = () => {
                const ratio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
                if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
                    setUploadError(`Image aspect ratio (${ratio.toFixed(2)}) is outside the allowed range. Please use an image closer to square (between 2:3 and 3:2).`);
                    setIsLoading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                let maskSrc = null;
                try {
                    maskSrc = createMetalMaskFromImage(img);
                } catch (err) {
                    console.warn('Failed to generate metal mask:', err);
                }

                // Instead of setting graphic directly, set pending data and show modal
                setPendingGraphicData({
                    src,
                    name: file.name,
                    isUpload: true,
                    scale: 0.5,
                    fileType: fileName.split('.').pop(),
                    maskSrc
                });

                setIsLoading(false);
                setShowModal(true);
            };
            img.onerror = () => {
                setUploadError('Failed to load image. Please check the file.');
                setIsLoading(false);
            };
            img.src = src;

        } catch (error) {
            console.error(error);
            setUploadError('Error processing file.');
            setIsLoading(false);
        }
    };

    const handleConfirmUpload = () => {
        if (pendingGraphicData) {
            setGraphic(pendingGraphicData);
            setPendingGraphicData(null);
            setShowModal(false);
        }
    };

    const handleCancelUpload = () => {
        setPendingGraphicData(null);
        setShowModal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    const renderPdfFirstPage = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        // Disable worker to avoid `.mjs` MIME issues on some WP hosts/CDNs.
        // We're only rendering the first page for a preview, so main-thread rendering is acceptable.
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
        const page = await pdf.getPage(1);

        // Render to temporary canvas
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;
        return canvas.toDataURL('image/png');
    };

    const handleRemove = () => {
        setGraphic(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getSideName = () => activeTab === 'FRONT' ? 'FRONT' : 'BACK';
    const sideName = getSideName();

    const metallicGradient = selectedColor === 'white'
        ? 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)'
        : 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)';

    return (
        <div className="w-full h-full flex flex-col bg-white p-4 md:p-8 overflow-y-auto pb-32">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/bmp, image/svg+xml, application/pdf"
                className="hidden"
            />

            {/* Header / Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => setView('main')}
                    className="flex items-center text-[#002C5F] font-bold text-sm tracking-widest uppercase hover:text-brand-blue transition-colors group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {sideName}
                </button>
            </div>

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
                </div>
            )}

            {/* Main Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#002C5F] rounded-full animate-spin mb-4"></div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Processing...</span>
                </div>
            ) : graphicInput ? (
                // PREVIEW STATE (Keeping it simple for now, but cleaner)
                <div className="flex flex-col items-center w-full animate-fade-in-up">
                    <div className="w-full aspect-square max-w-[200px] border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center p-4 mb-6 relative overflow-hidden">
                        {graphicInput.maskSrc ? (
                            <div
                                className="w-full h-full"
                                style={{
                                    maskImage: `url(${graphicInput.maskSrc})`,
                                    WebkitMaskImage: `url(${graphicInput.maskSrc})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    background: metallicGradient,
                                    filter: 'contrast(1.1) brightness(1.1)',
                                    opacity: 0.95
                                }}
                            />
                        ) : (
                            <img
                                src={graphicInput.src}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                                style={{ filter: 'grayscale(100%) contrast(1.2) brightness(1.2)' }}
                            />
                        )}
                    </div>

                    {/* Scale Slider */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
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

                    <button
                        onClick={handleRemove}
                        className="text-xs font-bold text-red-500 underline hover:text-red-700 uppercase tracking-wider mb-2"
                    >
                        Remove Image
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">
                        Review your placement on the bottle preview to the left.
                    </p>
                </div>
            ) : (
                // INITIAL STATE (Matching Reference)
                <div className="flex flex-col w-full animate-fade-in-up">
                    {/* Upload Button */}
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full py-4 bg-white border-2 border-[#002C5F] text-[#002C5F] font-bold text-sm tracking-widest uppercase rounded hover:bg-gray-50 transition-colors mb-6 shadow-sm"
                    >
                        UPLOAD DESIGN
                    </button>

                    <p className="text-center text-xs text-gray-700 font-semibold mb-8 uppercase tracking-wide">
                        Accepted file types: PNG, JPG,SVG and PDF
                    </p>

                    {/* Icons Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {/* 1. Image Size */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 mb-2 flex items-center justify-center text-gray-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <span className="text-[10px] leading-tight text-gray-800 font-medium">
                                Image must be 300 px<br />(W or H)
                            </span>
                        </div>

                        {/* 2. No TM */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 mb-2 flex items-center justify-center text-gray-900 relative">
                                <span className="font-serif font-bold text-2xl">TM</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-0.5 bg-gray-900 rotate-45 transform origin-center"></div>
                                </div>
                            </div>
                            <span className="text-[10px] leading-tight text-gray-800 font-medium">
                                No trademark infringement
                            </span>
                        </div>

                        {/* 3. No Copyright */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 mb-2 flex items-center justify-center text-gray-900 relative">
                                <span className="font-sans font-bold text-3xl">©</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-0.5 bg-gray-900 rotate-45 transform origin-center"></div>
                                </div>
                            </div>
                            <span className="text-[10px] leading-tight text-gray-800 font-medium">
                                No copyright infringement
                            </span>
                        </div>

                        {/* 4. No Photos */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 mb-2 flex items-center justify-center text-gray-900 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-0.5 bg-gray-900 rotate-45 transform origin-center"></div>
                                </div>
                            </div>
                            <span className="text-[10px] leading-tight text-gray-800 font-medium">
                                No photos
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200 mb-6"></div>

                    {/* Instructions */}
                    <div className="mb-4 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 text-center">INSTRUCTIONS</h4>

                        <p className="text-xs text-gray-700 font-medium leading-relaxed text-left">
                            Orders containing offensive, inappropriate, or copyrighted content may be cancelled without further notice.
                        </p>

                        <p className="text-xs text-gray-700 font-medium leading-relaxed text-left">
                            Please verify your preview carefully: check for any unwanted lines or spots and crop them out.
                        </p>

                        <p className="text-xs text-gray-700 font-medium leading-relaxed text-left">
                            For best results, commence with a sketch on white paper using a thick dark marker. Keep it simple and take a photo in a well-lit area without shadows.
                        </p>

                        <p className="text-xs text-gray-700 font-medium leading-relaxed text-left">
                            Photographs will be converted to black and white, and results may vary. Proceed with high-contrast images for optimal engraving quality.
                        </p>
                    </div>

                </div>
            )}

            {/* Confirmation Modal */}
            <UploadConfirmationModal
                isOpen={showModal}
                onClose={handleCancelUpload}
                onConfirm={handleConfirmUpload}
            />
        </div>
    );
};

export default UploadView;
