const { MAX_FOOD, INITIAL_FOOD, FOOD_RESPAWN_PER_TICK, MAP_HEIGHT, MAP_WIDTH } = require('./config');
const Food = require('./food');
const Tree = require('./tree');

class Game {
  constructor() {
    this.players = new Map();
    this.foods = new Map();
    this.foodAccumulator = 0;
    this.evolveEvents = [];
    this.trees = this.initTrees();
    this.initFood();
  }

  initTrees() {
    const trees = [];
    const groundY = MAP_HEIGHT - 45;
    const count = 28;
    const spacing = MAP_WIDTH / count;
    for (let i = 0; i < count; i++) {
      const x = spacing * i + spacing * 0.2 + Math.random() * spacing * 0.5;
      trees.push(new Tree(i, x, groundY));
    }
    return trees;
  }

  initFood() {
    for (const tree of this.trees) {
      const initial = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < initial; i++) {
        const pos = tree.getBerryPosition();
        const food = Food.createCherry(tree, pos.x, pos.y);
        this.foods.set(food.id, food);
        tree.addCherry();
      }
    }
    for (let i = 0; i < INITIAL_FOOD; i++) {
      const food = Food.random(this.trees);
      if (food) this.foods.set(food.id, food);
    }
  }

  addPlayer(player) {
    this.players.set(player.id, player);
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  update() {
    this.evolveEvents = [];

    for (const player of this.players.values()) {
      player.update();
    }

    for (const player of this.players.values()) {
      if (!player.alive) continue;
      for (const [foodId, food] of this.foods) {
        const pHalf = player.size * 1.25;
        const fHalf = food.size;
        if (Math.abs(player.x - food.x) < pHalf + fHalf && Math.abs(player.y - food.y) < pHalf + fHalf) {
          this.foods.delete(foodId);
          if (food.type === 'berry' && food.treeId != null) {
            const tree = this.trees.find(t => t.id === food.treeId);
            if (tree) tree.cherryEaten();
          }
          const newTier = player.addXp(food.xp);
          if (newTier >= 0) {
            this.evolveEvents.push({ playerId: player.id, tier: newTier, tierName: player.tierName });
          }
        }
      }
    }

    for (const tree of this.trees) {
      const ready = tree.update();
      for (let i = 0; i < ready; i++) {
        const pos = tree.getBerryPosition();
        const food = Food.createCherry(tree, pos.x, pos.y);
        this.foods.set(food.id, food);
        tree.addCherry();
      }
    }

    this.foodAccumulator += FOOD_RESPAWN_PER_TICK;
    while (this.foodAccumulator >= 1 && this.foods.size < MAX_FOOD) {
      this.foodAccumulator--;
      const food = Food.random(this.trees);
      if (food) this.foods.set(food.id, food);
    }
  }

  getState() {
    const players = [];
    for (const player of this.players.values()) {
      players.push(player.serialize());
    }
    const foods = [];
    for (const food of this.foods.values()) {
      foods.push(food.serialize());
    }
    return { players, foods, evolves: this.evolveEvents };
  }
}

module.exports = Game;
