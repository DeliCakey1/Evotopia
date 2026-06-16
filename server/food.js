const { FOOD_TYPES, MAP_WIDTH, MAP_HEIGHT } = require('./config');

let nextFoodId = 1;

class Food {
  constructor(typeDef, trees) {
    this.id = nextFoodId++;
    this.type = typeDef.type;

    const pos = this.getSpawnPosition(typeDef.type, trees);
    this.x = pos.x;
    this.y = pos.y;

    this.size = typeDef.size;
    this.color = typeDef.color;
    this.xp = typeDef.xp;
  }

  getSpawnPosition(type, trees) {
    switch (type) {
      case 'berry':
        if (trees && trees.length > 0) {
          const tree = trees[Math.floor(Math.random() * trees.length)];
          return tree.getBerryPosition();
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 100 };
      case 'insect':
        return {
          x: Math.random() * MAP_WIDTH,
          y: 150 + Math.random() * (MAP_HEIGHT - 450),
        };
      case 'star':
        return {
          x: Math.random() * MAP_WIDTH,
          y: 10 + Math.random() * 390,
        };
      case 'orb':
      default:
        return {
          x: Math.random() * MAP_WIDTH,
          y: Math.random() * MAP_HEIGHT,
        };
    }
  }

  static random(trees) {
    const typeDef = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    return new Food(typeDef, trees);
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
