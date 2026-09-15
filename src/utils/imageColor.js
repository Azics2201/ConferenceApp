import { Platform } from 'react-native';

// Computes a representative hex color for an image by downscaling it onto a
// tiny canvas and averaging the remaining pixels. Web only, deliberately:
// getting real pixel data on the iOS/Android app needs either a native
// color-extraction module (which would require a custom Expo dev build,
// breaking this app's "works in Expo Go" setup — see CLAUDE.md) or
// expo-gl-based texture sampling, which is a lot of unverified surface for
// a prototype feature. On native, admins pick the badge color by hand
// instead — see SponsorEditorModal.
export async function averageColorFromImage(dataUri) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 16) continue; // skip near-transparent pixels
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count === 0) return resolve(null);
        const toHex = (v) => Math.round(v / count).toString(16).padStart(2, '0');
        resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUri;
  });
}
