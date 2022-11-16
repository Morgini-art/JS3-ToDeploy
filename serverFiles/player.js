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
        this.block = false;
        this.invetory = invetory;
        this.spellsBuffer = spellsBuffer;
        this.actualSpell = spells[0].name;
        this.spells = spells;
        this.recipes = recipes;
    }

    drawPlayer(ctx) {
        const {
            x,
            y,
            height,
            width
        } = this;
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, width, height);
    }

    movingPlayer(layerX, layerY) {
        const {
            x,
            y,
            movingDirectionAxisX,
            movingDirectionAxisY,
            isMovingX,
            isMovingY
        } = this;
        
        this.movingDirectionAxisX = (x > layerX) ? this.movingDirectionAxisX = 'Left' : this.movingDirectionAxisX = 'Right';
        //this.targetX = Math.max(layerX);

        this.movingDirectionAxisY = (y > layerY) ? this.movingDirectionAxisY = 'Up' : this.movingDirectionAxisY = 'Down';
        //this.targetY = Math.max(layerY);

        this.isMovingX = true;
        this.isMovingY = true;
        
    }
    
    moveObjects(movingObjects, movingSpeed, char, axis) {
        movingObjects.forEach((object, i) => {
            if (axis === 'x') {
                if (char === '+') {
                    movingObjects[i].x += movingSpeed;
                } else {
                    movingObjects[i].x -= movingSpeed;
                }
                this.targetX -= movingSpeed / 2;
            } else {
                if (char === '+') {
                    movingObjects[i].y += movingSpeed;
                } else {
                   movingObjects[i].y -= movingSpeed; 
                }   
                this.targetY -= movingSpeed / 2;
            }
            //console.log(movingObjects[i].x);
            //console.log(movingObjects[i].y);
        });
        //console.log(movingObjects);
    }
    
    move() { //TODO: STATIC MOVING => DYNAMIC MOVING

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
        } = this;

        
        //console.log(isMovingX, isMovingY, x, y);
        if (isMovingX) {
            if (movingDirectionAxisX === 'Left') {
                this.x -= movingSpeed;
            } else if (movingDirectionAxisX === 'Right') {
                this.x += movingSpeed;
            }
        }
        
        if (isMovingY) {
            if (movingDirectionAxisY === 'Up') {
                this.y -= movingSpeed;
                //if (y === targetY || y <= targetY) {
                    //this.isMovingY = false;
                //}
            } else if (movingDirectionAxisY === 'Down') {
                this.y += movingSpeed;
                //if (y === targetY || y >= targetY) {
                    //this.isMovingY = false;
                //}
            }
        }
        
        
    }

    attack(objectives, gameTimer) {
        const {weapon} = this;
        /*const {weapon, ammunition} = this;
        if (e.key === 'q' && collision && weapon.type === 'melee') {
            weapon.attack(this, objective, generalTimer);
        } else if (!collision && weapon.type === 'distance' && e.button === 2) {
            weapon.attack(this, objective, generalTimer, e, ammunition, 'player');
        }*/
        this.weapon.attack(this, objectives, gameTimer, null, 'player');
    }

}

module.exports = { Player };