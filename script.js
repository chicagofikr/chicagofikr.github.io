// Center coordinates for Rahmat-e-Alam Foundation in Chicago
const center = [42.0125, -87.6901];

// Initialize the map
const map = L.map('map').setView(center, 14);

// Add OpenStreetMap tiles (free, no API key needed)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a marker with popup
L.marker(center)
  .addTo(map)
  .bindPopup('Rahmat-e-Alam Foundation')
  .openPopup();
