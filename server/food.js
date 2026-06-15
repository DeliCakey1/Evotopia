const { FOOD_TYPES, MAP_WIDTH, MAP_HEIGHT } = require('./config');

let nextFoodId = 1;

class Food {
  constructor(type) {
    this.id = nextFoodId++;
    this.type = type.type;
    this.x = Math.random() * MAP_WIDTH;
    this.y = Math.random() * MAP_HEIGHT;
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
