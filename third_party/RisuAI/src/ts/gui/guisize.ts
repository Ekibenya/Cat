import { writable } from "svelte/store"

// Headless compatibility only. Felinia owns every visual size and layout rule.
export const textAreaSize = writable(0)
export const sideBarSize = writable(0)
export const textAreaTextSize = writable(0)

export function updateGuisize() {}

export function guiSizeText() {
    return "Default"
}
