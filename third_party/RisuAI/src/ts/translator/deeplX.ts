export function normalizeDeepLXLanguage(language:string):string {
    const value = String(language || '').replaceAll('_', '-').toUpperCase()
    if(value === 'ZH-CN' || value === 'ZH-SG' || value === 'ZH-HANS') return 'ZH'
    if(value === 'ZH-TW' || value === 'ZH-HK' || value === 'ZH-HANT') return 'ZH'
    return value.split('-')[0]
}
