import { ChannelId } from '@/types/entity-ids'
import { Theme } from '@/types/theme'

export interface S {
  loaded: boolean
  componentLoaded: boolean
  theme: Theme
}

export const state: S = {
  loaded: false,
  componentLoaded: false,
  theme: {
    accent: {
      primary: '#005BAC',
      notification: '#F2994A',
      online: '#28F0E4',
      error: '#F26451'
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F6F7F9',
      tertiary: '#ECEFF3',
      secondarySub: '#FBFCFE'
    },
    ui: {
      primary: '#525E67',
      secondary: '#828E96',
      tertiary: '#CED6DB'
    },
    text: {
      primary: '#333333',
      secondary: '#79797A'
    }
  }
}
