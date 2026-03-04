declare module 'soundtouchjs' {
  export class PitchShifter {
    constructor(
      context: AudioContext,
      buffer: AudioBuffer,
      bufferSize: number,
      onEnd?: () => void
    );
    set pitchSemitones(semitones: number);
    set pitch(pitch: number);
    set tempo(tempo: number);
    set rate(rate: number);
    set percentagePlayed(perc: number);
    get percentagePlayed(): number;
    get timePlayed(): number;
    get duration(): number;
    get node(): ScriptProcessorNode;
    connect(node: AudioNode): void;
    disconnect(): void;
    on(eventName: string, cb: (detail: unknown) => void): void;
    off(eventName?: string): void;
  }

  export class SoundTouch {
    pitchSemitones: number;
    pitch: number;
    tempo: number;
    rate: number;
  }

  export class SimpleFilter {
    constructor(source: unknown, soundTouch: SoundTouch, onEnd?: () => void);
    sourcePosition: number;
    extract(target: Float32Array, numFrames: number): number;
  }

  export class WebAudioBufferSource {
    constructor(buffer: AudioBuffer);
    position: number;
    extract(target: Float32Array, numFrames: number, position: number): number;
  }

  export function getWebAudioNode(
    context: AudioContext,
    filter: SimpleFilter,
    sourcePositionCallback?: (position: number) => void,
    bufferSize?: number
  ): ScriptProcessorNode;
}
