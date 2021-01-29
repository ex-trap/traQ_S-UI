interface AudioWorkletProcessor {
  readonly port: MessagePort
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Map<string, Float32Array>
  ): void
}

declare const AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor
}

declare function registerProcessor<T extends AudioWorkletProcessor>(
  name: string,
  cls: T
): void
