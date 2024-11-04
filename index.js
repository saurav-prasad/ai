import express from "express"
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import cors from "cors"
import { streamText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { config } from "dotenv";
config()

const port = process.env.PORT || 5000
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


app.post('/generatetext', async (req, res) => {
    try {
        console.log(req.body)
        const messages = [{ role: 'user', content: `${req.body.message}. Explain in only one paragraph and keep it short` }]

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
        res.status(500).send({ error })
    }
})

app.get('/chatstreamtext2', async (req, res) => {
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

app.use('/chatstreamtext', async (req, res) => {
    try {
        const result = await streamText({
            model: groq2('llama-3.1-70b-versatile'),
            prompt: 'What is love?  explain in only one paragraph',
        });

        // Set headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // Flush the headers to establish SSE connection

        // Stream data to the client
        for await (const textPart of result.textStream) {
            // Send each chunk as a message to the client
            res.write(`data: ${textPart}\n\n`);
        }

        // End the stream once done
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.log('Error:', error);
        res.write('data: Error occurred\n\n');
        res.end();
    }
});

app.listen(port, (req, res) => {
    console.log(process.env.PORT)
    console.log("App is listening at port", port)
})