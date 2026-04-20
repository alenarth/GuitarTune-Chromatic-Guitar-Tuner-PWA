/**
 * YIN pitch detection algorithm.
 * Based on: "YIN, a fundamental frequency estimator for speech and music"
 * de Cheveigné & Kawahara, 2002.
 *
 * Returns the detected fundamental frequency in Hz, or -1 if none detected.
 */

const YIN_THRESHOLD = 0.15;

export function detectPitchYIN(buffer: Float32Array, sampleRate: number): number {
  const bufferSize = buffer.length;
  const halfSize = Math.floor(bufferSize / 2);

  // Step 1 & 2: Difference function
  const yinBuffer = new Float32Array(halfSize);
  yinBuffer[0] = 1;

  for (let tau = 1; tau < halfSize; tau++) {
    yinBuffer[tau] = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      yinBuffer[tau] += delta * delta;
    }
  }

  // Step 3: Cumulative mean normalized difference
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau];
    if (runningSum === 0) {
      yinBuffer[tau] = 1;
    } else {
      yinBuffer[tau] *= tau / runningSum;
    }
  }

  // Step 4: Absolute threshold — find first dip below threshold
  let tau = 2;
  while (tau < halfSize) {
    if (yinBuffer[tau] < YIN_THRESHOLD) {
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      break;
    }
    tau++;
  }

  if (tau === halfSize || yinBuffer[tau] >= YIN_THRESHOLD) {
    return -1; // No pitch detected
  }

  // Step 5: Parabolic interpolation for better accuracy
  const betterTau = parabolicInterpolation(yinBuffer, tau);
  return sampleRate / betterTau;
}

function parabolicInterpolation(array: Float32Array, x: number): number {
  if (x <= 0 || x >= array.length - 1) return x;
  const s0 = array[x - 1];
  const s1 = array[x];
  const s2 = array[x + 1];
  return x + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
}

/**
 * Autocorrelation-based pitch detection (fallback / verification).
 * Returns frequency in Hz or -1.
 */
export function detectPitchAutocorrelation(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);

  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01) return -1; // Signal too quiet

  let lastCorrelation = 1;
  let foundGoodCorrelation = false;
  const correlations: number[] = [];

  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;
    correlations[offset] = correlation;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      break;
    }
    lastCorrelation = correlation;
  }

  if (bestOffset === -1) return -1;
  return sampleRate / bestOffset;
}

/**
 * Calculate RMS (signal level) from a float buffer.
 * Returns value in range [0, 1].
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}
