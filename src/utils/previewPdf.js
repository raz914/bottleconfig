const textEncoder = new TextEncoder();

const stringToBytes = (value) => textEncoder.encode(value);

const mergeBytes = (chunks, totalLength) => {
    const out = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach((chunk) => {
        out.set(chunk, offset);
        offset += chunk.length;
    });
    return out;
};

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const dataUrlToJpegBytes = async (dataUrl) => {
    const img = await loadImage(dataUrl);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 1);
    const base64 = jpegDataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return { width, height, bytes };
};

const buildPdfBytes = (pages) => {
    const chunks = [];
    const objectOffsets = {};
    let totalLength = 0;

    const pushBytes = (bytes) => {
        chunks.push(bytes);
        totalLength += bytes.length;
    };

    const pushString = (value) => {
        pushBytes(stringToBytes(value));
    };

    const startObject = (objectNumber) => {
        objectOffsets[objectNumber] = totalLength;
        pushString(`${objectNumber} 0 obj\n`);
    };

    const endObject = () => {
        pushString('endobj\n');
    };

    pushString('%PDF-1.4\n');

    const firstPageObj = 3;
    const objectsPerPage = 3; // page, content, image
    const maxObjectNumber = 2 + (pages.length * objectsPerPage);

    startObject(1);
    pushString('<< /Type /Catalog /Pages 2 0 R >>\n');
    endObject();

    const kids = pages.map((_, index) => `${firstPageObj + (index * objectsPerPage)} 0 R`).join(' ');
    startObject(2);
    pushString(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>\n`);
    endObject();

    pages.forEach((page, index) => {
        const pageObjectNumber = firstPageObj + (index * objectsPerPage);
        const contentObjectNumber = pageObjectNumber + 1;
        const imageObjectNumber = pageObjectNumber + 2;
        const imageName = `Im${index + 1}`;

        startObject(pageObjectNumber);
        pushString(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
            `/Resources << /XObject << /${imageName} ${imageObjectNumber} 0 R >> >> ` +
            `/Contents ${contentObjectNumber} 0 R >>\n`
        );
        endObject();

        const contentStream = `q\n${page.width} 0 0 ${page.height} 0 0 cm\n/${imageName} Do\nQ\n`;
        const contentBytes = stringToBytes(contentStream);

        startObject(contentObjectNumber);
        pushString(`<< /Length ${contentBytes.length} >>\nstream\n`);
        pushBytes(contentBytes);
        pushString('endstream\n');
        endObject();

        startObject(imageObjectNumber);
        pushString(
            `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} ` +
            '/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ' +
            `/Length ${page.bytes.length} >>\nstream\n`
        );
        pushBytes(page.bytes);
        pushString('\nendstream\n');
        endObject();
    });

    const xrefOffset = totalLength;
    pushString(`xref\n0 ${maxObjectNumber + 1}\n`);
    pushString('0000000000 65535 f \n');
    for (let i = 1; i <= maxObjectNumber; i += 1) {
        const offset = objectOffsets[i] || 0;
        pushString(`${String(offset).padStart(10, '0')} 00000 n \n`);
    }
    pushString(`trailer\n<< /Size ${maxObjectNumber + 1} /Root 1 0 R >>\n`);
    pushString(`startxref\n${xrefOffset}\n%%EOF`);

    return mergeBytes(chunks, totalLength);
};

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

export const createPreviewPdfDataUrl = async (frontImageDataUrl, backImageDataUrl) => {
    if (!frontImageDataUrl || !backImageDataUrl) {
        throw new Error('Both front and back preview images are required for PDF generation.');
    }

    const [frontPage, backPage] = await Promise.all([
        dataUrlToJpegBytes(frontImageDataUrl),
        dataUrlToJpegBytes(backImageDataUrl)
    ]);

    const pdfBytes = buildPdfBytes([frontPage, backPage]);
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    return blobToDataUrl(pdfBlob);
};

export const downloadDataUrl = (dataUrl, filename) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
};
