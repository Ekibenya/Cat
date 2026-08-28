/** Split long Google Translate GET requests without cutting surrogate pairs. */
export function splitGoogleTranslationText(text:string, maxEncodedLength = 4800):string[] {
    if(!text) return ['']
    const chunks:string[] = []
    let current = ''
    const flush = () => {
        if(current){
            chunks.push(current)
            current = ''
        }
    }
    for(const char of text){
        const candidate = current + char
        if(current && encodeURIComponent(candidate).length > maxEncodedLength){
            flush()
        }
        current += char
        if(encodeURIComponent(current).length >= maxEncodedLength * 0.72 && /[\n。！？.!?]/.test(char)){
            flush()
        }
    }
    flush()
    return chunks
}
