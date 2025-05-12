// Wetterstationen Euregio Beispiel

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11,
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// thematische Layer
let overlays = {
    stations: L.featureGroup().addTo(map),
    temperature: L.featureGroup().addTo(map),
    wind: L.featureGroup().addTo(map),
    snow: L.featureGroup().addTo(map),
};

// Layer control
L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://sonny.4lima.de">Sonny</a>, <a href="https://www.eea.europa.eu/en/datahub/datahubitem-view/d08852bc-7b5f-4835-a776-08362e2fbf4b">EU-DEM</a>, <a href="https://lawinen.report/">avalanche.report</a>, all licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`
    }).addTo(map),
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Windgeschwindigkeit": overlays.wind,
    "Schneehöhen": overlays.snow,
}).addTo(map);

// Maßstab
L.control.scale({ imperial: false }).addTo(map);

// Wetterstationen laden
async function loadStations(url) {
        let response = await fetch(url);
        let jsondata = await response.json();
        

        L.geoJSON(jsondata, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: `icons/wifi.png`,
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                });
            },
            onEachFeature: function (feature, layer) {
                let pointInTime = new Date(feature.properties.date);
                //console.log(pointInTime)
                layer.bindPopup(`
                    <h4>${feature.properties.name} (${feature.geometry.coordinates[2]}m) </h4>
                    <ul>
                        <li> Lufttemperatur (c) ${feature.properties.LT !== undefined ? feature.properties.LT : "-"}</li>
                        <li> Relative Luftfeuchte (%) ${feature.properties.RH}</li>
                        <li> Windgeschwindigkeit (km/h) ${feature.properties.WG}</li>
                        <li> Schneehöhe (cm) ${feature.properties.HS}</li>
                        <li> Windrichtung ${feature.properties.WD}</li>
                    </ul>
                    <span>${pointInTime.toLocaleString()}</span>
                    
                    `);
            }
        }).addTo(overlays.stations)
        showTemperature(jsondata);
        showWind(jsondata);
        showSnow(jsondata);
}
   

// Aufruf der Funktion mit URL
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");

// Temperaturen Feauture:
function showTemperature(jsondata) {
    L.geoJson(jsondata, {
        filter: function(feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }

        },
        pointToLayer:function(feature, latlng){
            let color =getColor(feature.properties.LT, COLORS.temperature);
            return L.marker (latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.LT.toFixed(1)}</span>`
                }),
            })
        },


    }).addTo(overlays.temperature);
}

function getColor(value, ramp) {
    for (let rule of ramp) {
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }

}
 
let testColor = getColor(-5, COLORS.temperature);
console.log("TestColor for temp -5", testColor);

// Snow
function showSnow(jsondata) {
    L.geoJson(jsondata, {
        filter: function(feature) {
            if (feature.properties.HS > 0 && feature.properties.HS < 1000) {
                return true;
            }

        },
        pointToLayer:function(feature, latlng){
            let color =getColor(feature.properties.HS, COLORS.snow);
            return L.marker (latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon-snow",
                    html: `<span style="background-color:${color}">${feature.properties.HS.toFixed(1)}</span>`
                }),
            })
        },


    }).addTo(overlays.snow);}

// Wind 
function showWind(jsondata) {
    L.geoJson(jsondata, {
        filter: function(feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 1000) {
                return true;
            }

        },
        pointToLayer:function(feature, latlng){
            let color =getColor(feature.properties.WG, COLORS.wind);
            return L.marker (latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon-wind",
                    html: `<span style="background-color:${color}">${feature.properties.WG.toFixed(1)}</span>`

                }),
            })
        },


    }).addTo(overlays.wind);}
