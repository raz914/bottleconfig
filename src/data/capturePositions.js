// Shared capture positioning constants
// Used by BottlePreview.jsx (DOM capture) and canvasCapture.js (canvas capture)
// Edit these values once to affect both capture paths

// Desktop positioning values (used for capture mode on desktop)
export const DESKTOP_POSITIONS = {
    FRONT: {
        text: { top: '32.4%', left: '36%', right: '36%', bottom: '62%' },
        monogram: { top: '29%', left: '33%', right: '33%', bottom: '58%' },
        graphic: { top: '33%', left: '36%', right: '36%', bottom: '62%' },
        boundary: { top: '32.5%', left: '35%', right: '34%', bottom: '61%' },
    },
    BACK: {
        text: { top: '39%', left: '36%', right: '36%', bottom: '31%' },
        textVertical: { top: '40%', left: '36%', right: '36%', bottom: '25%' },
        monogram: { top: '28%', left: '26%', right: '26%', bottom: '26%' },
        graphic: { top: '33%', left: '36%', right: '36%', bottom: '31%' },
        boundary: { top: '40.5%', left: '35.5%', right: '36%', bottom: '31%' },
        boundaryVertical: { top: '39%', left: '35.5%', right: '36%', bottom: '25%' },
    }
};

// Mobile positioning values (used for capture mode on iOS/mobile)
export const MOBILE_POSITIONS = {
    FRONT: {
        text: { top: '32.4%', left: '36%', right: '36%', bottom: '62%' },
        monogram: { top: '28%', left: '33%', right: '33%', bottom: '57%' },
        graphic: { top: '27.5%', left: '36%', right: '36%', bottom: '56.6%' },
        boundary: { top: '32.5%', left: '35%', right: '34%', bottom: '61%' },
    },
    BACK: {
        text: { top: '38%', left: '36%', right: '36%', bottom: '31%' },
        textVertical: { top: '40.5%', left: '38%', right: '38%', bottom: '27%' },
        monogram: { top: '30%', left: '26%', right: '26%', bottom: '24%' },
        graphic: { top: '33%', left: '22%', right: '22%', bottom: '31%' },
        boundary: { top: '39.5%', left: '36%', right: '36%', bottom: '31%' },
        boundaryVertical: { top: '38%', left: '36%', right: '36%', bottom: '21%' },
    }
};

// Graphic max size percentages
export const GRAPHIC_MAX_SIZE = {
    mobile: {
        FRONT: 0.38,  // ~20% larger (was 0.32)
        BACK: 0.54,   // ~20% larger (was 0.45)
    },
    test: {
        FRONT: 0.24,  // ~20% larger (was 0.20)
        BACK: 0.48,   // ~20% larger (was 0.40)
    },
    desktop: {
        FRONT: 0.78,  // ~20% larger (was 0.65)
        BACK: 0.90,   // ~20% larger (was 0.75)
    }
};
