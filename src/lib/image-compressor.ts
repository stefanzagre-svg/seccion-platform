/**
 * High-performance client-side image compression utility for mobile & web.
 * Resizes camera roll / high-res photos to prevent storage & DB timeout issues.
 */
export function compressImageFile(
  file: File,
  maxDim = 1200,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    // Return SVG or tiny files (< 100KB) as-is
    if (file.type === "image/svg+xml" || file.size < 100 * 1024) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({ blob: file, dataUrl });
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image file for compression"));
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Scale dimensions down to maxDim if needed
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to initialize canvas 2D context"));
        return;
      }

      // Draw and scale image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert PNGs / HEIC / high-res formats to JPEG for 90% footprint reduction
      const outputMime = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed to produce blob"));
            return;
          }

          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Failed to read compressed image blob"));
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve({ blob, dataUrl });
          };
          reader.readAsDataURL(blob);
        },
        outputMime,
        quality
      );
    };

    img.src = objectUrl;
  });
}
