import { IDEShell } from '@/components/IDEShell';

export const metadata = {
  title: 'VibeCaaS IDE - Collaborative Development Environment',
  description: 'Experience our collaborative IDE with real-time editing, AI assistance, and seamless deployment.',
};

export default function LaunchPage() {
  return <IDEShell />;
}