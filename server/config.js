const EVOLUTION_TIERS = [
  { name: 'Sparrow', size: 16, speed: 3.5, xpToNext: 15,   color: '#8B7355', eats: ['insect','berry','seed'] },
  { name: 'Robin',   size: 19, speed: 4.0, xpToNext: 40,   color: '#C46040', eats: ['insect','berry','worm'] },
  { name: 'Crow',    size: 22, speed: 4.5, xpToNext: 100,  color: '#2F2F2F', eats: ['insect','seed','berry','worm','carrion','prey'] },
  { name: 'Falcon',  size: 26, speed: 5.0, xpToNext: 200,  color: '#6B7B8B', eats: ['prey'] },
  { name: 'Hawk',    size: 30, speed: 5.5, xpToNext: 400,  color: '#C4A060', eats: ['prey','carrion'] },
  { name: 'Vulture', size: 34, speed: 6.0, xpToNext: 600,  color: '#4A3A2A', eats: ['carrion'] },
  { name: 'Eagle',   size: 38, speed: 6.5, xpToNext: 1000, color: '#4A3728', eats: ['prey','fish','carrion'] },
  { name: 'Phoenix', size: 46, speed: 7.5, xpToNext: 1600, color: '#FF6633', eats: ['insect','berry','seed','worm','prey','fish','carrion','star','orb'] },
  { name: 'Dragon',  size: 56, speed: 8.5, xpToNext: -1,   color: '#6B2FA0', eats: ['insect','berry','seed','worm','prey','fish','carrion','star','orb'] },
];

const FOOD_TYPES = [
  { type: 'insect',  xp: 1, size: 5,  color: '#A8D870' },
  { type: 'berry',   xp: 2, size: 10, color: '#FF6B9D' },
  { type: 'seed',    xp: 1, size: 4,  color: '#C8A860' },
  { type: 'worm',    xp: 2, size: 6,  color: '#E8A070' },
  { type: 'prey',    xp: 4, size: 10, color: '#8B4513' },
  { type: 'fish',    xp: 3, size: 9,  color: '#4A90D9' },
  { type: 'carrion', xp: 3, size: 8,  color: '#5A4A3A' },
  { type: 'star',    xp: 3, size: 9,  color: '#FFD700' },
  { type: 'orb',     xp: 5, size: 11, color: '#9B59B6' },
];

const MAP_WIDTH = 6000;
const MAP_HEIGHT = 2500;
const TICK_RATE = 16;
const MAX_FOOD = 400;
const INITIAL_FOOD = 200;
const FOOD_RESPAWN_PER_TICK = 0.3;

const GRAVITY = 0.12;
const FLAP_VELOCITY = 12;
const THRUST = 0.20;
const DIVE_SPEED = 0.25;
const DRAG = 0.95;

// Map features
const BUSH_COUNT = 50;
const WATER_ZONE_COUNT = 4;
const BURROW_COUNT = 20;

module.exports = {
  EVOLUTION_TIERS,
  FOOD_TYPES,
  MAP_WIDTH,
  MAP_HEIGHT,
  TICK_RATE,
  MAX_FOOD,
  INITIAL_FOOD,
  FOOD_RESPAWN_PER_TICK,
  GRAVITY,
  FLAP_VELOCITY,
  THRUST,
  DIVE_SPEED,
  DRAG,
  BUSH_COUNT,
  WATER_ZONE_COUNT,
  BURROW_COUNT,
};
