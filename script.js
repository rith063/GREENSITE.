const itemsData = {
  botol_plastik: { price: 0.40, unit: "kg" },
  kadbod: { price: 0.25, unit: "kg" },
  tin_aluminium: { price: 2.30, unit: "kg" },
  tembaga: { price: 25.00, unit: "kg" },
  besi: { price: 0.50, unit: "kg" },
  surat_khabar: { price: 0.35, unit: "kg" },
  majalah: { price: 0.12, unit: "kg" },
  botol_kaca: { price: 0.25, unit: "kg" },
  minyak_masak: { price: 2.70, unit: "kg" },
  pvc: { price: 0.50, unit: "kg" },
  telefon_lama: { price: 5.00, unit: "unit" },
  laptop_lama: { price: 2.50, unit: "unit" },
  tv_lama: { price: 3.00, unit: "unit" },
  bateri_kereta: { price: 0.50, unit: "kg" },
  aircond: { price: 5.00, unit: "unit" },
  mesin_basuh: { price: 7.00, unit: "unit" },
  peti_ais: { price: 7.00, unit: "unit" },
  tayar: { price: 3.00, unit: "unit" },
  cpu_lengkap: { price: 5.00, unit: "unit" },
  wayar: { price: 1.00, unit: "kg" }
};


let selectMenu = document.getElementById("material");
let qtyInput = document.getElementById("qty");

if (selectMenu && qtyInput) {
  Object.keys(itemsData).forEach(item => {
    let option = document.createElement("option");
    option.value = item;
    option.text = item.replaceAll("_", " ").toUpperCase();
    selectMenu.appendChild(option);
  });

  qtyInput.placeholder = `Masukkan kuantiti dalam (kg)`;

  selectMenu.addEventListener("change", function() {
    let selectedItem = selectMenu.value;
    let unitType = itemsData[selectedItem].unit;
    qtyInput.placeholder = `Masukkan kuantiti dalam (${unitType})`;
  });
}

let senaraiBarangKitar = [];

function tambahKeResit() {
  let item = document.getElementById("material").value;
  let qty = parseFloat(document.getElementById("qty").value);

  if (!qty || qty <= 0) {
    alert("⚠️ Sila masukkan kuantiti yang sah!");
    return;
  }

  let hargaItem = itemsData[item].price * qty;
  let namaBersih = item.replaceAll("_", " ").toUpperCase();

  senaraiBarangKitar.push({
    nama: namaBersih,
    kuantiti: qty,
    harga: hargaItem
  });

  
  let totalSeketika = itemsData[item].price * qty;
  document.getElementById("result").innerText = "💰 RM " + totalSeketika.toFixed(2);
  if (totalSeketika >= 50) {
    document.getElementById("motivation").innerText = "🔥 Hebat! Anda wira alam sekitar!";
  } else if (totalSeketika >= 20) {
    document.getElementById("motivation").innerText = "🌱 Bagus! Teruskan kitar semula!";
  } else {
    document.getElementById("motivation").innerText = "♻️ Setiap usaha kecil memberikan impak besar!";
  }

  document.getElementById("resitArea").style.display = "block";
  kemaskiniPaparanResit();
  document.getElementById("qty").value = "";
}

function kemaskiniPaparanResit() {
  let isiResit = document.getElementById("isiResit");
  if (!isiResit) return;
  isiResit.innerHTML = ""; 
  let totalSemua = 0;

  senaraiBarangKitar.forEach(barang => {
    totalSemua += barang.harga;
    let baris = `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">${barang.nama}</td>
        <td style="padding: 8px;">${barang.kuantiti}</td>
        <td style="padding: 8px;">RM ${barang.harga.toFixed(2)}</td>
      </tr>
    `;
    isiResit.innerHTML += baris;
  });

  document.getElementById("jumlahBesar").innerText = "Jumlah Keseluruhan: RM " + totalSemua.toFixed(2);
}

function padamResit() {
  senaraiBarangKitar = [];
  document.getElementById("resitArea").style.display = "none";
  document.getElementById("isiResit").innerHTML = "";
  document.getElementById("result").innerText = "";
  document.getElementById("motivation").innerText = "";
}


function findLocation() {
  if (!navigator.geolocation) {
    bukaGoogleMapsDirect();
    return;
  }

  navigator.geolocation.getCurrentPosition(function(pos) {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    let mapElement = document.getElementById("map");
    if (!mapElement) return;
    mapElement.innerHTML = "";
    mapElement.style.display = "block"; 

    let map = L.map('map').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup("📍 Lokasi Anda Sekarang").openPopup();

    let query = `
    [out:json];
    (
      node["amenity"="recycling"](around:30000,${lat},${lon});
      way["amenity"="recycling"](around:30000,${lat},${lon});
      relation["amenity"="recycling"](around:30000,${lat},${lon});
      node["amenity"="waste_transfer_station"](around:30000,${lat},${lon});
      way["waste_transfer_station"](around:30000,${lat},${lon});
      node["shop"="scrap_yard"](around:30000,${lat},${lon});
      way["shop"="scrap_yard"](around:30000,${lat},${lon});
    );
    out center;
    `;

    let url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

    fetch(url)
    .then(res => res.json())
    .then(data => {
      let elements = data.elements;
      if (!elements.length) {
        alert("Tiada pusat kitar semula dijumpai dalam radius 30km.");
        return;
      }

      elements.forEach(place => {
        let pLat = place.lat || place.center?.lat;
        let pLon = place.lon || place.center?.lon;
        let name = place.tags?.name || "♻️ Pusat Kitar Semula";

        let marker = L.marker([pLat, pLon]).addTo(map);
        marker.bindPopup(`<b>${name}</b><br><small>Klik untuk arah jalan (Navigation)</small>`);

        marker.on("click", function() {
          let searchQueries = `${name} @ ${pLat},${pLon}`;
          let googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(searchQueries);
          window.open(googleMapsUrl, "_blank");
        });
      }); 
    });
  }, function(error) {
    bukaGoogleMapsDirect();
  });
}

function bukaGoogleMapsDirect() {
  alert("Membuka carian Pusat Kitar Semula secara terus di aplikasi Google Maps anda...");
  let googleMapsUrl = "intent://maps.google.com/maps?q=" + encodeURIComponent("Pusat Kitar Semula berdekatan") + "#Intent;scheme=http;package=com.google.android.apps.maps;end";
  window.open(googleMapsUrl, "_blank");
}

// --- LOGIK KESAN GRAFIK CARD TILT (HALAMAN HARGA) ---
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    let rect = card.getBoundingClientRect();
    let x = e.clientX - rect.left - (rect.width / 2);
    let y = e.clientY - rect.top - (rect.height / 2);
    card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) translateY(-5px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});


function animatePrices() {
  const priceSpans = document.querySelectorAll('.card span');
  if (priceSpans.length === 0) return;

  priceSpans.forEach(span => {
    let targetText = span.innerText;
    let numericValue = parseFloat(targetText.replace(/[^0-9.]/g, '')); 
    let suffix = targetText.includes('/kg') ? '/kg' : '/unit';
    let count = 0;
    let speed = numericValue / 30; 

    let counter = setInterval(() => {
      count += speed;
      if (count >= numericValue) {
        clearInterval(counter);
        span.innerText = `RM${numericValue.toFixed(2)}${suffix}`;
      } else {
        span.innerText = `RM${count.toFixed(2)}${suffix}`;
      }
    }, 30);
  });
}

window.addEventListener('DOMContentLoaded', animatePrices);

// --- LOGIK AUTO SLIDER LALUAN FAKTA (HALAMAN UTAMA) ---
function jalankanAutoSlider() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return; // Keluar jika halaman semasa tiada slider (cth: halaman harga)

  let currentSlide = 0;
  const slideInterval = 10000;

  function nextSlide() {
    
    slides[currentSlide].classList.remove('active');
    
   
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
  }

  setInterval(nextSlide, slideInterval);
}


window.addEventListener('DOMContentLoaded', jalankanAutoSlider);

// Fungsi untuk simulasi buka chat AI
function bukaSembangAI() {
            const kotakChat = document.getElementById('kotak-chat-ai');
            kotakChat.classList.add('buka');
        }
// Fungsi untuk memaparkan kotak chat terus apabila butang ditekan
function bukaSembangAI() {
    const kotakChat = document.getElementById('kotak-chat-ai');
    kotakChat.classList.add('buka'); // Slide up tingkap chat
}

// Fungsi tutup chat
function tutupChatAI() {
    const kotakChat = document.getElementById('kotak-chat-ai');
    kotakChat.classList.remove('buka');
}

// Fungsi kesan pengguna tekan 'Enter'
function hantarMesej(event) {
    if (event.key === 'Enter') {
        prosesMesej();
    }
}

// Fungsi memproses hantaran dan jawapan AI
function prosesMesej() {
    const input = document.getElementById('input-mesej-user');
    const content = document.getElementById('chat-content');
    
    if (input.value.trim() === "") return;

    // 1. Masukkan mesej pengguna ke skrin
    const mesejUserDiv = document.createElement('div');
    mesejUserDiv.className = 'mesej-user';
    mesejUserDiv.innerText = input.value;
    content.appendChild(mesejUserDiv);

    const mesejTeks = input.value.toLowerCase();
    input.value = ""; // Kosongkan input
    content.scrollTop = content.scrollHeight; // Skrol bawah automatik

    // 2. Simulasi AI berfikir sekejap (0.8 saat) dan balas secara automatik
    setTimeout(() => {
        const balasBotDiv = document.createElement('div');
        balasBotDiv.className = 'mesej-bot';
        
        // Logik jawapan AI berdasarkan kata kunci teks pengguna
        if (mesejTeks.includes('harga')) {
            balasBotDiv.innerText = "🤖 Anda boleh semak senarai harga kitar semula terkini di menu 'Harga' kami!";
        } else if (mesejTeks.includes('lokasi') || mesejTeks.includes('tempat')) {
            balasBotDiv.innerText = "🤖 Kami mempunyai pusat pengumpulan di Seksyen 7 Shah Alam. Sila rujuk menu 'Lokasi' untuk peta penuh.";
        } else {
            balasBotDiv.innerText = "🤖 Terima kasih! Soalan anda telah direkodkan ke dalam sistem pemprosesan pintar GreenSite.";
        }

        content.appendChild(balasBotDiv);
        content.scrollTop = content.scrollHeight;
    }, 800);
}
// =========================================
// MENU HAMBURGER PHONE
// =========================================

function toggleMenu() {
    const menu = document.getElementById("mobileMenu");

    if (menu) {
        menu.classList.toggle("show");
    }
}
