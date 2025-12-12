const path = require('path');
const { getVODAndSeriesCategories, getVODAndSeriesByCategory } = require('./src/lib/m3u');

// Mock process.cwd() for the library
const originalCwd = process.cwd;
process.cwd = () => __dirname;

console.log('Starting benchmark...');
const startTime = performance.now();

// 1. Get Categories
console.log('Fetching categories...');
const categories = getVODAndSeriesCategories();
console.log(`Found ${categories.length} categories.`);

// 2. Iterate and fetch items for each category (mimicking page.tsx)
console.log('Fetching items for all categories...');
let totalItems = 0;
for (const category of categories) {
    const items = getVODAndSeriesByCategory(category);
    totalItems += items.length;
}

const endTime = performance.now();
const duration = (endTime - startTime) / 1000;

console.log(`\nBenchmark completed in ${duration.toFixed(3)} seconds.`);
console.log(`Processed ${totalItems} items across ${categories.length} categories.`);
