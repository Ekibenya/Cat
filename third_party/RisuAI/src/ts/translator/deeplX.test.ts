import { describe, expect, it } from 'vitest'
import { normalizeDeepLXLanguage } from './deeplX'

describe('normalizeDeepLXLanguage', () => {
    it('maps FELINIA Chinese locales to the DeepLX language code', () => {
        expect(normalizeDeepLXLanguage('zh-CN')).toBe('ZH')
        expect(normalizeDeepLXLanguage('zh_Hant')).toBe('ZH')
    })

    it('normalizes ordinary source language tags', () => {
        expect(normalizeDeepLXLanguage('ko')).toBe('KO')
        expect(normalizeDeepLXLanguage('en-US')).toBe('EN')
    })
})
