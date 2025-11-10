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

### Steps

Map Setup

[x] Copy main.ts to reference.ts for future reference

[x] Initialize a Leaflet map centered on the classroom location

[x] Draw a marker for the player’s location

[x] Add an interaction radius circle around the player

[x] Draw a single grid cell (rectangle) centered on the player’s location

[x] Write a helper function to draw a rectangle for any given cell coordinate

[x] Use nested loops to draw a grid of cells covering the visible map area

[x] Redraw the grid on map movement (moveend) without duplicates

[] Add labels or markers to each cell for displaying token content

Token Generation

[x] Use the luck() function to generate deterministic token values per cell

[x] Display token values (e.g., 0, 2, 4) as text in each cell

[] Ensure token distribution stays the same between reloads

[] Store cell data (id, lat, lng, tokenValue) for later gameplay logic

Interaction & Inventory

[] Limit interaction to cells within ~3 cells of the player’s position

[] Implement click handling for grid cells

[] Picking up a token removes it from the cell

[] Display the held token value clearly on-screen (inventory UI)

[] Prevent picking up more than one token at a time

[] Allow placing a held token on another token of equal value

[] When equal tokens merge, replace them with a new token of double value

Crafting & Win Condition

[] Update the cell and inventory state after crafting

[] Store changes persistently in localStorage so state survives reloads

[] Detect when the player holds a token of value 8 or 16

[] Display a win message or visual cue when the goal is achieved

Polish

[] Clear and redraw the grid efficiently on zoom/pan

[] Add visual feedback (e.g., color tint for interactive range)

[] Style the token markers using CSS for readability

[] Clean up performance and commit final D3.a version
