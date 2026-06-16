const { MAX_FOOD, INITIAL_FOOD, FOOD_RESPAWN_PER_TICK, MAP_HEIGHT, MAP_WIDTH, EVOLUTION_TIERS, BUSH_COUNT, WATER_ZONE_COUNT, BURROW_COUNT } = require('./config');
const Food = require('./food');
const Tree = require('./tree');
const Bush = require('./bush');

let nextZoneId = 1;

class WaterZone {
  constructor(id, x, groundY) {
    this.id = id;
    this.x = x;
    this.y = groundY - 50 - Math.random() * 40;
    this.w = 200 + Math.random() * 250;
    this.h = 40 + Math.random() * 30;
    this.maxFish = 3 + Math.floor(Math.random() * 3);
    this.activeFish = 0;
    this.respawnTimers = [];
  }

  getFishPosition() {
    return {
      x: this.x + 15 + Math.random() * (this.w - 30),
      y: this.y + 5 + Math.random() * (this.h * 0.5),
    };
  }

  fishEaten() {
    this.activeFish--;
    this.respawnTimers.push(150 + Math.floor(Math.random() * 250));
  }

  update() {
    let ready = 0;
    for (let i = this.respawnTimers.length - 1; i >= 0; i--) {
      this.respawnTimers[i]--;
      if (this.respawnTimers[i] <= 0) {
        this.respawnTimers.splice(i, 1);
        ready++;
      }
    }
    return ready;
  }

  canAddFish() {
    return this.activeFish < this.maxFish;
  }

  addFish() {
    this.activeFish++;
  }
}

class Burrow {
  constructor(id, x, groundY) {
    this.id = id;
    this.x = x;
    this.y = groundY;
    this.maxPrey = 1 + Math.floor(Math.random() * 2);
    this.activePrey = 0;
    this.respawnTimers = [];
  }

  getPreyPosition() {
    return {
      x: this.x + (Math.random() - 0.5) * 40,
      y: this.y - 2 - Math.random() * 4,
    };
  }

  preyEaten() {
    this.activePrey--;
    this.respawnTimers.push(300 + Math.floor(Math.random() * 250));
  }

  update() {
    let ready = 0;
    for (let i = this.respawnTimers.length - 1; i >= 0; i--) {
      this.respawnTimers[i]--;
      if (this.respawnTimers[i] <= 0) {
        this.respawnTimers.splice(i, 1);
        ready++;
      }
    }
    return ready;
  }

  canAddPrey() {
    return this.activePrey < this.maxPrey;
  }

  addPrey() {
    this.activePrey++;
  }
}

class Game {
  constructor() {
    this.players = new Map();
    this.foods = new Map();
    this.foodAccumulator = 0;
    this.evolveEvents = [];
    this.tickCount = 0;
    this.trees = this.initTrees();
    this.bushes = this.initBushes();
    this.waterZones = this.initWaterZones();
    this.burrows = this.initBurrows();
    this.initFood();
  }

  initTrees() {
    const trees = [];
    const groundY = MAP_HEIGHT - 45;
    const count = 22;
    const spacing = MAP_WIDTH / count;
    for (let i = 0; i < count; i++) {
      const x = spacing * i + spacing * 0.2 + Math.random() * spacing * 0.5;
      trees.push(new Tree(i, x, groundY));
    }
    return trees;
  }

  initBushes() {
    const bushes = [];
    const groundY = MAP_HEIGHT - 45;
    const spacing = MAP_WIDTH / BUSH_COUNT;
    for (let i = 0; i < BUSH_COUNT; i++) {
      const x = spacing * i + spacing * 0.2 + Math.random() * spacing * 0.5;
      bushes.push(new Bush(i, x, groundY));
    }
    return bushes;
  }

  initWaterZones() {
    const zones = [];
    const groundY = MAP_HEIGHT - 45;
    const spacing = MAP_WIDTH / WATER_ZONE_COUNT;
    for (let i = 0; i < WATER_ZONE_COUNT; i++) {
      const x = spacing * i + spacing * 0.2 + Math.random() * spacing * 0.4;
      zones.push(new WaterZone(nextZoneId++, x, groundY));
    }
    return zones;
  }

  initBurrows() {
    const burrows = [];
    const groundY = MAP_HEIGHT - 45;
    const spacing = MAP_WIDTH / BURROW_COUNT;
    for (let i = 0; i < BURROW_COUNT; i++) {
      const x = spacing * i + spacing * 0.2 + Math.random() * spacing * 0.5;
      burrows.push(new Burrow(nextZoneId++, x, groundY));
    }
    return burrows;
  }

  sources() {
    return {
      trees: this.trees,
      bushes: this.bushes,
      waterZones: this.waterZones,
      burrows: this.burrows,
    };
  }

  initFood() {
    // Berries on trees
    for (const tree of this.trees) {
      const initial = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < initial; i++) {
        const pos = tree.getBerryPosition();
        const food = Food.createCherry(tree, pos.x, pos.y);
        this.foods.set(food.id, food);
        tree.addCherry();
      }
    }

    // Seeds on bushes
    for (const bush of this.bushes) {
      const initial = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < initial; i++) {
        const pos = bush.getSeedPosition();
        const food = Food.createSeed(bush, pos.x, pos.y);
        this.foods.set(food.id, food);
        bush.addSeed();
      }
    }

    // Fish in water zones
    for (const zone of this.waterZones) {
      for (let i = 0; i < zone.maxFish; i++) {
        const pos = zone.getFishPosition();
        const food = Food.createFish(zone, pos.x, pos.y);
        this.foods.set(food.id, food);
        zone.addFish();
      }
    }

    // Prey in burrows
    for (const burrow of this.burrows) {
      for (let i = 0; i < burrow.maxPrey; i++) {
        const pos = burrow.getPreyPosition();
        const food = Food.createPrey(burrow, pos.x, pos.y);
        this.foods.set(food.id, food);
        burrow.addPrey();
      }
    }

    // General food pool
    const sources = this.sources();
    for (let i = 0; i < INITIAL_FOOD; i++) {
      const food = Food.random(sources);
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
    this.tickCount++;
    this.evolveEvents = [];

    for (const player of this.players.values()) {
      player.update();
    }

    // Eating with diet check
    for (const player of this.players.values()) {
      if (!player.alive) continue;
      for (const [foodId, food] of this.foods) {
        if (!player.canEat(food)) continue;
        const pHw = player.size * 1.2;
        const pHh = player.size * 0.7;
        const fHalf = food.size;
        if (Math.abs(player.x - food.x) < pHw + fHalf && Math.abs(player.y - food.y) < pHh + fHalf) {
          this.foods.delete(foodId);

          if (food.type === 'berry' && food.treeId != null) {
            const tree = this.trees.find(t => t.id === food.treeId);
            if (tree) tree.cherryEaten();
          }
          if (food.type === 'seed' && food.bushId != null) {
            const bush = this.bushes.find(b => b.id === food.bushId);
            if (bush) bush.seedEaten();
          }
          if (food.type === 'fish' && food.zoneId != null) {
            const zone = this.waterZones.find(z => z.id === food.zoneId);
            if (zone) zone.fishEaten();
          }
          if (food.type === 'prey' && food.zoneId != null) {
            const burrow = this.burrows.find(b => b.id === food.zoneId);
            if (burrow) burrow.preyEaten();
          }

          const newTier = player.addXp(food.xp);
          if (newTier >= 0) {
            this.evolveEvents.push({ playerId: player.id, tier: newTier, tierName: player.tierName });
          }
        }
      }
    }

    // PvP eating
    const pvpCooldown = 32;
    for (const p1 of this.players.values()) {
      if (!p1.alive) continue;
      for (const p2 of this.players.values()) {
        if (p1.id === p2.id || !p2.alive) continue;
        if (!p1.canEatPlayer(p2)) continue;
        const pHw = p1.size * 1.2;
        const pHh = p1.size * 0.7;
        if (Math.abs(p1.x - p2.x) >= pHw + p2.size * 1.2 || Math.abs(p1.y - p2.y) >= pHh + p2.size * 0.7) continue;
        const key = p1.id + '-' + p2.id;
        const last = this.pvpCooldowns?.get(key) || 0;
        if (this.tickCount - last < pvpCooldown) continue;
        if (!this.pvpCooldowns) this.pvpCooldowns = new Map();
        this.pvpCooldowns.set(key, this.tickCount);

        const xpGain = 5 + p2.tier * 3;
        const xpLoss = Math.max(1, Math.floor(p2.xp * 0.3));
        p2.loseXp(xpLoss);
        const newTier = p1.addXp(xpGain + xpLoss);
        if (newTier >= 0) {
          this.evolveEvents.push({ playerId: p1.id, tier: newTier, tierName: p1.tierName });
        }
      }
    }

    // Respawn cherries from trees
    for (const tree of this.trees) {
      const ready = tree.update();
      for (let i = 0; i < ready; i++) {
        const pos = tree.getBerryPosition();
        const food = Food.createCherry(tree, pos.x, pos.y);
        this.foods.set(food.id, food);
        tree.addCherry();
      }
    }

    // Respawn seeds from bushes
    for (const bush of this.bushes) {
      const ready = bush.update();
      for (let i = 0; i < ready; i++) {
        const pos = bush.getSeedPosition();
        const food = Food.createSeed(bush, pos.x, pos.y);
        this.foods.set(food.id, food);
        bush.addSeed();
      }
    }

    // Respawn fish in water zones
    for (const zone of this.waterZones) {
      const ready = zone.update();
      for (let i = 0; i < ready; i++) {
        const pos = zone.getFishPosition();
        const food = Food.createFish(zone, pos.x, pos.y);
        this.foods.set(food.id, food);
        zone.addFish();
      }
    }

    // Respawn prey from burrows
    for (const burrow of this.burrows) {
      const ready = burrow.update();
      for (let i = 0; i < ready; i++) {
        const pos = burrow.getPreyPosition();
        const food = Food.createPrey(burrow, pos.x, pos.y);
        this.foods.set(food.id, food);
        burrow.addPrey();
      }
    }

    // General food pool respawn
    this.foodAccumulator += FOOD_RESPAWN_PER_TICK;
    while (this.foodAccumulator >= 1 && this.foods.size < MAX_FOOD) {
      this.foodAccumulator--;
      const food = Food.random(this.sources());
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
