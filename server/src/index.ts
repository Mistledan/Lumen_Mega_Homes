import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import cookieParser from 'cookie-parser';
import auth from './routes/auth'; import content from './routes/content'; import properties from './routes/properties'; import estates from './routes/estates'; import leads from './routes/leads'; import posts from './routes/posts'; import {prisma} from './db'; import {rateLimit} from './rateLimit';
const app=express(); app.set('trust proxy',1); app.use(helmet()); app.use(cors({origin:process.env.WEB_ORIGIN||'http://localhost:3002',credentials:true})); app.use(express.json({limit:'1mb'})); app.use(cookieParser());
app.get('/health',(_req,res)=>res.json({ok:true})); app.get('/ready',async(_req,res)=>{try{await prisma.$queryRaw`SELECT 1`;res.json({ok:true})}catch{res.status(503).json({ok:false})}});
app.use('/api/v1/auth/login',rateLimit(10,15*60*1000)); app.use('/api/v1/leads',rateLimit(30,10*60*1000)); app.use('/api/v1/auth',auth);app.use('/api/v1/content',content);app.use('/api/v1/properties',properties);app.use('/api/v1/estates',estates);app.use('/api/v1/leads',leads);app.use('/api/v1/posts',posts);app.use((err:any,_req:any,res:any,_next:any)=>{console.error(err);res.status(500).json({message:'Internal server error'})});
const port=Number(process.env.API_PORT||5000);app.listen(port,()=>console.log(`API listening on ${port}`));
