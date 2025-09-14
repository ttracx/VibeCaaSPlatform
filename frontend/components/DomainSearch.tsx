'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Search, 
  Globe, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  ExternalLink,
  ShoppingCart,
  Link,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DomainPricing {
  year: number;
  price_cents: number;
  currency: string;
  years_allowed: number[];
}

interface DomainSearchResult {
  domain: string;
  available: boolean;
  premium: boolean;
  pricing?: DomainPricing;
  years_allowed: number[];
}

interface DomainSearchResponse {
  ok: boolean;
  data: DomainSearchResult[];
  total: number;
  query: string;
  tlds: string[];
  error?: {
    code: string;
    message: string;
    hint: string;
  };
}

const DomainSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedTlds, setSelectedTlds] = useState(['com', 'ai', 'dev', 'io', 'co']);
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const popularTlds = [
    { id: 'com', name: '.com', popular: true },
    { id: 'ai', name: '.ai', popular: true },
    { id: 'dev', name: '.dev', popular: true },
    { id: 'io', name: '.io', popular: true },
    { id: 'co', name: '.co', popular: true },
    { id: 'app', name: '.app', popular: false },
    { id: 'tech', name: '.tech', popular: false },
    { id: 'online', name: '.online', popular: false },
    { id: 'site', name: '.site', popular: false },
    { id: 'store', name: '.store', popular: false }
  ];

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        tlds: selectedTlds.join(','),
        limit: '20'
      });

      const response = await fetch(`/api/v1/domains/search?${params}`);
      const data: DomainSearchResponse = await response.json();

      if (data.ok) {
        setResults(data.data);
      } else {
        setError(data.error?.message || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search domains');
      console.error('Domain search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTldToggle = (tld: string) => {
    setSelectedTlds(prev => 
      prev.includes(tld) 
        ? prev.filter(t => t !== tld)
        : [...prev, tld]
    );
  };

  const handlePurchase = (domain: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/domains/checkout?domain=${domain}`);
      window.location.href = `/signin?next=${returnUrl}`;
      return;
    }
    
    // Redirect to checkout
    window.location.href = `/domains/checkout?domain=${domain}`;
  };

  const handleConnect = (domain: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/domains/${domain}/connect`);
      window.location.href = `/signin?next=${returnUrl}`;
      return;
    }
    
    // Redirect to connect page
    window.location.href = `/domains/${domain}/connect`;
  };

  const formatPrice = (priceCents: number, currency: string) => {
    const price = priceCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const getAvailabilityIcon = (available: boolean, premium: boolean) => {
    if (premium) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return available 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getAvailabilityText = (available: boolean, premium: boolean) => {
    if (premium) return 'Premium';
    return available ? 'Available' : 'Taken';
  };

  const getAvailabilityColor = (available: boolean, premium: boolean) => {
    if (premium) return 'bg-yellow-100 text-yellow-800';
    return available 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Domain
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Search for available domains and connect them to your VibeCaaS apps
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Input */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter your domain name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* TLD Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose TLDs</h3>
              <div className="flex flex-wrap gap-2">
                {popularTlds.map((tld) => (
                  <button
                    key={tld.id}
                    onClick={() => handleTldToggle(tld.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedTlds.includes(tld.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {tld.name}
                    {tld.popular && (
                      <span className="ml-1 text-xs">★</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results ({results.length})
            </h2>
            <div className="text-sm text-gray-600">
              Query: "{query}" • TLDs: {selectedTlds.join(', ')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <Card key={result.domain} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Domain Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-lg font-semibold text-gray-900">
                          {result.domain}
                        </span>
                      </div>
                      <Badge className={getAvailabilityColor(result.available, result.premium)}>
                        {getAvailabilityIcon(result.available, result.premium)}
                        <span className="ml-1">
                          {getAvailabilityText(result.available, result.premium)}
                        </span>
                      </Badge>
                    </div>

                    {/* Pricing */}
                    {result.pricing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Price (1 year)</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(result.pricing.price_cents, result.pricing.currency)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Available for {result.pricing.years_allowed.join(', ')} years
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {result.available && !result.premium ? (
                        <>
                          <Button
                            onClick={() => handlePurchase(result.domain)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Purchase
                          </Button>
                          <Button
                            onClick={() => handleConnect(result.domain)}
                            variant="outline"
                            size="sm"
                          >
                            <Link className="w-4 h-4 mr-1" />
                            Connect
                          </Button>
                        </>
                      ) : result.premium ? (
                        <Button
                          onClick={() => handlePurchase(result.domain)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          size="sm"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Premium
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Not Available
                        </Button>
                      )}
                    </div>

                    {/* Auth Notice */}
                    {!isAuthenticated && result.available && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Sign in required to purchase or connect domains
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && !loading && query && (
        <Card>
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">
              Try searching with different terms or TLDs
            </p>
            <Button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              variant="outline"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Search</h3>
            <p className="text-gray-600">
              Search millions of domains instantly with real-time availability
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Link className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Connect</h3>
            <p className="text-gray-600">
              Connect domains to your VibeCaaS apps with one click
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto SSL</h3>
            <p className="text-gray-600">
              Automatic SSL certificate issuance and renewal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DomainSearch;
