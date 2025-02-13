import cors from "cors";

import "dotenv/config";

import express from "express";

import GenerativeAI from "./generative-ai";

import { createRouteHandler } from "uploadthing/express";

import { uploadRouter } from "./router";

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

app.get('/api', (req, res) => {
  res.send('Express + TypeScript Server is running.');
});

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  }),
);

app.post("/api/chat", async (req, res) => {
    const prompt = req.body.prompt;
    const generativeAI = new GenerativeAI();
    const result = await generativeAI.generateText(prompt);
    res.json({ result });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});