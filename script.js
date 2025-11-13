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

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      const docRef = await db.collection("addresses").add({
        name,
        address: fullAddress,
        lat,
        lon,
        status,
        visited,
        comment: "", // start with empty comment
        timestamp: Date.now()
      });

      const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(popupContent(docRef.id, name, fullAddress, status, visited, ""))
        .openPopup();

      markers.push(marker);
      map.setView([lat, lon], 14);

    } else {
      alert("Address not found!");
    }
  } catch (err) {
    alert("Error: " + err);
  }
}

async function loadSavedAddresses() {
  const search = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("status").value;
  const visited = document.getElementById("visited").value;

  const snapshot = await db.collection("addresses").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const nameMatch = data.name?.toLowerCase().includes(search);
    const addressMatch = data.address?.toLowerCase().includes(search);
    const statusMatch = (status === "All" || data.status === status);
    const visitedMatch = (visited === "All" || data.visited === visited);

    if ((nameMatch || addressMatch) && statusMatch && visitedMatch) {
      const marker = L.marker([data.lat, data.lon]).addTo(map)
        .bindPopup(popupContent(doc.id, data.name, data.address, data.status, data.visited, data.comment || ""));
      markers.push(marker);
    }
  });
}

// Popup with Edit control
function popupContent(id, name, address, status, visited, comment) {
  return `
    <b>${name}</b><br>${address}<br>
    Status: ${status}<br>
    Visited: ${visited}<br>
    Comment: ${comment}<br>
    <button onclick="editAddress('${id}', '${name}', '${address}', '${status}', '${visited}', '${comment}')">Edit</button>
  `;
}

// Edit prompt form including comment
async function editAddress(id, name, address, status, visited, comment) {
  const newName = prompt("Edit name:", name);
  const newStatus = prompt("Edit status:", status);
  const newVisited = prompt("Edit visited:", visited);
  const newComment = prompt("Edit comment:", comment);

  if (newName && newStatus && newVisited) {
    await db.collection("addresses").doc(id).update({
      name: newName,
      status: newStatus,
      visited: newVisited,
      comment: newComment
    });
    loadMap(); // reload markers with updated info
  }
}
