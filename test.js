// example.js

import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const api = "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"
const groq = createOpenAI({ 
  apiKey: api,
  baseURL: 'https://api.groq.com/openai/v1'
})

async function main() {
  const messages = [{ role: 'user', content: 'Hello' }]

  // Get a language model
  const model = groq('llama-3.1-70b-versatile')

  // Call the language model with the prompt
  const result = await generateText({
    model,
    messages,
    maxTokens: 1000,
    temperature: 0.5,
    topP: 1,
    frequencyPenalty: 1,
  })

  console.log(result.text)
}

main().catch(console.error)
