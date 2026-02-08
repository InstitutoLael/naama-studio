import { searchServices } from './src/utils/searchUtils.js';

const mockData = [
  { name: "Pestañas", worker: "Allison", cat: "Pestañas" },
  { name: "Depilación", worker: "Gaby", cat: "Depilación" },
  { name: "Manos", worker: "Vivy", cat: "Manicure" }
];

console.log("Test 1 (Accent):", searchServices(mockData, "pestanas"));
console.log("Test 2 (Multi-word):", searchServices(mockData, "gaby depi"));
console.log("Test 3 (Short):", searchServices(mockData, "a"));
console.log("Test 4 (Case):", searchServices(mockData, "ALLISON"));
