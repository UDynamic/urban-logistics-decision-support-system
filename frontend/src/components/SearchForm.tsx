'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

// =============================================================================
// Search Form Component
// =============================================================================

interface Neighborhood {
  id: string;
  name: string;
  district_name: string;
  latitude: number;
  longitude: number;
}

interface SearchFormProps {
  onOriginSelect: (originId: string | null) => void;
  selectedOrigin: string | null;
}

export function SearchForm({ onOriginSelect, selectedOrigin }: SearchFormProps) {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm();

  // Load neighborhoods on component mount
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  // Load neighborhoods from API
  const loadNeighborhoods = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/neighborhoods`);
      if (response.data.success) {
        setNeighborhoods(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load neighborhoods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search neighborhoods
  const searchNeighborhoods = async (term: string) => {
    if (!term.trim()) {
      loadNeighborhoods();
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/neighborhoods?search=${encodeURIComponent(term)}`
      );
      if (response.data.success) {
        setNeighborhoods(response.data.data);
      }
    } catch (error) {
      console.error('Failed to search neighborhoods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchNeighborhoods(value);
  };

  // Handle origin selection
  const handleOriginSelect = (selectedOption: any) => {
    if (selectedOption) {
      onOriginSelect(selectedOption.value);
    } else {
      onOriginSelect(null);
    }
  };

  // Clear selection
  const handleClear = () => {
    onOriginSelect(null);
    setSearchTerm('');
    reset();
    loadNeighborhoods();
  };

  // Format options for react-select
  const formatOptions = (neighborhoods: Neighborhood[]) => {
    return neighborhoods.map(neighborhood => ({
      value: neighborhood.id,
      label: `${neighborhood.name} - ${neighborhood.district_name}`,
      data: neighborhood
    }));
  };

  return (
    <div className="space-y-4">
      {/* Origin Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Origin Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <Select
            value={selectedOrigin ? formatOptions(neighborhoods).find(opt => opt.value === selectedOrigin) : null}
            onChange={handleOriginSelect}
            options={formatOptions(neighborhoods)}
            placeholder="Search for a neighborhood..."
            isClearable
            isSearchable
            isLoading={isLoading}
            onInputChange={handleSearchChange}
            inputValue={searchTerm}
            className="react-select-container"
            classNamePrefix="react-select"
            noOptionsMessage={() => "No neighborhoods found"}
            loadingMessage={() => "Loading neighborhoods..."}
            formatOptionLabel={(option: any) => (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">{option.data.name}</div>
                  <div className="text-sm text-gray-500">{option.data.district_name}</div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Selection
        </button>
        
        {selectedOrigin && (
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Search className="h-4 w-4 inline mr-2" />
            Find Routes
          </button>
        )}
      </div>

      {/* Selected Origin Info */}
      {selectedOrigin && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Selected Origin: {neighborhoods.find(n => n.id === selectedOrigin)?.name}
              </p>
              <p className="text-xs text-blue-700">
                {neighborhoods.find(n => n.id === selectedOrigin)?.district_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600">
        <p>
          Select your starting location to see the best routes sorted by price, distance, and travel time.
        </p>
      </div>
    </div>
  );
} 