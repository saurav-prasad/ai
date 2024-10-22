import express, { text } from "express"
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import cors from "cors"
import { streamText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { decode } from "openai/internal/qs/utils.mjs";

const port = 5200
const app = express()
const api = "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"


const groq = createOpenAI({
    apiKey: api,
    baseURL: 'https://api.groq.com/openai/v1'
})

const groq2 = createGroq({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: api,
});

app.use(cors())
app.use(express.json())


app.use('/chatgeneratetext', async (req, res) => {
    try {

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
        res.send({ result: result.text })
    } catch (error) {
        console.log(error)
        res.send({ error })
    }
})

app.use('/chatstreamtext', async (req, res) => {
    try {

        const result = await streamText({
            model: groq2('llama-3.1-70b-versatile'),
            prompt: 'What is love?',
        });
        let fullText = '';

        // Iterate through the stream and accumulate text
        for await (const textPart of result.textStream) {
            fullText += textPart;  // Append each part to the full text
        }

        // Clean up the text by removing extra line breaks and fixing word splits
        fullText = fullText
            .replace(/\n+/g, ' ')  // Remove extra line breaks
            .replace(/([a-zA-Z])-\n([a-zA-Z])/g, '$1$2')  // Fix hyphenated word breaks
            .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
            .trim();  // Remove leading and trailing spaces

        console.log('Cleaned text:', fullText);
        res.send({ text: fullText });  // Send the cleaned-up text

    } catch (error) {
        console.log(error)
        res.send({ error })
    }
})

app.listen(port, (req, res) => {
    console.log("App is listening at port", port)
})