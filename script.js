// 🔑 Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let map; // global map object

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

    // Load saved addresses from Firestore
    loadSavedAddresses();
  }
}

async function addAddress() {
  const address = document.getElementById("address").value;
  if (!address) {
    alert("Please enter an address!");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      L.marker([lat, lon]).addTo(map)
        .bindPopup(address)
        .openPopup();

      map.setView([lat, lon], 14);

      // Save to Firestore
      await db.collection("addresses").add({
        address: address,
        lat: lat,
        lon: lon,
        timestamp: Date.now()
      });

    } else {
      alert("Address not found!");
    }
  } catch (err) {
    alert("Error fetching location: " + err);
  }
}

async function loadSavedAddresses() {
  const snapshot = await db.collection("addresses").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    L.marker([data.lat, data.lon]).addTo(map)
      .bindPopup(data.address);
  });
}
