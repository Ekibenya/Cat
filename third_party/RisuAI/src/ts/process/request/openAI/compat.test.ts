import { describe, expect, it } from 'vitest'
import {
    createOpenAICompatibleStream,
    extractOpenAICompatibleText,
    normalizeOpenAICompatibleUrl,
} from './compat'

async function collect(parts:string[]):Promise<string[]> {
    const stream = createOpenAICompatibleStream()
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()
    const reads = (async () => {
        const values:string[] = []
        while(true){
            const { done, value } = await reader.read()
            if(done) return values
            values.push(value?.['0'] ?? '')
        }
    })()
    for(const part of parts) await writer.write(new TextEncoder().encode(part))
    await writer.close()
    return reads
}

describe('OpenAI-compatible browser transport', () => {
    it('normalizes base URLs without damaging query strings', () => {
        expect(normalizeOpenAICompatibleUrl('https://api.example/v1')).toBe('https://api.example/v1/chat/completions')
        expect(normalizeOpenAICompatibleUrl('https://api.example/v1/chat/completions?key=x')).toBe('https://api.example/v1/chat/completions?key=x')
        expect(normalizeOpenAICompatibleUrl('https://api.example/gateway')).toBe('https://api.example/gateway/v1/chat/completions')
    })

    it('parses split SSE chunks with and without a space after data', async () => {
        const values = await collect([
            'data:{"choices":[{"index":0,"delta":{"content":"안"}}]}\n',
            'data: {"choices":[{"index":0,"delta":{"content":"녕"}}]}\n\n',
            'data: [DONE]\n\n',
        ])
        expect(values.at(-1)).toBe('안녕')
    })

    it('accepts a JSON response even when streaming was requested', async () => {
        const values = await collect(['{"choices":[{"message":{"content":"정상 응답"}}]}'])
        expect(values.at(-1)).toBe('정상 응답')
    })

    it('extracts reasoning variants', () => {
        expect(extractOpenAICompatibleText({ choices: [{ message: { content: '답변', reasoning: '생각' } }] }))
            .toBe('<Thoughts>\n생각\n</Thoughts>\n답변')
    })
})
