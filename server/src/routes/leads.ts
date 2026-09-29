import {Router} from 'express'; import {z} from 'zod'; import {prisma} from '../db'; import {requireAuth} from '../auth';
const r=Router(); const schema=z.object({name:z.string().min(2),email:z.string().email(),phone:z.string().optional(),interest:z.string().optional(),message:z.string().optional(),source:z.string().optional()});
r.post('/',async(req,res)=>{const p=schema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid enquiry'});res.status(201).json(await prisma.lead.create({data:p.data}))});
r.get('/',requireAuth,async(_q,res)=>res.json(await prisma.lead.findMany({orderBy:{createdAt:'desc'},take:200})));
r.patch('/:id',requireAuth,async(req,res)=>{const status=z.enum(['NEW','CONTACTED','VIEWING','NEGOTIATION','CONVERTED','CLOSED']).safeParse(req.body?.status);if(!status.success)return res.status(400).json({message:'Invalid status'});res.json(await prisma.lead.update({where:{id:String(req.params.id)},data:{status:status.data}}))}); export default r;
