'use client';

import { useState } from 'react';
import { MapPin, Clock, Car, Bike, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Route } from '@/types';

// =============================================================================
// Route Card Component
// =============================================================================

interface RouteCardProps {
  route: Route;
}

export function RouteCard({ route }: RouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format price with Persian numerals
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  // Format distance
  const formatDistance = (meters: number | null) => {
    if (meters === null) return 'N/A';
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  // Get price trend indicator
  const getPriceTrend = (price: number | null) => {
    if (price === null) return null;
    
    // This would be calculated based on historical data
    // For now, we'll use a simple heuristic
    if (price > 50000) return 'high';
    if (price < 20000) return 'low';
    return 'medium';
  };

  const priceTrend = getPriceTrend(route.cab_price);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {route.origin_name}
            </h3>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{route.destination_name}</span>
            </div>
          </div>
          
          {/* Price Trend Indicator */}
          {priceTrend && (
            <div className="flex items-center">
              {priceTrend === 'low' ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : priceTrend === 'high' ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <div className="h-2 w-2 bg-gray-400 rounded-full" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {/* Cab Price */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">Cab</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(route.cab_price)} تومان
            </span>
          </div>

          {/* Bike Price */}
          {route.bike_price && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Bike className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Bike</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(route.bike_price)} تومان
              </span>
            </div>
          )}

          {/* Bike Delivery Price */}
          {route.bike_delivery_price && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Bike Delivery</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {formatPrice(route.bike_delivery_price)} تومان
              </span>
            </div>
          )}
        </div>

        {/* Route Details */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDuration(route.duration_seconds)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{formatDistance(route.distance_meters)}</span>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Route ID:</span>
              <span className="font-mono text-gray-900">{route.route_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {new Date(route.scraped_at).toLocaleString('fa-IR')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Origin ID:</span>
              <span className="font-mono text-gray-900">{route.origin_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Destination ID:</span>
              <span className="font-mono text-gray-900">{route.destination_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
            View on Map
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
            Price History
          </button>
        </div>
      </div>
    </div>
  );
} 