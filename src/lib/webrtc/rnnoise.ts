import rnnNoiseWorklet from './rnnoise.worklet.ts'

const loadRnnoise = async (context: AudioContext) => {
  try {
    context.audioWorklet.addModule(rnnNoiseWorklet)
  } catch (e) {
    console.error(e)
  }
}
