import {Router} from 'express'; import {prisma} from '../db'; import {verifyPassword} from '../security'; import {clearSession,createSession,requireAuth} from '../auth';
const r=Router();
r.post('/login',async(req,res)=>{const {email,password}=req.body||{};if(typeof email!=='string'||typeof password!=='string')return res.status(400).json({message:'Invalid request'});const u=await prisma.adminUser.findUnique({where:{email:email.toLowerCase().trim()}});if(!u||!verifyPassword(password,u.passwordHash))return res.status(401).json({message:'Invalid credentials'});await createSession(res,u.id);res.json({id:u.id,email:u.email,name:u.name})});
r.post('/logout',async(req,res)=>{await clearSession(req,res);res.json({ok:true})});
r.get('/me',requireAuth,async(req,res)=>res.json({id:(req as any).admin.id,email:(req as any).admin.email,name:(req as any).admin.name})); export default r;
