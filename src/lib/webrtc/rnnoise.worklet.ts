import rnnoiseWasm, { Rnnoise, RnnoiseContext } from 'rnnoise-wasm'

// https://github.com/jitsi/jitsi-meet/blob/master/react/features/stream-effects/rnnoise/RnnoiseProcessor.js

/* eslint-disable @typescript-eslint/no-explicit-any */
class RNNoiseProcessor extends AudioWorkletProcessor {
  wasm?: Rnnoise
  context!: RnnoiseContext

  inPtr!: number
  inBuf!: Float32Array
  outPtr!: number
  outBuf!: Float32Array

  frameSize = 480
  filled = 0

  constructor() {
    super()
    this.port.onmessage = async e => {
      this.wasm = await rnnoiseWasm({
        wasmBinary: e.data
      })
      this.context = this.wasm._rnnoise_create()

      this.inPtr = this.wasm._malloc(this.frameSize * 4)
      this.outPtr = this.wasm._malloc(this.frameSize * 4)
    }
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    if (this.wasm === undefined) return true
    if (
      inputs.length !== 1 ||
      outputs.length !== 1 ||
      inputs[0].length === 0 ||
      inputs[0][0] === undefined
    )
      return true
    let input = inputs[0][0]
    const output = outputs[0][0]

    while (input.length > 0) {
      const sz = Math.min(input.length, this.in_buf.length - this.filled)
      for (let i = 0; i < sz; i++)
        this.in_buf[this.filled + i] = input[i] * 2 ** 15
      this.filled += sz
      input = input.subarray(sz)

      if (this.filled === this.in_buf.length) {
        const score = this.wasm_exports.rnnoise_process_frame(
          this.handle,
          this.out_ptr,
          this.in_ptr
        )
        this.port.postMessage(score)
        this.filled = 0
      }
    }
    return true
  }
}
registerProcessor('rnnoise-processor', RNNoiseProcessor)
