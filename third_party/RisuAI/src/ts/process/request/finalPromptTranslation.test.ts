import { describe, expect, it, vi } from 'vitest'
import { translateFinalPromptMessages } from './finalPromptTranslation'

describe('final prompt translation', () => {
    it('translates injected Han text after prompt assembly and preserves control blocks', async () => {
        const translate = vi.fn(async (text:string) => text
            .replaceAll('世界书', '월드북(世界書)')
            .replaceAll('玩家输入', '플레이어 입력')
            .replaceAll('句尾', '문장 끝에 ~了를 붙임'))
        const messages = await translateFinalPromptMessages([
            { role: 'system', content: '世界书\n<mvu_panel>◆心声|中文控制值</mvu_panel>\n玩家输入\n句尾' },
            { role: 'assistant', content: '이미 한국어입니다.' },
        ], translate)

        expect(messages[0].content).toBe('월드북\n<mvu_panel>◆心声|中文控制值</mvu_panel>\n플레이어 입력\n문장 끝에 ~어요를 붙임')
        expect(messages[1].content).toBe('이미 한국어입니다.')
        expect(translate).toHaveBeenCalledTimes(2)
    })
})
