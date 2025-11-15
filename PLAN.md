# D3: World of Bits

## Game Design Vision

World of Bits is a map-based game where players explore a virtual grid, collect tokens from nearby locations, and craft higher-value tokens by merging equal tokens. The goal is to strategically gather and combine tokens to reach a target value, while interacting only within a limited range around the player's location.

## Technologies

- TypeScript for most game code, little to no explicit HTML, and all CSS collected in common `style.css` file
- Deno and Vite for building
- GitHub Actions + GitHub Pages for deployment automation

## Assignments

## D3.a: Core mechanics (token collection and crafting)

Key technical challenge: Can you assemble a map-based user interface using the Leaflet mapping framework?
Key gameplay challenge: Can players collect and craft tokens from nearby locations to finally make one of sufficiently high value?

### Steps D3.a

Map Setup

[x] Copy main.ts to reference.ts for future reference

[x] Initialize a Leaflet map centered on the classroom location

[x] Draw a marker for the player’s location

[x] Add an interaction radius circle around the player

[x] Draw a single grid cell (rectangle) centered on the player’s location

[x] Write a helper function to draw a rectangle for any given cell coordinate

[x] Use nested loops to draw a grid of cells covering the visible map area

[x] Redraw the grid on map movement (moveend) without duplicates

[x] Add labels or markers to each cell for displaying token content

Token Generation

[x] Use the luck() function to generate deterministic token values per cell

[x] Display token values (e.g., 0, 2, 4) as text in each cell

[x] Ensure token distribution stays the same between reloads

[x] Store cell data (id, lat, lng, tokenValue) for later gameplay logic

Interaction & Inventory

[x] Limit interaction to cells within ~3 cells of the player’s position

[x] Implement click handling for grid cells

[x] Picking up a token removes it from the cell

[x] Display the held token value clearly on-screen (inventory UI)

[x] Prevent picking up more than one token at a time

[x] Allow placing a held token on another token of equal value

[x] When equal tokens merge, replace them with a new token of double value

Crafting & Win Condition

[x] Update the cell and inventory state after crafting

[x] Store changes persistently in localStorage so state survives reloads

[x] Detect when the player holds a token of value 8 or 16

[x] Display a win message or visual cue when the goal is achieved

### D3.b Globe-spanning Gameplay

Player Movement (NSEW), movement should be exactly 1 cell
Keyboard inputs should be arrow keys to move player

### Steps D3.b

Map / Interface
[x] Add movement UI (N/S/E/W) that moves player by exactly one cell
[x] Allow keyboard arrow keys to move player by one cell
[x] Anchor the grid to Null Island (0,0) — earth-spanning coordinate system
[x] Cells spawn deterministically using luck() based on cell i,j
[x] Map redraws on moveend and when player moves
[x] Player marker & interaction circle update when player moves
[x] Cells are drawn with labels showing token values

Gameplay / Memory
[x] Cells are memoryless: when a cell leaves the visible screen it is removed
[x] Returning to a cell re-spawns it deterministically (so farming is possible)
[x] Interaction is limited to cells within INTERACTION_RADIUS_CELLS
[x] Picking up a token removes it from the cell (temporary)
[x] Merging equal tokens doubles the cell's token value
[x] Inventory UI displays the currently held token

Crafting & Win
[x] Increase crafting target (WIN_THRESHOLD = 32)
[x] Display a win message when held token >= WIN_THRESHOLD

Polish / Performance (optional)
[x] Add color tint to cells inside interaction range
[x] Final styling of token markers (CSS)
[x] Final D3.b commit & cleanup

### D3.c

Cells should appear to have a memory of their state that persists even when they are not visible on the map (but persistence across page loads is not yet required —see next assignment).

### Steps D3.c

Infrastructure

[x] Define CellCoord type (e.g., {i: number; j: number} or "i,j").

[x] Implement coordKey(i, j) → string helper.

[x] Create a global Map<string, CellMemento> to store modified cell states.

Flyweight Pattern

[x] When drawing the grid, create only the visual rectangles.

[x] Do not store unmodified cells in the Map.

[x] Only store modified cells (changed token, color, etc.).

Memento Pattern

[x] Define CellMemento holding minimal needed info (tokenValue, maybe fillOpacity, color).

[x] When a player modifies a cell, store a memento in the Map.

[x] Apply the visual change immediately on screen.

Redrawing Cells on Map Move

[x] On map movement, clear existing rectangles.

[x] Recompute visible bounds.

[x] Redraw all visible cells fresh.

[x] For each cell, check if coordKey exists in Map:

If yes → restore that state

If no → draw default deterministic state

### D3.d

Geolocation-based player movement (moving IRL moves the in-game player).
A Facade interface for movement so the rest of the game doesn’t care how the player moved.
localStorage for complete persistence across page reloads (already partly implemented).

Runtime or query-string choice between:
geolocation movement
button/keyboard movement
Option to start a new game

### Steps D3.d

[x] Create the Movement Facade

[x] Define interface:

[x] Wrap existing button/keyboard movement

[x] Implement GeolocationMovementController

Replace direct movement with controller calls

[x] Remove direct arrow-key → movePlayer() links

[x] Implement geolocation movement logic

[] Track last-known physical position

[] Convert real lat/lng → world grid cell (i,j)

[] On change of cell, call existing movePlayer(di, dj)

[x] Add “Start New Game” system
