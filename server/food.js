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
    this.diet = typeDef.diet;
    this.treeId = null;
    this.bushId = null;
    this.zoneId = null;
  }

  static getSpawnPosition(type, sources) {
    switch (type) {
      case 'berry':
        if (sources.trees && sources.trees.length > 0) {
          const tree = sources.trees[Math.floor(Math.random() * sources.trees.length)];
          const pos = tree.getBerryPosition();
          return { x: pos.x, y: pos.y, tree };
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 100 };
      case 'seed':
        if (sources.bushes && sources.bushes.length > 0) {
          const bush = sources.bushes[Math.floor(Math.random() * sources.bushes.length)];
          const pos = bush.getSeedPosition();
          return { x: pos.x, y: pos.y, bush };
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 30 };
      case 'prey':
        if (sources.burrows && sources.burrows.length > 0) {
          const burrow = sources.burrows[Math.floor(Math.random() * sources.burrows.length)];
          return { x: burrow.x + (Math.random() - 0.5) * 40, y: burrow.y - 2 - Math.random() * 4, burrow };
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 40 };
      case 'fish':
        if (sources.waterZones && sources.waterZones.length > 0) {
          const zone = sources.waterZones[Math.floor(Math.random() * sources.waterZones.length)];
          const fx = zone.x + Math.random() * zone.w;
          const fy = zone.y + Math.random() * zone.h * 0.6;
          return { x: fx, y: fy, zone };
        }
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 80 };
      case 'worm':
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 40 - Math.random() * 60 };
      case 'carrion':
        return { x: Math.random() * MAP_WIDTH, y: MAP_HEIGHT - 45 - Math.random() * 15 };
      case 'insect':
        return { x: Math.random() * MAP_WIDTH, y: 150 + Math.random() * (MAP_HEIGHT - 450) };
      case 'star':
        return { x: Math.random() * MAP_WIDTH, y: 10 + Math.random() * 390 };
      case 'orb':
      default:
        return { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
    }
  }

  static random(sources) {
    const types = FOOD_TYPES.filter(t => {
      if (t.type === 'berry') return sources.trees && sources.trees.some(tr => tr.canAddCherry());
      if (t.type === 'seed') return sources.bushes && sources.bushes.some(b => b.canAddSeed());
      if (t.type === 'prey') return sources.burrows && sources.burrows.some(b => b.canAddPrey());
      if (t.type === 'fish') return sources.waterZones && sources.waterZones.some(z => z.canAddFish());
      return true;
    });
    const typeDef = types.length ? types[Math.floor(Math.random() * types.length)] : FOOD_TYPES[8];
    const pos = Food.getSpawnPosition(typeDef.type, sources);
    const food = new Food(typeDef, pos.x, pos.y);
    if (pos.tree) { food.treeId = pos.tree.id; pos.tree.addCherry(); }
    if (pos.bush) { food.bushId = pos.bush.id; pos.bush.addSeed(); }
    if (pos.burrow) { food.zoneId = pos.burrow.id; pos.burrow.addPrey(); }
    if (pos.zone) { food.zoneId = pos.zone.id; pos.zone.addFish(); }
    return food;
  }

  static createCherry(tree, x, y) {
    const def = FOOD_TYPES.find(t => t.type === 'berry');
    const food = new Food(def, x, y);
    food.treeId = tree.id;
    return food;
  }

  static createSeed(bush, x, y) {
    const def = FOOD_TYPES.find(t => t.type === 'seed');
    const food = new Food(def, x, y);
    food.bushId = bush.id;
    return food;
  }

  static createFish(zone, x, y) {
    const def = FOOD_TYPES.find(t => t.type === 'fish');
    const food = new Food(def, x, y);
    food.zoneId = zone.id;
    return food;
  }

  static createPrey(burrow, x, y) {
    const def = FOOD_TYPES.find(t => t.type === 'prey');
    const food = new Food(def, x, y);
    food.zoneId = burrow.id;
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
