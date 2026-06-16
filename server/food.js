const { FOOD_TYPES, MAP_WIDTH, MAP_HEIGHT } = require('./config');

let nextFoodId = 1;

class Food {
  constructor(typeDef, x, y) {
    this.id = nextFoodId++;
    this.type = typeDef.type;
    this.x = x;
    this.y = y;
    this.size = typeDef.size;
    this.color = typeDef.color;
    this.xp = typeDef.xp;
    this.treeId = null;
  }

  static getSpawnPosition(type, trees) {
    switch (type) {
      case 'berry':
        if (trees && trees.length > 0) {
          const tree = trees[Math.floor(Math.random() * trees.length)];
          const pos = tree.getBerryPosition();
          return { x: pos.x, y: pos.y, tree };
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 100 };
      case 'insect':
        return { x: Math.random() * MAP_WIDTH, y: 150 + Math.random() * (MAP_HEIGHT - 450) };
      case 'star':
        return { x: Math.random() * MAP_WIDTH, y: 10 + Math.random() * 390 };
      case 'orb':
      default:
        return { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
    }
  }

  static random(trees) {
    const types = FOOD_TYPES.filter(t => {
      if (t.type === 'berry') return trees && trees.some(tree => tree.canAddCherry());
      return true;
    });
    const typeDef = types.length ? types[Math.floor(Math.random() * types.length)] : FOOD_TYPES[3];
    const pos = Food.getSpawnPosition(typeDef.type, trees);
    const food = new Food(typeDef, pos.x, pos.y);
    if (pos.tree) {
      food.treeId = pos.tree.id;
      pos.tree.activeCherries++;
    }
    return food;
  }

  static createCherry(tree, x, y) {
    const def = FOOD_TYPES.find(t => t.type === 'berry');
    const food = new Food(def, x, y);
    food.treeId = tree.id;
    return food;
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
