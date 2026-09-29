import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {getCurrentAdmin} from '@/lib/server-auth';
export const dynamic='force-dynamic';
export default async function DashboardLayout({children}:{children:React.ReactNode}){
	const store=await cookies();const token=store.get('cms_session')?.value;
	if(!token)redirect('/admin/login');
	const admin=await getCurrentAdmin(token);
	if(!admin)redirect('/admin/login');
	return <>{children}</>;
}