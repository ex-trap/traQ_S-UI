import { Theme } from '@/types/theme'
import { lightTheme } from './default'
import { ThemeType } from '.'

export interface S {
  type: ThemeType
  isOsDarkTheme: boolean
  custom: Theme
}

export const state: S = {
  type: 'auto',
  isOsDarkTheme: false,
  custom: lightTheme
}
