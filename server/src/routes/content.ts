import {Router} from 'express';
import {z} from 'zod';
import {prisma} from '../db';
import {requireAuth} from '../auth';

const r=Router();
const teamSchema=z.array(z.object({photo:z.string(),name:z.string().min(1),role:z.string().min(1),note:z.string().optional(),lead:z.boolean().optional()})).default([]);
const statsSchema=z.array(z.tuple([z.string(),z.string()]));
const testimonialsSchema=z.array(z.object({quote:z.string().min(1),name:z.string().min(1),role:z.string().optional()}));

r.get('/',async(_q,res)=>res.json(await prisma.siteContent.findUnique({where:{id:'main'}})||{}));
r.put('/',requireAuth,async(req,res)=>{
	const b=req.body||{};
	const old=await prisma.siteContent.findUnique({where:{id:'main'}});
	const team=teamSchema.safeParse(b.team===undefined?(old?.team??[]):b.team);
	if(!team.success)return res.status(400).json({message:'Invalid team payload',issues:team.error.issues});
	const stats=statsSchema.safeParse(b.stats===undefined?(old?.stats??[]):b.stats);
	if(!stats.success)return res.status(400).json({message:'Invalid stats payload',issues:stats.error.issues});
	const testimonials=testimonialsSchema.safeParse(b.testimonials===undefined?(old?.testimonials??[]):b.testimonials);
	if(!testimonials.success)return res.status(400).json({message:'Invalid testimonials payload',issues:testimonials.error.issues});
	const data:any={brandName:String(b.brandName??old?.brandName??''),phone:String(b.phone??old?.phone??''),email:String(b.email??old?.email??''),address:String(b.address??old?.address??''),description:String(b.description??old?.description??''),hero:b.hero??old?.hero??{},about:b.about??old?.about??{},stats:stats.data,services:b.services??old?.services??[],testimonials:testimonials.data,footer:b.footer??old?.footer??{},team:team.data};
	res.json(await prisma.siteContent.upsert({where:{id:'main'},update:data,create:{id:'main',...data}}));
});

export default r;
