// @deno-types="npm:@types/leaflet"
import leaflet from "leaflet";
import luck from "./_luck.ts";

import "leaflet/dist/leaflet.css";
import "./_leafletWorkaround.ts";
import "./style.css";

// -----------------------
// Constants
// -----------------------
const TILE_DEGREES = 0.0001;
const GAMEPLAY_ZOOM_LEVEL = 19;
const INTERACTION_RADIUS_CELLS = 3;
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

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// -----------------------
// Player Marker & Interaction Circle
// -----------------------
leaflet.marker(PLAYER_LATLNG).addTo(map).bindTooltip("omg thats you :D");

const INTERACTION_RADIUS_METERS = INTERACTION_RADIUS_CELLS * TILE_DEGREES *
  111_000;
leaflet.circle(PLAYER_LATLNG, {
  radius: INTERACTION_RADIUS_METERS,
  color: "blue",
  fillOpacity: 0.1,
}).addTo(map);

// -----------------------
// Grid & Cells
// -----------------------
type Cell = {
  i: number;
  j: number;
  tokenValue: number;
  rect: leaflet.Rectangle;
};
const cells: Cell[] = [];
const drawnCells = new Set<string>();
let heldToken: { value: number } | null = null;

// Inventory UI
const inventoryDiv = document.createElement("div");
Object.assign(inventoryDiv.style, {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "8px 12px",
  backgroundColor: "rgba(0,0,0,0.7)",
  color: "white",
  fontFamily: "sans-serif",
  fontSize: "16px",
  borderRadius: "6px",
  zIndex: "1000",
});
inventoryDiv.innerText = "Held Token: None";
document.body.appendChild(inventoryDiv);

function updateInventoryUI() {
  inventoryDiv.innerText = heldToken
    ? `Held Token: ${heldToken.value}`
    : "Held Token: None";
  checkWinCondition();
}

// -----------------------
// Save/Load
// -----------------------
function saveGameState() {
  const state = cells.map((c) => ({
    i: c.i,
    j: c.j,
    tokenValue: c.tokenValue,
  }));
  localStorage.setItem("cells", JSON.stringify(state));
  localStorage.setItem("heldToken", JSON.stringify(heldToken));
}

function loadGameState() {
  const savedCells = JSON.parse(localStorage.getItem("cells") || "[]");
  const savedHeldToken = JSON.parse(
    localStorage.getItem("heldToken") || "null",
  );
  if (savedHeldToken) heldToken = savedHeldToken;

  for (const sc of savedCells) {
    const cell = cells.find((c) => c.i === sc.i && c.j === sc.j);
    if (cell) {
      cell.tokenValue = sc.tokenValue;
      const center = cell.rect.getBounds().getCenter();
      cell.rect.unbindTooltip();
      cell.rect.bindTooltip(
        leaflet.tooltip({
          permanent: true,
          direction: "center",
          className: "token-label",
        }).setContent(cell.tokenValue.toString()).setLatLng(center),
      );
    }
  }

  updateInventoryUI();
}

// -----------------------
// Win Condition
// -----------------------
function checkWinCondition() {
  if (heldToken && (heldToken.value === 8 || heldToken.value === 16)) {
    if (!document.getElementById("winMessage")) {
      const winDiv = document.createElement("div");
      winDiv.id = "winMessage";
      Object.assign(winDiv.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px 40px",
        backgroundColor: "rgba(0,128,0,0.8)",
        color: "white",
        fontSize: "32px",
        fontFamily: "sans-serif",
        borderRadius: "12px",
        zIndex: "2000",
      });
      winDiv.innerText = "You crafted a high-value token! 🎉";
      document.body.appendChild(winDiv);
    }
  }
}

// -----------------------
// Draw Cell
// -----------------------
function drawCell(i: number, j: number): Cell {
  const tokenValue = Math.floor(luck([i, j, "initialValue"].toString()) * 4) *
    2;
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

  const rect = leaflet.rectangle(bounds, {
    color: "gray",
    weight: 1,
    fillOpacity: 0.2,
  }).addTo(map);
  const center = bounds.getCenter();
  rect.bindTooltip(
    leaflet.tooltip({
      permanent: true,
      direction: "center",
      className: "token-label",
    })
      .setContent(tokenValue.toString()).setLatLng(center),
  );

  const cell: Cell = { i, j, tokenValue, rect };
  cells.push(cell);
  drawnCells.add(`${i},${j}`);
  return cell;
}

// -----------------------
// Interaction
// -----------------------
function isNearbyCell(i: number, j: number) {
  return Math.abs(i) <= INTERACTION_RADIUS_CELLS &&
    Math.abs(j) <= INTERACTION_RADIUS_CELLS;
}

function drawCellWithInteraction(i: number, j: number) {
  const cell = drawCell(i, j);
  cell.rect.on("click", () => {
    if (!isNearbyCell(i, j)) return;

    // Merge
    if (heldToken && cell.tokenValue > 0) {
      if (cell.tokenValue === heldToken.value) {
        cell.tokenValue *= 2;
        heldToken = null;
        cell.rect.setStyle({ fillOpacity: 0.4 });
        const center = cell.rect.getBounds().getCenter();
        cell.rect.unbindTooltip();
        cell.rect.bindTooltip(
          leaflet.tooltip({
            permanent: true,
            direction: "center",
            className: "token-label",
          })
            .setContent(cell.tokenValue.toString()).setLatLng(center),
        );
        updateInventoryUI();
        saveGameState();
        return;
      } else {
        console.log("Already holding a token!");
        return;
      }
    }

    // Pickup
    if (!heldToken && cell.tokenValue > 0) {
      heldToken = { value: cell.tokenValue };
      cell.tokenValue = 0;
      cell.rect.setStyle({ fillOpacity: 0.1 });
      const center = cell.rect.getBounds().getCenter();
      cell.rect.unbindTooltip();
      cell.rect.bindTooltip(
        leaflet.tooltip({
          permanent: true,
          direction: "center",
          className: "token-label",
        })
          .setContent(cell.tokenValue.toString()).setLatLng(center),
      );
      updateInventoryUI();
      saveGameState();
    }
  });
}

// -----------------------
// Initial Grid
// -----------------------
const GRID_RADIUS = 4;
for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
  for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
    drawCellWithInteraction(i, j);
  }
}

// -----------------------
// Draw Visible Grid
// -----------------------
function drawVisibleGrid() {
  const bounds = map.getBounds();
  const minI = Math.floor(
    (bounds.getSouth() - PLAYER_LATLNG.lat) / TILE_DEGREES,
  );
  const maxI = Math.ceil(
    (bounds.getNorth() - PLAYER_LATLNG.lat) / TILE_DEGREES,
  );
  const minJ = Math.floor(
    (bounds.getWest() - PLAYER_LATLNG.lng) / TILE_DEGREES,
  );
  const maxJ = Math.ceil((bounds.getEast() - PLAYER_LATLNG.lng) / TILE_DEGREES);

  for (let i = minI; i <= maxI; i++) {
    for (let j = minJ; j <= maxJ; j++) {
      const key = `${i},${j}`;
      if (!drawnCells.has(key)) {
        drawCellWithInteraction(i, j);
      }
    }
  }
}

map.on("moveend", drawVisibleGrid);
drawVisibleGrid();

// -----------------------
// Load Previous State
// -----------------------
loadGameState();

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
