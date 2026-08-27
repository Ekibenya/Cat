import type { StreamResponseChunk } from '../request'

function appendFragment(current:string, incoming:string):string {
    if(!incoming) return current
    if(incoming.length > current.length && incoming.startsWith(current)) return incoming
    return current + incoming
}

function contentText(content:any):string {
    if(typeof content === 'string') return content
    if(Array.isArray(content)){
        return content.map((part) => {
            if(typeof part === 'string') return part
            return part?.text ?? part?.content ?? ''
        }).join('')
    }
    if(content && typeof content === 'object') return content.text ?? content.content ?? ''
    return ''
}

function responseOutputText(data:any):string {
    if(typeof data?.output_text === 'string') return data.output_text
    const output = data?.output ?? data?.response?.output
    if(!Array.isArray(output)) return ''
    return output.flatMap((item:any) => item?.content ?? [])
        .map((item:any) => item?.text ?? item?.output_text ?? '')
        .join('')
}

export function normalizeOpenAICompatibleUrl(input:string, autofill = true):string {
    if(!autofill) return input
    try {
        const url = new URL(input)
        let path = url.pathname.replace(/\/+$/, '')
        if(!/\/(?:chat\/)?completions$/i.test(path) && !/\/responses$/i.test(path)){
            path = /\/v1$/i.test(path) ? `${path}/chat/completions` : `${path}/v1/chat/completions`
        }
        url.pathname = path
        return url.toString()
    }
    catch {
        const [base, query] = input.split('?', 2)
        let path = base.replace(/\/+$/, '')
        if(!/\/(?:chat\/)?completions$/i.test(path) && !/\/responses$/i.test(path)){
            path = /\/v1$/i.test(path) ? `${path}/chat/completions` : `${path}/v1/chat/completions`
        }
        return query ? `${path}?${query}` : path
    }
}

export function extractOpenAICompatibleText(data:any):string {
    if(data?.error) throw new Error(data.error.message ?? data.error.detail ?? JSON.stringify(data.error))
    const choice = data?.choices?.[0]
    const message = choice?.message ?? choice?.delta ?? {}
    let text = contentText(message.content ?? choice?.text ?? message.text)
    let reasoning = contentText(
        message.reasoning_content ?? message.reasoning ?? message.thinking ??
        choice?.reasoning_content ?? choice?.reasoning ?? choice?.thinking
    )
    if(!text && Array.isArray(data?.candidates)){
        const parts = data.candidates[0]?.content?.parts ?? []
        text = parts.filter((part:any) => !part?.thought).map((part:any) => contentText(part)).join('')
        reasoning = parts.filter((part:any) => part?.thought).map((part:any) => contentText(part)).join('')
    }
    text ||= responseOutputText(data)
    return reasoning ? `<Thoughts>\n${reasoning}\n</Thoughts>\n${text}` : text
}

export function createOpenAICompatibleStream():TransformStream<Uint8Array, StreamResponseChunk> {
    const decoder = new TextDecoder()
    let buffer = ''
    let finished = false
    let reasoning = ''
    const outputs:Record<string,string> = {}
    const toolCalls:Record<string,any> = {}

    function snapshot():StreamResponseChunk {
        const result:StreamResponseChunk = {}
        for(const [key, value] of Object.entries(outputs)){
            result[key] = reasoning && key === '0' ? `<Thoughts>\n${reasoning}\n</Thoughts>\n${value}` : value
        }
        if(Object.keys(toolCalls).length) result.__tool_calls = JSON.stringify(toolCalls)
        return result
    }

    function ingest(data:any):boolean {
        if(data?.error) throw new Error(data.error.message ?? data.error.detail ?? JSON.stringify(data.error))
        let changed = false
        if(data?.type === 'response.output_text.delta' && typeof data.delta === 'string'){
            outputs['0'] = appendFragment(outputs['0'] ?? '', data.delta)
            changed = true
        }
        const completedText = responseOutputText(data)
        if(completedText){
            outputs['0'] = appendFragment(outputs['0'] ?? '', completedText)
            changed = true
        }
        if(Array.isArray(data?.candidates)){
            const parts = data.candidates[0]?.content?.parts ?? []
            const visible = parts.filter((part:any) => !part?.thought).map((part:any) => contentText(part)).join('')
            const thoughts = parts.filter((part:any) => part?.thought).map((part:any) => contentText(part)).join('')
            if(visible){ outputs['0'] = appendFragment(outputs['0'] ?? '', visible); changed = true }
            if(thoughts){ reasoning = appendFragment(reasoning, thoughts); changed = true }
        }
        for(const choice of data?.choices ?? []){
            const index = String(choice?.index ?? 0)
            const delta = choice?.delta ?? choice?.message ?? {}
            const text = contentText(delta.content ?? delta.text ?? choice?.text)
            if(text){ outputs[index] = appendFragment(outputs[index] ?? '', text); changed = true }
            const thought = contentText(
                delta.reasoning_content ?? delta.reasoning ?? delta.thinking ??
                choice?.reasoning_content ?? choice?.reasoning ?? choice?.thinking
            )
            if(thought){ reasoning = appendFragment(reasoning, thought); changed = true }
            for(const call of delta?.tool_calls ?? []){
                const callIndex = String(call?.index ?? 0)
                toolCalls[callIndex] ??= {
                    id: call?.id ?? null,
                    type: 'function',
                    function: { name: null, arguments: '' }
                }
                if(call?.id) toolCalls[callIndex].id = call.id
                if(call?.function?.name) toolCalls[callIndex].function.name = call.function.name
                if(call?.function?.arguments){
                    toolCalls[callIndex].function.arguments = appendFragment(
                        toolCalls[callIndex].function.arguments,
                        call.function.arguments
                    )
                }
                changed = true
            }
        }
        return changed
    }

    function consumeLine(line:string, controller:TransformStreamDefaultController<StreamResponseChunk>):void {
        const trimmed = line.trim()
        if(!trimmed || trimmed.startsWith(':') || trimmed.startsWith('event:') || trimmed.startsWith('id:')) return
        let payload = trimmed
        if(/^data\s*:/i.test(payload)) payload = payload.replace(/^data\s*:\s*/i, '')
        else if(!payload.startsWith('{') && !payload.startsWith('[')) return
        if(payload === '[DONE]'){
            finished = true
            if(Object.keys(outputs).length || Object.keys(toolCalls).length) controller.enqueue(snapshot())
            return
        }
        if(ingest(JSON.parse(payload))) controller.enqueue(snapshot())
    }

    return new TransformStream<Uint8Array, StreamResponseChunk>({
        transform(chunk, controller){
            if(finished) return
            buffer += decoder.decode(chunk, { stream: true })
            const lines = buffer.split(/\r\n|\n|\r/g)
            buffer = lines.pop() ?? ''
            for(const line of lines){
                consumeLine(line, controller)
                if(finished) break
            }
        },
        flush(controller){
            if(finished) return
            buffer += decoder.decode()
            if(buffer.trim()) consumeLine(buffer, controller)
            if(!finished && (Object.keys(outputs).length || Object.keys(toolCalls).length)) controller.enqueue(snapshot())
        }
    })
}
