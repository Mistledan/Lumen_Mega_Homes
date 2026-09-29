import {Request,Response,NextFunction} from 'express';
const buckets=new Map<string,{count:number;reset:number}>();
export function rateLimit(limit:number,windowMs:number){return (req:Request,res:Response,next:NextFunction)=>{const key=`${req.ip||'unknown'}:${req.path}`;const now=Date.now();const current=buckets.get(key);if(!current||current.reset<=now){buckets.set(key,{count:1,reset:now+windowMs});return next()}if(current.count>=limit)return res.status(429).json({message:'Too many requests. Please try again later.'});current.count++;next()}}
