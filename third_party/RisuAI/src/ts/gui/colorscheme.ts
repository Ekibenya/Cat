import { writable } from 'svelte/store';

export interface ColorScheme {
  bgcolor: string;
  darkbg: string;
  borderc: string;
  selected: string;
  draculared: string;
  textcolor: string;
  textcolor2: string;
  darkBorderc: string;
  darkbutton: string;
  type: 'light' | 'dark';
}

export const defaultColorScheme: ColorScheme = {
  bgcolor: '#282a36',
  darkbg: '#21222c',
  borderc: '#6272a4',
  selected: '#44475a',
  draculared: '#ff5555',
  textcolor: '#f8f8f2',
  textcolor2: '#64748b',
  darkBorderc: '#4b5563',
  darkbutton: '#374151',
  type: 'dark',
};

export const ColorSchemeTypeStore = writable<'dark' | 'light'>('dark');
export const colorSchemePresets = { default: defaultColorScheme };
export const colorSchemeList = ['default'];
export function changeColorScheme(_name?: string) {}
export function updateCustomColorScheme() {}
export function updateColorScheme() {}
export function changeColorSchemeType(type: 'light' | 'dark') { ColorSchemeTypeStore.set(type); }
export function updateTextThemeAndCSS() {}
