import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';
import { api } from '@/lib/api';
export default async function SiteLayout({children}:{children:React.ReactNode}){let c:any={};try{c=await api('/content')}catch{}return <><SiteHeader brand={c.brandName||'LUMEN MEGA HOMES'}/><ScrollReveal/>{children}<SiteFooter content={c}/></>}