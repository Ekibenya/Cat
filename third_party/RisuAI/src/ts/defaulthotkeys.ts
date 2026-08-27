export interface Hotkey {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
}

export const defaultHotkeys: Hotkey[] = [];
