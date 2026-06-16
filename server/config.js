const EVOLUTION_TIERS = [
  { name: 'Sparrow', size: 16, speed: 3.5, xpToNext: 15,   color: '#8B7355' },
  { name: 'Robin',   size: 19, speed: 4.0, xpToNext: 40,   color: '#C46040' },
  { name: 'Crow',    size: 22, speed: 4.5, xpToNext: 100,  color: '#2F2F2F' },
  { name: 'Falcon',  size: 26, speed: 5.0, xpToNext: 200,  color: '#6B7B8B' },
  { name: 'Hawk',    size: 30, speed: 5.5, xpToNext: 400,  color: '#C4A060' },
  { name: 'Vulture', size: 34, speed: 6.0, xpToNext: 600,  color: '#4A3A2A' },
  { name: 'Eagle',   size: 38, speed: 6.5, xpToNext: 1000, color: '#4A3728' },
  { name: 'Phoenix', size: 46, speed: 7.5, xpToNext: 1600, color: '#FF6633' },
  { name: 'Dragon',  size: 56, speed: 8.5, xpToNext: -1,   color: '#6B2FA0' },
];

const FOOD_TYPES = [
  { type: 'insect', xp: 1, size: 5,  color: '#A8D870' },
  { type: 'berry',  xp: 2, size: 10, color: '#FF6B9D' },
  { type: 'star',   xp: 3, size: 9,  color: '#FFD700' },
  { type: 'orb',    xp: 5, size: 11, color: '#9B59B6' },
];

const MAP_WIDTH = 6000;
const MAP_HEIGHT = 2500;
const TICK_RATE = 16;
const MAX_FOOD = 300;
const INITIAL_FOOD = 150;
const FOOD_RESPAWN_PER_TICK = 0.2;
const EAT_RANGE = 0.6;

const GRAVITY = 0.12;
const FLAP_VELOCITY = 12;
const THRUST = 0.20;
const DIVE_SPEED = 0.25;
const DRAG = 0.95;

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
  GRAVITY,
  FLAP_VELOCITY,
  THRUST,
  DIVE_SPEED,
  DRAG,
};
