import { GrayImageF32N0F8 } from "./image-utils.js";
import { hilbertCurveGenerator, weightGenerator } from "./curve-utils.js";

export async function simpleErrorDiffusion(imageData) {
  return matrixErrorDiffusion(
    GrayImageF32N0F8.fromImageData(imageData).copy(),
    new GrayImageF32N0F8(new Float32Array([0, 1, 1, 0]), 2, 2),
    v => (v > 0.5 ? 1.0 : 0.0)
  ).toImageData();
}

export async function floydSteinberg(imageData) {
  return matrixErrorDiffusion(
    GrayImageF32N0F8.fromImageData(imageData).copy(),
    new GrayImageF32N0F8(new Float32Array([0, 0, 7, 1, 5, 3]), 3, 2),
    v => (v > 0.5 ? 1.0 : 0.0)
  ).toImageData();
}

export async function jjn(imageData) { // Jarvis-Judice-Ninke Diffusion
  return matrixErrorDiffusion(
    GrayImageF32N0F8.fromImageData(imageData).copy(),
    new GrayImageF32N0F8(
      new Float32Array([0, 0, 0, 7, 5, 3, 5, 7, 5, 3, 1, 3, 5, 3, 1]),
      5,
      3
    ),
    v => (v > 0.5 ? 1.0 : 0.0)
  ).toImageData();
}

export async function atkinson(imageData) {
  return matrixErrorDiffusion(
    GrayImageF32N0F8.fromImageData(imageData).copy(),
    new GrayImageF32N0F8(
      new Float32Array([0, 0, 1/8, 1/8, 1/8, 1/8, 1/8, 0, 0, 1/8, 0, 0]),
      4,
      3
    ),
    v => (v > 0.5 ? 1.0 : 0.0),
    {normalize: false}
  ).toImageData();
}

export async function riemersma(imageData) {
  return curveErrorDiffusion(
    GrayImageF32N0F8.fromImageData(imageData).copy(),
    hilbertCurveGenerator,
    weightGenerator(32, 1 / 8),
    v => (v > 0.5 ? 1.0 : 0.0)
  ).toImageData();
}

function curveErrorDiffusion(img, curve, weights, quantF) {
  const curveIt = curve(img.width, img.height);
  const errors = Array.from(weights, () => 0);
  for (const p of curveIt) {
    if (!img.isInBounds(p.x, p.y)) {
      continue;
    }
    const original = img.valueAt(p);
    const quantized = quantF(
      original + errors.reduce((sum, c, i) => sum + c * weights[i])
    );
    errors.pop();
    errors.unshift(original - quantized);
    img.setValueAt(p, quantized);
  }
  return img;
}

function matrixErrorDiffusion(img, diffusor, quantizeFunc, {normalize = true} = {}) {
  if(normalize) {
    diffusor.normalizeSelf();
  }
  for (const { x, y, pixel } of img.allPixels()) {
    const original = pixel[0];
    const quantized = quantizeFunc(original);
    pixel[0] = quantized;
    const error = original - quantized;
    for (const {
      x: diffX,
      y: diffY,
      pixel: diffPixel
    } of diffusor.allPixels()) {
      const offsetX = diffX - Math.floor((diffusor.width - 1) / 2);
      const offsetY = diffY;
      if (img.isInBounds(x + offsetX, y + offsetY)) {
        const pixel = img.pixelAt(x + offsetX, y + offsetY);
        pixel[0] = pixel[0] + error * diffPixel[0];
      }
    }
  }
  return img;
}
    
