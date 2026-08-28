import type { OpenAIChat } from '../index.svelte'

const controlBlock = /(<mvu_panel>[\s\S]*?<\/mvu_panel>)/gi
const hanText = /[\u3400-\u9fff]/
const parentheticalHanja = /\s*[（(][\p{Script=Han}·・\s]+[）)]/gu
const untranslatedChineseParticles = new Map([
    ['~了', '~어요'],
])

function cleanTranslatedKorean(text:string):string {
    let cleaned = text.replace(parentheticalHanja, '')
    for(const [source, target] of untranslatedChineseParticles){
        cleaned = cleaned.replaceAll(source, target)
    }
    return cleaned
}

export async function translateFinalPromptMessages(
    messages:OpenAIChat[],
    translate:(text:string) => Promise<string>,
):Promise<OpenAIChat[]> {
    const translated:OpenAIChat[] = []
    for(const message of messages){
        if(typeof message.content !== 'string' || !hanText.test(message.content)){
            translated.push(message)
            continue
        }
        const parts = message.content.split(controlBlock)
        for(let index = 0; index < parts.length; index += 2){
            if(parts[index] && hanText.test(parts[index])){
                parts[index] = cleanTranslatedKorean(await translate(parts[index]))
            }
        }
        translated.push({ ...message, content: parts.join('') })
    }
    return translated
}
