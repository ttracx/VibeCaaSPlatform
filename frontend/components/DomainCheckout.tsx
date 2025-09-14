'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Globe, 
  CheckCircle, 
  DollarSign, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CreditCard,
  Shield,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface ContactInfo {
  first_name: string;
  last_name: string;
  organization: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

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

const DomainCheckout: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [domainInfo, setDomainInfo] = useState<DomainSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [years, setYears] = useState(1);
  const [privacy, setPrivacy] = useState(true);
  const [registrantContact, setRegistrantContact] = useState<ContactInfo>({
    first_name: '',
    last_name: '',
    organization: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
    email: ''
  });

  useEffect(() => {
    // Get domain from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const domainParam = urlParams.get('domain');
    if (domainParam) {
      setDomain(domainParam);
      fetchDomainInfo(domainParam);
    }
  }, []);

  const fetchDomainInfo = async (domainName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/domains/search?q=${domainName}&tlds=com,ai,dev,io,co&limit=1`);
      const data = await response.json();
      
      if (data.ok && data.data.length > 0) {
        setDomainInfo(data.data[0]);
      } else {
        setError('Domain not found or not available');
      }
    } catch (err) {
      setError('Failed to fetch domain information');
      console.error('Domain fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!domainInfo || !domainInfo.available) {
      setError('Domain is not available for purchase');
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      const purchaseData = {
        domain: domain,
        years: years,
        privacy: privacy,
        registrant_contact: registrantContact,
        admin_contact: registrantContact, // Use same contact for all
        tech_contact: registrantContact,
        billing_contact: registrantContact
      };

      const response = await fetch('/api/v1/domains/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(purchaseData)
      });

      const result = await response.json();

      if (result.ok) {
        setSuccess(true);
        setOrderId(result.data.order_id);
      } else {
        setError(result.error?.message || 'Purchase failed');
      }
    } catch (err) {
      setError('Failed to purchase domain');
      console.error('Purchase error:', err);
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (priceCents: number, currency: string) => {
    const price = priceCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setRegistrantContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Domain Purchase Successful!
            </h2>
            <p className="text-green-700 mb-4">
              Your domain <strong>{domain}</strong> is being registered.
            </p>
            <p className="text-sm text-green-600 mb-6">
              Order ID: {orderId}
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => window.location.href = `/domains/${domain}/connect`}
                className="bg-green-600 hover:bg-green-700"
              >
                Connect to App
              </Button>
              <Button
                onClick={() => window.location.href = '/domains'}
                variant="outline"
              >
                View All Domains
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading domain information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!domainInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Domain Not Found
            </h2>
            <p className="text-red-700 mb-6">
              The domain you're looking for is not available or doesn't exist.
            </p>
            <Button
              onClick={() => window.location.href = '/domains'}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => window.location.href = '/domains'}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your domain purchase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Domain Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{domain}</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Available
              </Badge>
            </div>
            
            {domainInfo.pricing && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Registration ({years} year{years > 1 ? 's' : ''})</span>
                  <span className="font-semibold">
                    {formatPrice(domainInfo.pricing.price_cents * years, domainInfo.pricing.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy Protection</span>
                  <span>{privacy ? 'Included' : 'Not included'}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatPrice(domainInfo.pricing.price_cents * years, domainInfo.pricing.currency)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Period
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {domainInfo.years_allowed.map(year => (
                    <option key={year} value={year}>
                      {year} year{year > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  Enable privacy protection (recommended)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={registrantContact.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={registrantContact.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={registrantContact.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={registrantContact.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={registrantContact.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={registrantContact.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={registrantContact.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={registrantContact.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={registrantContact.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={registrantContact.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={registrantContact.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Purchase Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">Secure Purchase</p>
                <p className="text-sm text-gray-600">
                  Your payment is processed securely through Stripe
                </p>
              </div>
            </div>
            <Button
              onClick={handlePurchase}
              disabled={purchasing || !domainInfo.available}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              {purchasing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Purchase Domain
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainCheckout;