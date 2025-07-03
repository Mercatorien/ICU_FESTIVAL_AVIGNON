// --- Légende avancée (occupation du sol + isochrones) ---
const legendConfig = {
  colors: ["#dc1010", "#79de13", "#464646", "#2db9ff", "#d5ffbf", "#fffa9b"],
  labels: ["Bâtiment", "Arbre", "Bitume", "Eau", "Herbe", "Sol nu"]
};

const isochronesLegend = [
  { color: '#e6f0ff', label: '1-3 théâtres' },
  { color: '#99c2e6', label: '4-6 théâtres' },
  { color: '#4f91c6', label: '7-10 théâtres' },
  { color: '#155fa0', label: '11-13 théâtres' },
  { color: '#08306b', label: '14-16 théâtres' }
];

// Configuration de la carte
const map = L.map('map', {
    center: [46.603354, 1.888334], // centre France
    zoom: 5,
    zoomControl: false,
    scrollWheelZoom: true,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    attributionControl: false // Désactive l'attribution par défaut à droite
});

// Définir les limites de zoom de la carte
map.setMinZoom(0);
map.setMaxZoom(18);

// Configuration des couches de base
// --- Fonds de carte ---
// Renseignez votre clé Thunderforest ici :
const thunderforestApiKey = 'd47e9c60d00d4173ae2f351db4599e5a'; // <-- À remplacer par votre clé !

const thunderforest = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey='+thunderforestApiKey, {
  attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest Transport</a>',
  maxZoom: 22,
  opacity: 0.8
});
const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  attribution: '&copy; <a href="https://www.google.com/earth/">Google Satellite</a>',
  opacity: 0.8
});

function setBasemap(type) {
  if (type === 'Thunderforest') {
    map.removeLayer(googleSat);
    thunderforest.addTo(map);
    thunderforest.bringToBack();
  } else {
    map.removeLayer(thunderforest);
    googleSat.addTo(map);
    googleSat.bringToBack();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const basemapSwitch = document.getElementById('basemap-switch');
  const basemapLabel = document.getElementById('basemap-label');
  if (basemapSwitch && basemapLabel) {
    // Par défaut : Thunderforest
    setBasemap('Thunderforest');
    basemapSwitch.checked = true;
    basemapLabel.textContent = 'Fond Transport';
    basemapSwitch.addEventListener('change', function() {
      if (this.checked) {
        setBasemap('Thunderforest');
        basemapLabel.textContent = 'Fond Transport';
      } else {
        setBasemap('Google Satellite');
        basemapLabel.textContent = 'Fond Satellite';
      }
    });
  }
});


// --- Couche GeoJSON des théâtres ---
let theatresLayer;
const theatresUrl = 'https://raw.githubusercontent.com/Mercatorien/ICU_FESTIVAL_AVIGNON/cb3fdd6ee814e34f9e241f967d8f198a76c1a8ec/geodata/theatres.geojson';

fetch(theatresUrl)
  .then(response => response.json())
  .then(data => {
    theatresLayer = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#3394d3',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function(feature, layer) {
        let props = feature.properties;
        let popupContent = `<div style='text-align:center;font-weight:bold;font-style:italic;font-size:1.15em;'>${props.nom_t || ''}</div>`;
if (props.url) {
  popupContent += `<div style='margin: 8px 0;'><img src='${props.url}' alt='Image du théâtre' style='max-width:180px;max-height:120px;display:block;margin:auto;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);'></div>`;
} else {
  popupContent += `<div style='font-size:0.9em;color:#f00;'>Aucune URL d'image trouvée</div>`;
}
        popupContent += `<div><br><strong>Adresse :</strong> ${props.adresse || ''}</div>`;
        popupContent += `<div><strong>Site internet :</strong> <a href='${props.site_internet || '#'}' target='_blank'>${props.site_internet || ''}</a></div>`;
        popupContent += `<div><strong>Capacité :</strong> ${props.capacite || ''}</div>`;
        popupContent += `<div><strong>Nb spectacles :</strong> ${props.nb_spectacles || ''}</div>`;
        popupContent += `<div><strong>Nb personnes accueillies :</strong> ${props.nb_pers_acc || ''}</div>`;
        popupContent += `<div><strong>Gravitaire :</strong> ${props.GRAVITAIRE_sum || ''}</div>`;
        layer.bindPopup(popupContent, {maxWidth: 340});

        // --- Affichage du graphique Chart.js lors du clic sur le marker ---
        layer.on('click', function() {
          // Récupère les années et températures
          const years = [];
          const values = [];
          for (let y = 2013; y <= 2025; y++) {
            const key = `LST_${y}`;
            if (props[key] !== undefined && props[key] !== null) {
              years.push(y);
              values.push(Number(props[key]));
            }
          }
          // Affiche le conteneur
          const container = document.getElementById('theatre-chart-container');
          container.style.display = 'block';

          // Titre dynamique
          const title = `Températures à ${props.nom_t || ''}`;
          // Calcul de la moyenne
          let avg = null;
          if (values.length > 0) {
            avg = values.reduce((a, b) => a + b, 0) / values.length;
          }
          const subtitle = avg !== null ? `Température moyenne sur la période : ${avg.toFixed(1)} °C` : '';

          // Détruit l'ancien graphique si besoin
          if(window.theatreChartInstance) window.theatreChartInstance.destroy();

          // Création du graphique
          const ctx = document.getElementById('theatre-chart').getContext('2d');

// Fonction utilitaire pour la couleur selon la température
function getTempColor(temp) {
  // 30°C = bleu, 47°C = rouge
  if (typeof temp !== 'number' || isNaN(temp)) return '#888';
  const t = Math.max(0, Math.min(1, (temp-30)/(47-30)));
  // Interpolation RGB du bleu (30°C) au rouge (47°C)
  const r = Math.round(30 + t * (220-30)); // de 30 à 220
  const g = Math.round(100 + t * (30-100)); // de 100 à 30
  const b = Math.round(220 + t * (50-220)); // de 220 à 50
  return `rgb(${r},${g},${b})`;
}

// Plugin annotation pour la ligne 38°C
const annotation38Plugin = {
  id: 'annotation38',
  afterDraw: function(chart) {
    const y38 = chart.scales.y.getPixelForValue(38);
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '12px Montserrat,Arial,sans-serif';
    ctx.fillStyle = '#888';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const text = 'T°C moy = 38°C';
    const x = chart.scales.x.left + 8;
    const y = y38 + 6; // légèrement sous la ligne pour ne pas gêner
    ctx.globalAlpha = 1;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
};


          window.theatreChartInstance = new Chart(ctx, {
  plugins: [annotation38Plugin],
            type: 'line',
            data: {
              labels: years,
              datasets: [{
                label: 'Température (°C)',
                data: values.map(v => v !== null && !isNaN(v) ? Number(v.toFixed(1)) : null),
                fill: false,
                pointRadius: 7,
                pointHoverRadius: 12,
                borderWidth: 3,
                tension: 0.25,
                showLine: true,
                // Couleurs conditionnelles pour chaque point
                pointBackgroundColor: values.map(v => getTempColor(v)),
                pointBorderColor: values.map(v => getTempColor(v)),
                borderColor: function(context) {
                  // Couleur de la ligne segment par segment
                  const index = context.p0DataIndex;
                  const v1 = values[index];
                  const v2 = values[index+1];
                  if (v1 !== undefined && v2 !== undefined) {
                    // Dégradé entre les deux points
                    return getTempColor((v1+v2)/2);
                  }
                  return getTempColor(v1);
                }
              },
              {
                label: 'Moyenne globale (38 °C)',
                data: years.map(() => 38),
                fill: false,
                borderColor: '#999',
                borderDash: [6,4],
                borderWidth: 2,
                pointRadius: 0,
                tension: 0
              }],



            },
            options: {
              responsive: false,
              animation: {
                duration: 1200,
                easing: 'easeOutQuart'
              },
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: title,
                  color: '#222',
                  font: { size: 22, weight: 'bold', family: 'Montserrat,Arial,sans-serif' }
                },
                subtitle: {
                  display: !!subtitle,
                  text: subtitle,
                  color: '#444',
                  font: { size: 16, weight: 'normal', family: 'Montserrat,Arial,sans-serif' },
                  padding: {top: 6, bottom: 10}
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return ` ${context.parsed.y.toFixed(1)} °C`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  title: { display: true, text: 'Année', color: '#666', font: {weight:'bold'} },
                  ticks: { color: '#222', font: {size:15} },
                  grid: { display: false }
                },
                y: {
                  title: { display: true, text: 'Températures\nen juillet (°C)', color: '#666', font: {weight:'bold'} },
                  ticks: { color: '#222', font: {size:15} },
                  grid: { color: 'rgba(200,200,200,0.12)' },
                  suggestedMin: Math.min(...values)-1,
                  suggestedMax: Math.max(...values)+1
                }
              }
            }
          });
        });

        // Bouton de fermeture du graphique
        if (!window.theatreChartCloseInit) {
          document.getElementById('close-chart-btn').onclick = function() {
            document.getElementById('theatre-chart-container').style.display = 'none';
          };
          window.theatreChartCloseInit = true;
        }
      }
    });
    // Affiche la couche après 1 seconde
    setTimeout(() => {
      if (theatresToggle && theatresToggle.checked) {
        theatresLayer.addTo(map);
        theatresLayer.bringToFront();
      }
    }, 2500);
  });

// Contrôle d'affichage de la couche théâtres
let theatresToggle = document.getElementById('theatres-toggle');
document.addEventListener('DOMContentLoaded', function() {
  if (theatresToggle) {
    theatresToggle.addEventListener('change', function() {
      if (this.checked) {
        if (theatresLayer) {
          theatresLayer.addTo(map);
          theatresLayer.bringToFront();
          communesLayer && communesLayer.bringToBack();
          directionsLayer && directionsLayer.bringToBack();
          isochronesLayer && isochronesLayer.bringToBack();
          matriceODLayer && matriceODLayer.bringToBack();
        }
      } else {
        if (theatresLayer) map.removeLayer(theatresLayer);
      }
    });
  }
});

// Animation de zoom : centre France -> Avignon après 0,5s
setTimeout(() => {
    map.flyTo([43.96762, 4.80899], 12, {
        animate: true,
        duration: 2
    });
}, 500);

// --- Ajout des couches GeoJSON directions, isochrones, matrice OD ---
let directionsLayer, isochronesLayer, matriceODLayer;

const directionsUrl = 'https://raw.githubusercontent.com/Mercatorien/ICU_FESTIVAL_AVIGNON/b270e722dcc5284e93969dd42613c426bd1563c4/geodata/directions.geojson';
const isochronesUrl = 'https://raw.githubusercontent.com/Mercatorien/ICU_FESTIVAL_AVIGNON/b270e722dcc5284e93969dd42613c426bd1563c4/geodata/isochrones.geojson';
const matriceODUrl = 'https://raw.githubusercontent.com/Mercatorien/ICU_FESTIVAL_AVIGNON/b270e722dcc5284e93969dd42613c426bd1563c4/geodata/matrice_od.geojson';

function addLayerWithToggle(url, style, toggleId, layerRefName) {
  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      // Permettre un style dynamique par feature (fonction ou objet)
      let options = {};
      if (typeof style === 'function') {
        options.style = style;
      } else if (style) {
        options.style = () => style;
      }
      const layer = L.geoJSON(data, options);
      // N'ajoute pas la couche par défaut
      const toggle = document.getElementById(toggleId);
      if (toggle && toggle.checked) {
        layer.addTo(map);
        layer.bringToFront();
      }
      // Masquage/affichage via toggle
      if (toggle) {
        toggle.addEventListener('change', function() {
          if (this.checked) {
            layer.addTo(map);
            layer.bringToFront();
            // Toujours garder les théâtres au-dessus
            if (theatresLayer && map.hasLayer(theatresLayer)) {
              theatresLayer.bringToFront();
            }
          } else {
            map.removeLayer(layer);
          }
        });
      }
      // Stocke la référence pour usage ultérieur
      if (layerRefName && typeof layerRefName === 'string') {
        window[layerRefName] = layer;
      }
    });
}

// Couche directions avec double style pour contour blanc
function addDirectionsLayerWithOutline(url, toggleId, layerRefName) {
  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      // Contour blanc épais
      const outline = L.geoJSON(data, {
        style: {color:'#fff',weight:5,opacity:1}
      });
      // Ligne principale grise
      const main = L.geoJSON(data, {
        style: {color:'#404040',weight:2,fillOpacity:0.8}
      });
      // Ajout/Retrait selon toggle
      const toggle = document.getElementById(toggleId);
      function addBoth() {
        outline.addTo(map);
        main.addTo(map);
        main.bringToFront();
        if (theatresLayer && map.hasLayer(theatresLayer)) {
          theatresLayer.bringToFront();
        }
      }
      function removeBoth() {
        map.removeLayer(outline);
        map.removeLayer(main);
      }
      if (toggle && toggle.checked) addBoth();
      if (toggle) {
        toggle.addEventListener('change', function() {
          if (this.checked) addBoth();
          else removeBoth();
        });
      }
      // Stocke la référence principale
      if (layerRefName && typeof layerRefName === 'string') {
        window[layerRefName] = main;
      }
    });
}

addDirectionsLayerWithOutline(directionsUrl, 'directions-toggle', 'directionsLayer');
// Ajout de la couche isochrones avec style dynamique selon DN
addLayerWithToggle(
  isochronesUrl,
  function(feature) {
    const dn = feature.properties.DN;
    let fillColor = '#ffffff'; // blanc par défaut
    if (dn >= 1 && dn <= 3) fillColor = '#e6f0ff'; // très clair
    else if (dn >= 4 && dn <= 6) fillColor = '#99c2e6';
    else if (dn >= 7 && dn <= 10) fillColor = '#4f91c6';
    else if (dn >= 11 && dn <= 13) fillColor = '#155fa0';
    else if (dn >= 14 && dn <= 16) fillColor = '#08306b'; // bleu foncé
    return {
      fillColor: fillColor,
      fillOpacity: 0.9,
      color: null, // pas de contour
      weight: 0,
      smoothFactor: 0 // Désactive la simplification Leaflet
    };
  },
  'isochrones-toggle',
  'isochronesLayer'
);
// Gestion de la couche matrice OD avec hitboxs améliorées
function addMatriceODWithHitbox(url, toggleId, layerRefName) {
  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      const hitboxes = [];
      const layer = L.geoJSON(data, {
        color:'#404040',
        weight:0.8,
        fillOpacity:0.8,
        onEachFeature: function(feature, l) {
          // Popup HTML
          const props = feature.properties;
          let distVal = (typeof props.distance_reseau === 'number') ? props.distance_reseau : parseFloat(props.distance_reseau);
let dist = (!isNaN(distVal)) ? (distVal/1000).toFixed(2) + ' kilomètres' : (props.distance_reseau || '');
let grav = (typeof props.GRAVITAIRE === 'number') ? props.GRAVITAIRE.toFixed(4) : (parseFloat(props.GRAVITAIRE) ? parseFloat(props.GRAVITAIRE).toFixed(4) : (props.GRAVITAIRE || ''));
let popupContent = `<div style='text-align:center;font-weight:bold;font-style:italic;font-size:1.15em;'>${props.origin_nom_t || ''} <br> ⇅ <br> ${props.destination_nom_t || ''}<br><br></div>`;
popupContent += `<div><strong>Distance réseau :</strong> ${dist}</div>`;
popupContent += `<div><strong>Gravitaire :</strong> ${grav}</div>`;
          l.bindPopup(popupContent);
          // Hitbox invisible épaisse
          const hitbox = L.geoJSON(feature, {
            style: {color: '#fff', weight: 15, opacity: 0, fillOpacity: 0},
            interactive: true
          });
          hitbox.on('click', function(e) {
            l.openPopup(e.latlng);
          });
          hitboxes.push(hitbox);
        }
      });
      // Fonctions d'affichage/masquage synchronisées
      function addAll() {
        layer.addTo(map);
        hitboxes.forEach(hb => hb.addTo(map));
        if (theatresLayer && map.hasLayer(theatresLayer)) {
          theatresLayer.bringToFront();
        }
      }
      function removeAll() {
        map.removeLayer(layer);
        hitboxes.forEach(hb => map.removeLayer(hb));
      }
      // Gestion du toggle
      const toggle = document.getElementById(toggleId);
      if (toggle && toggle.checked) addAll();
      if (toggle) {
        toggle.addEventListener('change', function() {
          if (this.checked) addAll();
          else removeAll();
        });
      }
      // Stocke la référence principale
      if (layerRefName && typeof layerRefName === 'string') {
        window[layerRefName] = layer;
      }
    });
}

addMatriceODWithHitbox(matriceODUrl, 'matriceod-toggle', 'matriceODLayer');

// --- Ajout de la couche GeoJSON des communes ---
let communesLayer;
setTimeout(() => {
  fetch('https://raw.githubusercontent.com/Mercatorien/MEMOIRE_MASSOT/73865c743217759a58666037f605f0c0d9117db6/communes.geojson')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      communesLayer = L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
          // Ajout des labels NOM
          if (feature.properties && feature.properties.NOM) {
            const center = layer.getBounds().getCenter();
            // Toute autre logique JS existante...

// Animation d'apparition harmonique des boutons principaux
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.memoire-btn, .github-btn, .zenodo-btn').forEach((btn) => {
    btn.classList.add('animated-btn');
  });
});

            const label = L.marker(center, {
              icon: L.divIcon({
                className: 'commune-label',
                html: feature.properties.NOM,
                iconSize: null
              }),
              interactive: false
            });
            label.addTo(map);
          }
        },
        style: function() {
          return {
            color: '#111', // contours noirs
            weight: 2,
            fillOpacity: 0,
            fill: false
          };
        }
      });
      communesLayer.addTo(map);
      communesLayer.bringToFront();
      // Gestion du toggle après que la couche est chargée
      const communesToggle = document.getElementById('communes-toggle');
      if (communesToggle) {
        communesToggle.addEventListener('change', function() {
          if (this.checked) {
            if (communesLayer) communesLayer.addTo(map);
            communesLayer && communesLayer.bringToFront();
          } else {
            if (communesLayer) map.removeLayer(communesLayer);
          }
        });
      }
    });
}, 2500);

// Gestion des erreurs de chargement de la couche
occupationSolLayer.on('loading', function() {
    console.log('Chargement de la couche d\'occupation du sol...');
});

occupationSolLayer.on('load', function() {
    console.log('Couche d\'occupation du sol chargée avec succès');
});

occupationSolLayer.on('tileerror', function(error, tile) {
    console.error('Erreur de chargement de la tuile:', error);
});

// Ajout de la couche d'occupation du sol
occupationSolLayer.addTo(map);

// Vérification de la visibilité de la couche
console.log('Visibilité de la couche d\'occupation du sol:', map.hasLayer(occupationSolLayer));

// 5. Case pour afficher/masquer la carte des probabilités
const cornToggleDiv = document.createElement('div');
cornToggleDiv.className = 'layer-control';
cornToggleDiv.innerHTML = `
    <label class="toggle-container" style="position: relative;">
        <input type="checkbox" id="corn-toggle">
        <span class="toggle-slider"></span>
        <span class="toggle-label">Carte des probabilités</span>
        <span class="info-icon" tabindex="0">
            <i class="fas fa-info-circle"></i>
        </span>
    </label>
`;
// Fonction pour générer la légende
function populateLegend() {
    const legendContainer = document.getElementById('legend');
    if (!legendContainer) return;
    legendContainer.innerHTML = '';

    // 3. Légende de l'occupation du sol
    // Création d'un conteneur grid pour la légende
    const legendGrid = document.createElement('div');
    legendGrid.className = 'legend-grid';

    // Deux colonnes de trois items chacune
    for (let col = 0; col < 2; col++) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'legend-column';
        for (let row = 0; row < 3; row++) {
            const index = col * 3 + row;
            if (legendConfig.labels[index]) {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                const colorBox = document.createElement('div');
                colorBox.className = 'legend-color';
                colorBox.style.backgroundColor = legendConfig.colors[index];
                const labelElement = document.createElement('span');
                labelElement.className = 'legend-label';
                labelElement.textContent = legendConfig.labels[index];
                legendItem.appendChild(colorBox);
                legendItem.appendChild(labelElement);
                columnDiv.appendChild(legendItem);
            }
        }
        legendGrid.appendChild(columnDiv);
    }
    legendContainer.appendChild(legendGrid);

    // --- Ajout image légende isochrones sous le switch ---
    // Trouve le toggle isochrones dans la légende et insère l'image juste après
    const isochronesToggle = document.getElementById('isochrones-toggle');
    if (isochronesToggle) {
      // On cible le parent direct du toggle dans la légende
      const parent = isochronesToggle.closest('.layer-control');
      if (parent) {
        // Vérifie si l'image n'existe pas déjà
        if (!parent.querySelector('.isochrones-legend-img')) {
          const img = document.createElement('img');
          img.src = 'https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/20b6400c92795cf895651e7a5ae54471f03a9a22/geodata/legende.png?raw=true';
          img.alt = 'Légende isochrones';
          img.className = 'isochrones-legend-img';
          img.style.display = 'block';
          img.style.maxWidth = '180px';
          img.style.margin = '0';
          img.style.float = 'left';
          parent.appendChild(img);
        }
      }
    }

    // 4. Trait horizontal gris
    const sep = document.createElement('hr');
    sep.style.border = 'none';
    sep.style.borderTop = '1px solid #444';
    sep.style.margin = '10px 0';
    legendContainer.appendChild(sep);

    // 5. Case pour afficher/masquer la carte des probabilités
    const cornToggleDiv = document.createElement('div');
    cornToggleDiv.className = 'layer-control';
    const label = document.createElement('label');
    label.className = 'toggle-container';
    label.style.position = 'relative';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'corn-toggle';
    label.appendChild(input);

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';
    label.appendChild(slider);

    const labelText = document.createElement('span');
    labelText.className = 'toggle-label';
    labelText.textContent = 'Carte des probabilités';
    label.appendChild(labelText);

    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';
    infoIcon.tabIndex = 0;
    const infoI = document.createElement('i');
    infoI.className = 'fas fa-info-circle';
    infoIcon.appendChild(infoI);
    label.appendChild(infoIcon);

    cornToggleDiv.appendChild(label);
    legendContainer.appendChild(cornToggleDiv);

    // Gestion dynamique du pop-up info carte des probabilités hors de l'îlot
    setTimeout(() => {
        const infoIcon = document.querySelector('.info-icon');
        if (infoIcon) {
            let popup = null;
            const popupHtml = `
                <div class="info-popup" id="proba-info-popup">
                    <div class="info-popup-content">
                        La carte des probabilité montre la probabilité d'appartenance maximale parmi les six classes, indiquant le niveau de confiance à accorder à la prédiction.
                        <img src='https://github.com/Mercatorien/MEMOIRE_MASSOT/blob/main/css/FCC_PROBA.png?raw=true' style='max-width: 450px; margin-top: 18px; border-radius: 4px;'>
                    </div>
                </div>`;
            function showPopup() {
                if (!popup) {
                    popup = document.createElement('div');
                    popup.innerHTML = popupHtml;
                    document.body.appendChild(popup.firstElementChild);
                }
                const popupEl = document.getElementById('proba-info-popup');
                if (popupEl) {
                    // Positionner à droite de la légende
                    const infoRect = infoIcon.getBoundingClientRect();
                    const panel = document.querySelector('.control-panel');
                    const panelRect = panel.getBoundingClientRect();
                    popupEl.style.display = 'block';
                    popupEl.style.position = 'fixed';
                    popupEl.style.left = (panelRect.right + 16) + 'px';
                    popupEl.style.top = (infoRect.top - 90) + 'px';
                    popupEl.style.transform = 'none';
                    popupEl.style.zIndex = 9999;
                }
            }
            function hidePopup() {
                const popupEl = document.getElementById('proba-info-popup');
                if (popupEl) {
                    popupEl.remove();
                }
                popup = null;
            }
            infoIcon.addEventListener('mouseenter', showPopup);
            infoIcon.addEventListener('focus', showPopup);
            infoIcon.addEventListener('mouseleave', hidePopup);
            infoIcon.addEventListener('blur', hidePopup);
            // Optionnel : fermer au clic partout
            document.addEventListener('click', function(e) {
                if (!infoIcon.contains(e.target) && document.getElementById('proba-info-popup')) {
                    hidePopup();
                }
            });
        }
    }, 0);

    // 6. Slider pour la transparence de la carte des probabilités
    const cornOpacityDiv = document.createElement('div');
    cornOpacityDiv.className = 'opacity-control';
    cornOpacityDiv.innerHTML = `
        <div class="opacity-row">
            <label for="corn-opacity" class="opacity-label">Opacité : <span id="corn-opacity-value">60</span>%</label>
            <input type="range" id="corn-opacity" min="0" max="100" value="60">
        </div>
    `;
    legendContainer.appendChild(cornOpacityDiv);

    // 7. Légende de la carte des probabilités (style harmonisé)
    const cornLegendValues = [
        { color: "#fa3308", label: "22&nbsp;%" },
        { color: "#00f51c", label: "100&nbsp;%" }
    ];
    const cornLegendRow = document.createElement('div');
cornLegendRow.className = 'legend-row';
cornLegendValues.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    const colorBox = document.createElement('span');
    colorBox.className = 'legend-color';
    colorBox.style.background = item.color;
    const label = document.createElement('span');
    label.className = 'legend-label';
    label.innerHTML = item.label;
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    cornLegendRow.appendChild(legendItem);
});
legendContainer.appendChild(cornLegendRow);

    // Trait horizontal gris entre la légende corn field et le bouton "Mon mémoire"
    const separator = document.createElement('hr');
    separator.className = 'legend-separator';
    legendContainer.appendChild(separator);


    // Lier les nouveaux contrôles (après insertion dans le DOM)
    setTimeout(() => {
        cornToggle = document.getElementById('corn-toggle');
        cornOpacityControl = document.getElementById('corn-opacity');
        cornOpacityValue = document.getElementById('corn-opacity-value');
        if (cornToggle && cornOpacityControl && cornOpacityValue) {
            cornToggle.checked = false;
            cornToggle.addEventListener('change', function() {
                if (this.checked) {
                    cornFieldLayer.addTo(map);
                    cornFieldLayer.bringToFront();
                } else {
                    map.removeLayer(cornFieldLayer);
                }
            });
            cornOpacityControl.value = 60;
            cornOpacityValue.textContent = '60';
            cornOpacityControl.addEventListener('input', function() {
                const opacity = this.value / 100;
                cornFieldLayer.setOpacity(opacity);
                cornOpacityValue.textContent = this.value;
            });
        }
    }, 0);
}

// Appelle populateLegend() seulement quand le DOM est prêt
window.addEventListener('DOMContentLoaded', function() {
  populateLegend();
  // Met à jour la légende à chaque changement du toggle isochrones
  const isochronesToggle = document.getElementById('isochrones-toggle');
  if (isochronesToggle) {
    isochronesToggle.addEventListener('change', populateLegend);
  }
});

// Gestionnaire d'événements pour le toggle de la couche
rasterToggle.addEventListener('change', function() {
    if (this.checked) {
        occupationSolLayer.addTo(map);
        occupationSolLayer.bringToFront();
    } else {
        map.removeLayer(occupationSolLayer);
    }
});

// Gestionnaire d'événements pour le contrôle d'opacité
opacityControl.value = 60;
opacityValue.textContent = '60';

opacityControl.addEventListener('input', function() {
    const opacity = this.value / 100;
    occupationSolLayer.setOpacity(opacity);
    opacityValue.textContent = this.value;
});

// S'assurer que la couche reste visible à tous les niveaux de zoom
map.on('zoomend', function() {
    if (rasterToggle.checked && !map.hasLayer(occupationSolLayer)) {
        occupationSolLayer.addTo(map);
        occupationSolLayer.bringToFront();
    }
});

// Mettre à jour l'ordre d'affichage lors du déplacement de la carte
function updateLayerOrder() {
    if (rasterToggle.checked) {
        occupationSolLayer.bringToFront();
    }
}

// Mettre à jour l'ordre d'affichage lors du déplacement de la carte
map.on('moveend', function() {
    if (rasterToggle.checked) {
        occupationSolLayer.bringToFront();
    }
});

// Ajout du contrôle d'échelle
L.control.scale({
    imperial: false,
    position: 'bottomright'
}).addTo(map);

// Ajout de l'attribution personnalisée
const attribution = L.control.attribution({
    position: 'bottomleft'
});
attribution.addAttribution('N. Massot, 2025 | <a href="https://nicolasmassot.fr" target="_blank"></a>');
attribution.addTo(map);

// Initialisation de la légende


// Ajustement de la hauteur de la carte
function resizeMap() {
    const headerHeight = document.querySelector('header').offsetHeight;
    document.getElementById('map').style.height = `calc(100vh - ${headerHeight}px)`;
    map.invalidateSize();
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', resizeMap);
resizeMap();

// --- Légende avancée (occupation du sol + isochrones) ---


function populateLegend() {
  const legendContainer = document.getElementById('legend');
  if (!legendContainer) return;
  legendContainer.innerHTML = '';

  // Occupation du sol
  const legendGrid = document.createElement('div');
  legendGrid.className = 'legend-grid';
  for (let col = 0; col < 2; col++) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'legend-column';
    for (let row = 0; row < 3; row++) {
      const index = col * 3 + row;
      if (legendConfig.labels[index]) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = legendConfig.colors[index];
        const labelElement = document.createElement('span');
        labelElement.className = 'legend-label';
        labelElement.textContent = legendConfig.labels[index];
        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelElement);
        columnDiv.appendChild(legendItem);
      }
    }
    legendGrid.appendChild(columnDiv);
  }
  legendContainer.appendChild(legendGrid);

  // Titre isochrones
  const isochronesTitle = document.createElement('div');
  isochronesTitle.className = 'legend-label';
  isochronesTitle.style.fontWeight = 'bold';
  isochronesTitle.style.marginTop = '12px';
  isochronesTitle.style.marginBottom = '4px';
  isochronesTitle.textContent = 'Nb de théâtres accessibles en 15mn à pied';
  legendContainer.appendChild(isochronesTitle);

  // Grille isochrones
  const isochronesGrid = document.createElement('div');
  isochronesGrid.className = 'legend-grid';
  isochronesGrid.style.gap = '6px';
  isochronesGrid.style.justifyContent = 'flex-start';
  isochronesLegend.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = item.color;
    const labelElement = document.createElement('span');
    labelElement.className = 'legend-label';
    labelElement.textContent = item.label;
    legendItem.appendChild(colorBox);
    legendItem.appendChild(labelElement);
    isochronesGrid.appendChild(legendItem);
  });
  legendContainer.appendChild(isochronesGrid);

  // Séparateur
  const sep = document.createElement('hr');
  sep.style.border = 'none';
  sep.style.borderTop = '1px solid #444';
  sep.style.margin = '10px 0';
  legendContainer.appendChild(sep);
}

window.addEventListener('DOMContentLoaded', populateLegend);

// Afficher le niveau de zoom actuel dans la console
map.on('zoomend', function() {
    console.log('Niveau de zoom actuel:', map.getZoom());
});

// Afficher le niveau de zoom initial
console.log('Niveau de zoom initial:', map.getZoom());
