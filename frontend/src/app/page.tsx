'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { RouteCard } from '@/components/RouteCard';
import { Map } from '@/components/Map';
import { Header } from '@/components/Header';
import { useRoutes } from '@/hooks/useRoutes';
import { Route } from '@/types';

// =============================================================================
// Main Page Component
// =============================================================================

export default function HomePage() {
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const { routes, isLoading, error } = useRoutes(selectedOrigin);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Find Best Routes
            </h2>
            <SearchForm 
              onOriginSelect={setSelectedOrigin}
              selectedOrigin={selectedOrigin}
            />
          </div>
        </section>

        {/* View Mode Toggle */}
        <section className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedOrigin ? 'Routes from Selected Origin' : 'Latest Routes'}
              </h3>
              {selectedOrigin && (
                <p className="text-gray-600 mt-1">
                  Showing best routes sorted by price
                </p>
              )}
            </div>
            
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-l-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section>
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error loading routes: {error.message}
              </p>
            </div>
          )}

          {!isLoading && !error && routes.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">
                {selectedOrigin 
                  ? 'No routes found for the selected origin. Try selecting a different location.'
                  : 'No routes available. The scraper may not have collected data yet.'
                }
              </p>
            </div>
          )}

          {!isLoading && !error && routes.length > 0 && (
            <>
              {viewMode === 'list' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {routes.map((route: Route) => (
                    <RouteCard key={route.route_id} route={route} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Map routes={routes} />
                </div>
              )}
            </>
          )}
        </section>

        {/* Statistics Section */}
        {!isLoading && !error && routes.length > 0 && (
          <section className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {routes.length}
                  </p>
                  <p className="text-gray-600">Total Routes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      routes.reduce((sum, route) => sum + (route.cab_price || 0), 0) / routes.length
                    )}
                  </p>
                  <p className="text-gray-600">Avg Cab Price (Toman)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      routes.reduce((sum, route) => sum + (route.distance_meters || 0), 0) / routes.length / 1000
                    )}
                  </p>
                  <p className="text-gray-600">Avg Distance (km)</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
} 