import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          🎵 VibeCaaS
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Multi-Agent AI Development Platform
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Watch AI agents plan, code, test, and deploy your applications in real-time. 
          Experience the future of development with our intelligent orchestration system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg"
          >
            Open Dashboard
          </Link>
          <Link 
            href="/demo" 
            className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-lg"
          >
            View Demo
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Agents</h3>
            <p className="text-gray-600">Six specialized agents work together to build your applications</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Deploy</h3>
            <p className="text-gray-600">Deploy to custom URLs with automatic SSL and scaling</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Usage Billing</h3>
            <p className="text-gray-600">Pay only for what you use with transparent pricing</p>
          </div>
        </div>
      </div>
    </main>
  );
}
