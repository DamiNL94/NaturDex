const map = L.map('map').setView([40.4168, -3.7038], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Cargar parques desde API
fetch("http://localhost/naturadex/backend/api/parks.php")
    .then(res => res.json())
    .then(parques => {

        parques.forEach(parque => {

            const marker = L.marker([parque.latitude, parque.longitude]).addTo(map);

            marker.bindPopup(`
                <b>${parque.name}</b><br>
                ${parque.description}
            `);
        });

    });