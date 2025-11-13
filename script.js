// 🔑 Replace with your Firebase config
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

function loadMap() {
  document.getElementById("map").style.display = "block";

  const center = [42.0125, -87.6901];

  if (!map) {
    map = L.map('map').setView(center, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker(center).addTo(map)
      .bindPopup('Rahmat-e-Alam Foundation')
      .openPopup();

    loadSavedAddresses();
  }
}

async function addAddress() {
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const apt = document.getElementById("apt").value;
  const fullAddress = `${address} ${apt}`;

  if (!name || !address) {
    alert("Please enter name and address.");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${name}</b><br>${fullAddress}`)
        .openPopup();

      markers.push(marker);
      map.setView([lat, lon], 14);

      await db.collection("addresses").add({
        name: name,
        address: fullAddress,
        lat: lat,
        lon: lon,
        timestamp: Date.now()
      });

    } else {
      alert("Address not found!");
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

async function loadSavedAddresses() {
  const snapshot = await db.collection("addresses").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const marker = L.marker([data.lat, data.lon]).addTo(map)
      .bindPopup(`<b>${data.name}</b><br>${data.address}`);
    markers.push(marker);
  });
}
