import { redirect } from 'next/navigation'

// The public login page is no longer needed (app is fully anonymous).
// Admin access is handled separately through Supabase Studio.
export default function LoginPage() {
  redirect('/')
}
