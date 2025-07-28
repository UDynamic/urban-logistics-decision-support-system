import districts from './data/districts.json' with { type: 'json' };

const d01 = districts[0];
const nh01_01 = d01.neighborhoods[0];
console.log(`found ${nh01_01} in ${d01.district}`);