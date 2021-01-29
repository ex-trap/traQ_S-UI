declare module 'rnnoise-wasm' {
  import 'emscripten'

  const RnnoiseContextSymbol: unique symbol
  export type RnnoiseContext = {
    [RnnoiseContextSymbol]: typeof RnnoiseContextSymbol
  }

  export interface Rnnoise extends EmscriptenModule {
    // ___wasm_call_ctors()
    // _rnnoise_init()
    _rnnoise_create(): RnnoiseContext
    _rnnoise_destroy(context: RnnoiseContext): void
    _rnnoise_process_frame(
      context: RnnoiseContext,
      output: number,
      input: number
    ): number
  }

  const createModule: EmscriptenModuleFactory<Rnnoise>
  export default createModule
}
