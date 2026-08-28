import { describe, expect, it } from 'vitest'
import { splitGoogleTranslationText } from './googleChunks'

describe('Google translation request chunks', () => {
    it('keeps every request URL segment bounded and lossless', () => {
        const source = ('第一段。\n第二段包含 emoji 🐈。\n').repeat(500)
        const chunks = splitGoogleTranslationText(source, 4800)

        expect(chunks.length).toBeGreaterThan(1)
        expect(chunks.join('')).toBe(source)
        expect(chunks.every((chunk) => encodeURIComponent(chunk).length <= 4800)).toBe(true)
        expect(chunks.every((chunk) => !/[\uD800-\uDBFF]$/.test(chunk))).toBe(true)
    })

    it('does not split short text', () => {
        expect(splitGoogleTranslationText('你好。')).toEqual(['你好。'])
    })
})
