import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { readFileSync } from "fs";
import "dotenv/config";

class GenerativeAI {
    private chat: any | null;
    private generativeAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        this.generativeAI = new GoogleGenerativeAI(apiKey);
        this.model = this.generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.chat = this.model.startChat({ history: [] });
    }
    
    async generateText(prompt: string): Promise<string> {
        if (!this.chat) {
            throw new Error("Chat is not initialized");
        }
        const result = await this.chat.sendMessage(prompt);
        if (!result) {
            throw new Error("Failed to generate content");
        }
        console.log(result.response.text().trim());
        return result.response.text().trim();
    }

    async initializeKnowledgeBase(): Promise<void> {
        let getData;
        let initializerPrompt;

        try {
            getData = JSON.parse(readFileSync('./API/GenAI/knowledge_clean.json', 'utf-8'));
            initializerPrompt = JSON.parse(readFileSync('./API/GenAI/initializer.json', 'utf-8'));
        } catch (error) {
            console.warn("Data or initializer prompt not found, initializing chat without them.");
            if (this.model) {
                this.chat = this.model.startChat({ history: [] });
            }
            return;
        }

        const trainData = [];
        trainData.push(getData.slice(0, Math.floor(0.5 * getData.length)));
        trainData.push(getData.slice(Math.floor(0.5 * getData.length)));
        if (this.model) {
            this.chat = this.model.startChat({ history: [] });

            for(let i = 0; i < 2; i++){
                const key = Object.keys(initializerPrompt[i])[0];
                await this.chat.sendMessage(initializerPrompt[i][key].replace('{}', JSON.stringify(trainData[i])));
            }
        }
        console.log('Generative AI initialized');
    }
}

export default GenerativeAI;