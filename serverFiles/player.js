const CreatureFile = require('./creature.js');
const Creature = CreatureFile.Creature;

class Player extends Creature {
    constructor(id, name, treaty, x, y, width, height, hitbox, weapon, hp, maxHp, movingSpeed, magicEnergy, maxMagicEnergy, ammunition, invetory, spellsBuffer, spells, recipes) {
        super(x, y, width, height, hitbox, weapon, hp , maxHp,movingSpeed);
        this.id = id;
        this.name = name;
        this.treaty = treaty;
        this.ammunition = ammunition;
        this.movingDirectionAxisX;
        this.movingDirectionAxisY;
        this.targetX;
        this.targetY;
        this.login;
        this.isMovingX;
        this.state = 'noPlay';
        this.isMovingY;
        this.moving = false;
        this.isAlive = true;
        this.magicEnergy = magicEnergy;
        this.maxMagicEnergy = maxMagicEnergy;
        this.loaderMagicEnergy = 0;
        this.weaponCounter = 0;
        this.spellCounter = 0;
        this.fightActions = {};
        this.toBlock;
        this.movingInvetoryBuffer = { moving : false, movingItem : 0, oldSlotNumber: 0, oldSlotAmount: 0};
        this.block = false;
        this.invetory = invetory;
        this.spellsBuffer = spellsBuffer;
        this.actualSpell = spells[0].name;
        this.spells = spells;
        this.recipes = recipes;
    }
}

function attack(objectives, gameTimer, player,weapon, weaponAttack) {
    /*const {weapon, ammunition} = this;
    if (e.key === 'q' && collision && weapon.type === 'melee') {
        weapon.attack(this, objective, generalTimer);
    } else if (!collision && weapon.type === 'distance' && e.button === 2) {
        weapon.attack(this, objective, generalTimer, e, ammunition, 'player');
    }*/
    weaponAttack(player, weapon,objectives, gameTimer, null, 'player');
}

function move(player) {

    const {
        x,
        y,
        targetX,
        targetY,
        movingDirectionAxisX,
        movingDirectionAxisY,
        isMovingX,
        isMovingY,
        movingSpeed
    } = player;


    //console.log(isMovingX, isMovingY, x, y);
    if (isMovingX) {
        if (movingDirectionAxisX === 'Left') {
            player.x -= movingSpeed;
        } else if (movingDirectionAxisX === 'Right') {
            player.x += movingSpeed;
        }
    }

    if (isMovingY) {
        if (movingDirectionAxisY === 'Up') {
            player.y -= movingSpeed;
            //if (y === targetY || y <= targetY) {
            //player.isMovingY = false;
            //}
        } else if (movingDirectionAxisY === 'Down') {
            player.y += movingSpeed;
            //if (y === targetY || y >= targetY) {
            //player.isMovingY = false;
            //}
        }
    }
}


function movingPlayer(player , layerX, layerY) {
    const {
        x,
        y,
        movingDirectionAxisX,
        movingDirectionAxisY,
        isMovingX,
        isMovingY
    } = player;

    player.movingDirectionAxisX = (x > layerX) ? player.movingDirectionAxisX = 'Left' : player.movingDirectionAxisX = 'Right';
    //player.targetX = Math.max(layerX);

    player.movingDirectionAxisY = (y > layerY) ? player.movingDirectionAxisY = 'Up' : player.movingDirectionAxisY = 'Down';
    //player.targetY = Math.max(layerY);

    player.isMovingX = true;
    player.isMovingY = true;

}

module.exports = { Player, movingPlayer, move, attack };