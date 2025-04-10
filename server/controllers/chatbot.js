import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Lecture from '../models/Lecture.js';
import Courses from '../models/Courses.js';
import Resource from '../models/Resource.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const handleChatQuery = async (req, res) => {
    try {
        const { query, lectureContent } = req.body;

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Create a chat instance
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            },
        });

        // Prepare context and prompt
        const prompt = `
            Context: This is about a lecture with the following content:
            Title: ${lectureContent.title}
            Description: ${lectureContent.description}

            User Question: ${query}

            Please provide a helpful response based on the lecture content.
        `;

        try {
            // Generate response using chat
            const result = await chat.sendMessage(prompt);
            const response = await result.response;

            res.json({
                response: response.text(),
                status: 'success'
            });
        } catch (genAIError) {
            console.error('Gemini API Error:', genAIError);
            res.status(500).json({
                message: 'Error generating response',
                error: genAIError.message || 'Model not supported or unavailable',
            });
        }
    } catch (error) {
        console.error('Chatbot Controller Error:', error);
        res.status(500).json({
            message: 'Error processing chat query',
            error: error.message,
        });
    }
};

export const saveResponseAsResource = async (req, res) => {
    try {
        const { title, content, lectureId } = req.body;

        // Create PDF
        const doc = new PDFDocument();
        const timestamp = Date.now();
        const filename = `chatbot_response_${timestamp}.pdf`;
        const filepath = path.join('Uploads', filename);

        // Pipe PDF to file
        doc.pipe(fs.createWriteStream(filepath));

        // Add content to PDF
        doc.fontSize(16).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(content);

        // Finalize PDF
        doc.end();

        // Create resource entry
        const resource = await Resource.create({
            title,
            type: 'pdf',
            url: filepath,
            description: 'Chatbot response converted to PDF',
            lecture: lectureId,
            isUploadedFile: true
        });

        res.json({
            message: 'Response saved as resource successfully',
            resource
        });
    } catch (error) {
        console.error('Error saving response as resource:', error);
        res.status(500).json({
            message: 'Error saving response',
            error: error.message
        });
    }
};