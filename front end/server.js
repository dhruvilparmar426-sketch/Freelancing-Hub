import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
app.use(express.json({limit:'1mb'}));
app.use(express.static(__dirname));
const apiKey=process.env.GEMINI_API_KEY;
const ai=apiKey?new GoogleGenAI({apiKey}):null;
app.post('/api/chat',async(req,res)=>{
  try{
    if(!ai)return res.status(503).json({error:'Gemini is not configured yet. Add GEMINI_API_KEY to your .env file and restart the server.'});
    const message=String(req.body?.message||'').trim();
    if(!message)return res.status(400).json({error:'Please enter a message.'});
    if(message.length>5000)return res.status(413).json({error:'Message is too long. Please keep it under 5,000 characters.'});
    const history=Array.isArray(req.body?.history)?req.body.history.slice(-12):[];
    const contents=[];
    for(const item of history){if(!item||!['user','model'].includes(item.role)||typeof item.text!=='string')continue;contents.push({role:item.role,parts:[{text:item.text.slice(0,5000)}]});}
    contents.push({role:'user',parts:[{text:message}]});
    const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-2.5-flash',contents,config:{systemInstruction:'You are the helpful AI assistant for Freelancing Hub, a freelance services marketplace. Explain how to browse categories, compare service packages, and use the website. Be friendly, concise, and honest. Do not claim to see live listings, account data, orders, or payments unless that information is provided in the conversation. If asked about a listing price, say prices should be checked on the product page. You can communicate in English, Hindi, or Gujarati based on the user message.'}});
    res.json({reply:response.text||'Sorry, I could not prepare a response. Please try again.'});
  }catch(err){console.error('Gemini request failed:',err?.message||err);res.status(502).json({error:'Gemini request failed. Check your API key, model access, network, and Google AI quota.'});}
});
const port=Number(process.env.PORT||3000);app.listen(port,()=>console.log(`Freelancing Hub is running at http://localhost:${port}`));
