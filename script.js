// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let map;
let markers = [];
let editId = null;

function loadMap() {
  document.getElementById("map").style.display = "block";
  const center = [42.0125, -87.6901];

  if (!map) {
    map = L.map('map').setView(center, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker(center).addTo(map).bindPopup('Rahmat-e-Alam Foundation').openPopup();
  }

  markers.forEach(m => map.removeLayer(m));
  markers = [];
  loadSavedAddresses();
}

async function addAddress() {
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const apt = document.getElementById("apt").value;
  const status = document.getElementById("newStatus").value;
  const visited = document.getElementById("newVisited").value;
  const fullAddress = `${address} ${apt}`;

  if (!name || !address || !status || !visited) {
    alert("Please fill in all fields.");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    const docRef = await db.collection("addresses").
