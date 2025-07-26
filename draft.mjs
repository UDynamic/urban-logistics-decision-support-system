import Districts from './data/Districts.json' with { type: 'json' };


const totalNeighborhoods = Districts.reduce((count, district) => {
    return count + district.neighborhoods.length;
}, 0);


// Total neighborhoods: 408
// total routs:  166464
console.log(`Total neighborhoods: ${totalNeighborhoods}`);
console.log("total routs: ", totalNeighborhoods * totalNeighborhoods);