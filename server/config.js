const EVOLUTION_TIERS = [
  { name: 'Worm',     size: 14,  speed: 2.2, xpToNext: 15,  color: '#7BC67E' },
  { name: 'Mouse',    size: 18,  speed: 2.8, xpToNext: 40,  color: '#B0A8A0' },
  { name: 'Rabbit',   size: 24,  speed: 3.2, xpToNext: 80,  color: '#C4A882' },
  { name: 'Fox',      size: 30,  speed: 3.8, xpToNext: 150, color: '#E8833A' },
  { name: 'Wolf',     size: 36,  speed: 4.2, xpToNext: 250, color: '#7A7A7A' },
  { name: 'Bear',     size: 44,  speed: 4.0, xpToNext: 400, color: '#5D4037' },
  { name: 'Dragon',   size: 52,  speed: 4.5, xpToNext: -1,  color: '#7B2D8E' },
];

const FOOD_TYPES = [
  { type: 'seed',   xp: 1, size: 5,  color: '#8B6914' },
  { type: 'berry',  xp: 2, size: 7,  color: '#DC3494' },
  { type: 'carrot', xp: 3, size: 9,  color: '#FF7722' },
  { type: 'meat',   xp: 5, size: 11, color: '#CC2233' },
];

const MAP_WIDTH = 4000;
const MAP_HEIGHT = 4000;
const TICK_RATE = 20;
const MAX_FOOD = 300;
const INITIAL_FOOD = 150;
const FOOD_RESPAWN_PER_TICK = 0.2;
const EAT_RANGE = 0.6;

module.exports = {
  EVOLUTION_TIERS,
  FOOD_TYPES,
  MAP_WIDTH,
  MAP_HEIGHT,
  TICK_RATE,
  MAX_FOOD,
  INITIAL_FOOD,
  FOOD_RESPAWN_PER_TICK,
  EAT_RANGE,
};
