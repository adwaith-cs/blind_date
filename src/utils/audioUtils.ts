/**
 * Audio helpers for OrbitSentinel
 * - Unary TTS (gemini-3.8-flash-tts) returns full WAV base64
 * - Live API (gemini-3.8-live) uses 16kHz PCM input and 24kHz PCM output
 */

export function playBase64Wav(base64Data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Convert Float32Array from AudioContext to 16kHz 16-bit PCM little-endian base64 string
export function float32ToPcm16Base64(inputData: Float32Array): string {
  const buffer = new ArrayBuffer(inputData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < inputData.length; i++) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Queue and play raw 24kHz 16-bit PCM chunks from Live API
export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;

  constructor() {
    // 24kHz sample rate for gemini-3.8-live output
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx({ sampleRate: 24000 });
    }
  }

  public async playChunk(base64Chunk: string) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const binaryString = atob(base64Chunk);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.ctx.destination);

    const currentTime = this.ctx.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;
  }

  public stop() {
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  public close() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
