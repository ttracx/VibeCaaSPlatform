import dynamic from 'next/dynamic';

// Avoid SSR issues for components using window/WebSocket
const DomainConnect = dynamic(() => import('@/components/DomainConnect'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Domain Connect...</p>
      </div>
    </div>
  )
});

export default function DomainConnectPage() {
  return <DomainConnect />;
}
