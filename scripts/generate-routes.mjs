import districts from '../data/Districts.json' with { type: 'json' };
import fs from 'fs';

function createNeighborhoodId(districtId, neighborhoodIndex) {
  return `${districtId}_N${String(neighborhoodIndex + 1).padStart(2, '0')}`;
}

const routes = [];

districts.forEach((originDistrict, originDistrictIdx) => {
  originDistrict.neighborhoods.forEach((originNeighborhood, originIdx) => {
    const originId = createNeighborhoodId(originDistrict.id, originIdx);

    districts.forEach((destDistrict, destDistrictIdx) => {
      destDistrict.neighborhoods.forEach((destNeighborhood, destIdx) => {
        const destId = createNeighborhoodId(destDistrict.id, destIdx);

        // Skip routes from a neighborhood to itself
        if (originDistrictIdx === destDistrictIdx && originIdx === destIdx) return;

        // Push route with simplified schema
        routes.push({
          id: `${originId}__${destId}`,
          origin: {
            id: originId,
            name: originNeighborhood.name
          },
          destination: {
            id: destId,
            name: destNeighborhood.name
          }
        });
      });
    });
  });
});

// Save to routes.json
fs.writeFileSync('../data/routes.json', JSON.stringify(routes, null, 2), 'utf8');
console.log(`✅ Generated ${routes.length} routes and saved to data/routes.json`); 