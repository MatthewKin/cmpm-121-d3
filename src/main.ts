// @deno-types="npm:@types/leaflet"

// Style sheets
import "leaflet/dist/leaflet.css"; // supporting style for Leaflet
import "./style.css"; // student-controlled page style

// Fix missing marker images
import "./_leafletWorkaround.ts"; // fixes for missing Leaflet images

// @deno-types="npm:@types/leaflet"
import leaflet from "leaflet";
import luck from "./_luck.ts"; // deterministic token generator

// -----------------------
// Constants & Parameters
// -----------------------
const TILE_DEGREES = 0.0001; // size of each grid cell
const GAMEPLAY_ZOOM_LEVEL = 19; // fixed zoom level
const INTERACTION_RADIUS_CELLS = 3; // how far the player can interact
const PLAYER_LATLNG = leaflet.latLng(36.997936938057016, -122.05703507501151);

// -----------------------
// Map Setup
// -----------------------
const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

const map = leaflet.map(mapDiv, {
  center: PLAYER_LATLNG,
  zoom: GAMEPLAY_ZOOM_LEVEL,
  minZoom: GAMEPLAY_ZOOM_LEVEL,
  maxZoom: GAMEPLAY_ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
});

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

// -----------------------
// Player Marker & Interaction Circle
// -----------------------
const playerMarker = leaflet.marker(PLAYER_LATLNG).addTo(map);
playerMarker.bindTooltip("omg thats you :D");

const INTERACTION_RADIUS_METERS = INTERACTION_RADIUS_CELLS * TILE_DEGREES *
  111_000;
const interactionCircle = leaflet.circle(PLAYER_LATLNG, {
  radius: INTERACTION_RADIUS_METERS,
  color: "blue",
  fillOpacity: 0.1,
});
interactionCircle.addTo(map);

// -----------------------
// Step 7: Token Generation
// -----------------------
function drawCell(i: number, j: number) {
  // Convert cell coordinates to lat/lng bounds
  const bounds = leaflet.latLngBounds([
    [
      PLAYER_LATLNG.lat + i * TILE_DEGREES,
      PLAYER_LATLNG.lng + j * TILE_DEGREES,
    ],
    [
      PLAYER_LATLNG.lat + (i + 1) * TILE_DEGREES,
      PLAYER_LATLNG.lng + (j + 1) * TILE_DEGREES,
    ],
  ]);

  // Generate deterministic token value using luck()
  const tokenValue = Math.pow(
    2,
    Math.floor(luck([i, j, "token"].toString()) * 4),
  );
  // tokenValue will be 1, 2, 4, or 8

  // Draw rectangle representing the cell
  const rect = leaflet.rectangle(bounds, {
    color: "gray",
    weight: 1,
    fillOpacity: 0.2,
  }).addTo(map);

  // Display token value at the center of the cell
  const center = bounds.getCenter();
  const tokenLabel = leaflet.tooltip({
    permanent: true,
    direction: "center",
    className: "token-label",
  })
    .setContent(tokenValue.toString())
    .setLatLng(center);

  rect.bindTooltip(tokenLabel);
}

// -----------------------
// Draw grid around player
// -----------------------
const GRID_RADIUS = 4; // how many cells to draw in each direction from player

for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
  for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
    drawCell(i, j);
  }
}

// -----------------------
// Step 8: Redraw grid on map movement
// -----------------------

// Keep track of already drawn cells by their i,j keys
const drawnCells = new Set<string>();

function drawVisibleGrid() {
  const bounds = map.getBounds();
  const minLat = bounds.getSouth();
  const maxLat = bounds.getNorth();
  const minLng = bounds.getWest();
  const maxLng = bounds.getEast();

  const minI = Math.floor((minLat - PLAYER_LATLNG.lat) / TILE_DEGREES);
  const maxI = Math.ceil((maxLat - PLAYER_LATLNG.lat) / TILE_DEGREES);
  const minJ = Math.floor((minLng - PLAYER_LATLNG.lng) / TILE_DEGREES);
  const maxJ = Math.ceil((maxLng - PLAYER_LATLNG.lng) / TILE_DEGREES);

  for (let i = minI; i <= maxI; i++) {
    for (let j = minJ; j <= maxJ; j++) {
      const key = `${i},${j}`;
      if (!drawnCells.has(key)) {
        drawCell(i, j);
        drawnCells.add(key);
      }
    }
  }
}

// Initially draw the visible grid
drawVisibleGrid();

// Redraw whenever the map is moved
map.on("moveend", drawVisibleGrid);

// -----------------------
//all previous code commented out so i can reference
// // Create basic UI elements

// const controlPanelDiv = document.createElement("div");
// controlPanelDiv.id = "controlPanel";
// document.body.append(controlPanelDiv);

// const mapDiv = document.createElement("div");
// mapDiv.id = "map";
// document.body.append(mapDiv);

// const statusPanelDiv = document.createElement("div");
// statusPanelDiv.id = "statusPanel";
// document.body.append(statusPanelDiv);

// // Our classroom location
// const CLASSROOM_LATLNG = leaflet.latLng(
//   36.997936938057016,
//   -122.05703507501151,
// );

// // Tunable gameplay parameters
// const GAMEPLAY_ZOOM_LEVEL = 19;
// const TILE_DEGREES = 1e-4;
// const NEIGHBORHOOD_SIZE = 8;
// const CACHE_SPAWN_PROBABILITY = 0.1;

// // Create the map (element with id "map" is defined in index.html)
// const map = leaflet.map(mapDiv, {
//   center: CLASSROOM_LATLNG,
//   zoom: GAMEPLAY_ZOOM_LEVEL,
//   minZoom: GAMEPLAY_ZOOM_LEVEL,
//   maxZoom: GAMEPLAY_ZOOM_LEVEL,
//   zoomControl: false,
//   scrollWheelZoom: false,
// });

// // Populate the map with a background tile layer
// leaflet
//   .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     maxZoom: 19,
//     attribution:
//       '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//   })
//   .addTo(map);

// // Add a marker to represent the player
// const playerMarker = leaflet.marker(CLASSROOM_LATLNG);
// playerMarker.bindTooltip("That's you!");
// playerMarker.addTo(map);

// // Display the player's points
// let playerPoints = 0;
// statusPanelDiv.innerHTML = "No points yet...";

// // Add caches to the map by cell numbers
// function spawnCache(i: number, j: number) {
//   // Convert cell numbers into lat/lng bounds
//   const origin = CLASSROOM_LATLNG;
//   const bounds = leaflet.latLngBounds([
//     [origin.lat + i * TILE_DEGREES, origin.lng + j * TILE_DEGREES],
//     [origin.lat + (i + 1) * TILE_DEGREES, origin.lng + (j + 1) * TILE_DEGREES],
//   ]);

//   // Add a rectangle to the map to represent the cache
//   const rect = leaflet.rectangle(bounds);
//   rect.addTo(map);

//   // Handle interactions with the cache
//   rect.bindPopup(() => {
//     // Each cache has a random point value, mutable by the player
//     let pointValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);

//     // The popup offers a description and button
//     const popupDiv = document.createElement("div");
//     popupDiv.innerHTML = `
//                 <div>There is a cache here at "${i},${j}". It has value <span id="value">${pointValue}</span>.</div>
//                 <button id="poke">poke</button>`;

//     // Clicking the button decrements the cache's value and increments the player's points
//     popupDiv
//       .querySelector<HTMLButtonElement>("#poke")!
//       .addEventListener("click", () => {
//         pointValue--;
//         popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
//           pointValue.toString();
//         playerPoints++;
//         statusPanelDiv.innerHTML = `${playerPoints} points accumulated`;
//       });

//     return popupDiv;
//   });
// }

// // Look around the player's neighborhood for caches to spawn
// for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
//   for (let j = -NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
//     // If location i,j is lucky enough, spawn a cache!
//     if (luck([i, j].toString()) < CACHE_SPAWN_PROBABILITY) {
//       spawnCache(i, j);
//     }
//   }
// }
