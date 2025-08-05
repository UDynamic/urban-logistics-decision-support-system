import districts from '../data/Districts.json' with { type: 'json' };
import fs from 'fs';

function generateNeighborhoodCodes(districts) {
    return districts.map(district => {
      return {
        ...district,
        neighborhoods: district.neighborhoods.map((name, idx) => ({
          id: `${district.id}_N${String(idx + 1).padStart(2, '0')}`,
          name
        }))
      };
    });
  }
  
  const updatedDistricts = generateNeighborhoodCodes(districts);
  
  // Save as JSON file
  fs.writeFileSync(
    '../data/Districts.json',
    JSON.stringify(updatedDistricts, null, 2), // pretty print
    'utf-8'
  );
  
  console.log('Districts.json updated successfully with neighborhood codes!'); 