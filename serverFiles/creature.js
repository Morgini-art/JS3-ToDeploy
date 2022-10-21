class Creature {
    // :x, y, width, height, hp, weapon, hitbox;
    constructor(x, y, width, height, hp, maxHp, weapon, hitbox, movingSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = hitbox;
        this.weapon = weapon;
        this.hp = hp;
        this.maxHp = maxHp;
        this.movingSpeed = movingSpeed;
    }
}

module.exports = { Creature };