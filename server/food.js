const { FOOD_TYPES, MAP_WIDTH, MAP_HEIGHT } = require('./config');

let nextFoodId = 1;

function getSpawnY(type) {
  switch (type) {
    case 'berry':
      return MAP_HEIGHT - 180 + Math.random() * 160;
    case 'insect':
      return 150 + Math.random() * (MAP_HEIGHT - 450);
    case 'star':
      return 10 + Math.random() * 390;
    case 'orb':
      return Math.random() * MAP_HEIGHT;
    default:
      return Math.random() * MAP_HEIGHT;
  }
}

class Food {
  constructor(type) {
    this.id = nextFoodId++;
    this.type = type.type;
    this.x = Math.random() * MAP_WIDTH;
    this.y = getSpawnY(this.type);
    this.size = type.size;
    this.color = type.color;
    this.xp = type.xp;
  }

  static random() {
    return new Food(FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)]);
  }

  serialize() {
    return {
      id: this.id,
      x: Math.round(this.x * 10) / 10,
      y: Math.round(this.y * 10) / 10,
      type: this.type,
      size: this.size,
      color: this.color,
    };
  }
}

module.exports = Food;
