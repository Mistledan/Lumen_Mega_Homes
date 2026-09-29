import crypto from 'node:crypto';
export function hashPassword(password:string){return crypto.scryptSync(password,process.env.PASSWORD_PEPPER||'change-me',32).toString('hex')}
export function verifyPassword(password:string,hash:string){const a=Buffer.from(hash,'hex');const b=Buffer.from(hashPassword(password),'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function randomToken(){return crypto.randomBytes(32).toString('hex')}
export function hashToken(token:string){return crypto.createHash('sha256').update(token).digest('hex')}
