const Creature = require('./creature').Creature;
const Tick = require('./time').Tick;
const Chest = require('./chest').Chest;
const HitboxFile = require('./hitbox');
const Hitbox = HitboxFile.Hitbox;
const checkCollisionWith = HitboxFile.checkCollisionWith;
const checkCollisionWithLineRectangle = HitboxFile.checkCollisionWithLineRectangle;

function convertNumberToPercent(part, all) {
    return (part/all)*100;
}

class Path {
    points = [];
}

class Enemy extends Creature {
    constructor(id, x, y, width, height, hitbox, weapon, hp, maxHp, movingSpeed, defendChance, drop, dropAmount, inteligence, ammunition, path) {
        super(x, y, width, height, hitbox, weapon, hp, maxHp, movingSpeed);
        this.id = id;
        this.objectiveX;
        this.objectiveY;
        this.objectivePlayer;
        this.defendChance = defendChance;
        this.drop = drop;
        this.dropAmount = dropAmount;
        this.inteligence = inteligence;
        this.path = path;

        this.isAlive = true;
        this.aiState = 'quest';
        this.secondAiState = 'none';
        this.walkingDirectionX = 'none';
        this.walkingDirectionY = 'none';
        this.hitboxActive = true;
        this.levelOfThreat = 0;
        this.ammunition = ammunition;
        this.counterHpAnimation = convertNumberToPercent(this.hp, this.maxHp) * this.width / 100;
        this.regenerationHp = false;
    }

    drawEnemy(ctx, color) {
        const {
            x,
            y,
            width,
            height,
            isAlive,
            hp,
            maxHp,
            counterHpAnimation,
            regenerationHp
        } = this;
        ctx.fillStyle = color;
        if (!isAlive) {
            ctx.fillStyle = 'black';
        } else {
            const hpPercent = convertNumberToPercent(hp, maxHp);
            const hpWidth = width * hpPercent / 100;
            if (counterHpAnimation >= hpWidth) {
                this.counterHpAnimation -= 1.4;
            } else if (counterHpAnimation <= hpWidth && regenerationHp) {
                this.counterHpAnimation += 1.2;
            }
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = 'blue';
            ctx.fillStyle = '#4A2323';
            ctx.fillRect(x, y - 10, width, 8);
            ctx.fillStyle = '#f74d4d';
            ctx.fillRect(x, y - 10, this.counterHpAnimation, 8);
            ctx.fillStyle = 'black';
            ctx.lineWidth = 0.3;
            ctx.strokeRect(x, y - 10, width, 8);
        }
    }

    wherePlayer(playerObject, blocks) {
        const {
            x,
            y,
            aiState
        } = this;

        if (aiState === 'quest') {
            if (playerObject.x > x) {
                this.walkingDirectionX = 'Right';
                this.objectiveX = playerObject.x;
            } else {
                this.walkingDirectionX = 'Left';
                this.objectiveX = playerObject.x;
            }

            if (playerObject.y > y) {
                this.walkingDirectionY = 'Down';
                this.objectiveY = playerObject.y;
            } else {
                this.walkingDirectionY = 'Up';
                this.objectiveY = playerObject.y;
            }
        }
        
        /*let isThereObstacle = false;
        let collisionBlock;
        for (const block of blocks) {
            isThereObstacle = checkCollisionWithLineRectangle(x, y, playerObject.x, playerObject.y, block.hitbox);
            if (isThereObstacle) {
                collisionBlock = block;
                break;
            }
        }
        console.log(collisionBlock, 'Collision', isThereObstacle);
        if (isThereObstacle) {
            while (isThereObstacle) {
//                console.log('loop');
                let distance = Math.max(y - collisionBlock.y, collisionBlock.y - y ) + Math.max(x - collisionBlock.x, collisionBlock.x - x );
                const newY = collisionBlock.y + this.width;
                
                for (const block of blocks) {
                    isThereObstacle = checkCollisionWithLineRectangle(x, y, block.x, newY, block.hitbox);
//                    console.log(isThereObstacle);
                    if (isThereObstacle) {
                        collisionBlock = block;
                        break;
                    } else {
                        this.objectiveY = newY;
                        this.objectiveX = collisionBlock.x;
                        this.aiState = 'dodge';
                        break;
                    }
                }
            }
        }*/
    }

    moveToPlayer(playerObject) {
        const {
            x,
            y,
            walkingDirectionX,
            walkingDirectionY,
            movingSpeed
        } = this;
        
        if (walkingDirectionX === 'Left' && x != playerObject.x) {
            this.x -= movingSpeed;
        } else if (walkingDirectionX === 'Right' && x != playerObject.x) {
            this.x += movingSpeed;
        }

        if (walkingDirectionY === 'Up' && y != playerObject.y) {
            this.y -= movingSpeed;
        } else if (walkingDirectionY === 'Down' && y != playerObject.y) {
            this.y += movingSpeed;
        }
    }
    
    moveTo(generalTimer) {
        const {
            x,
            y,
            walkingDirectionX,
            walkingDirectionY,
            movingSpeed,
            aiState
        } = this;
        
        let bonusSpeed = 1;
        if (aiState === 'dodge') {
            bonusSpeed = 1.5;
        }

        console.log('DODGE');
        if (walkingDirectionX === 'Left') {
            this.x -= movingSpeed;
        } else if (walkingDirectionX === 'Right') {
            this.x += movingSpeed;
        }

        if (walkingDirectionY === 'Up') {
            this.y -= movingSpeed * bonusSpeed;
            if (this.y <= this.objectiveY) {
                this.walkingDirectionY = 'None';
                this.aiState = 'quest';
                this.secondAiState = 'none';
                this.deleteLastReloadingTick(generalTimer);
            }
        } else if (walkingDirectionY === 'Down') {
            this.y += movingSpeed * bonusSpeed;
            if (this.y < this.objectiveY) {
                this.walkingDirectionY = 'None';
                this.aiState = 'quest';
                this.secondAiState = 'none';
                this.deleteLastReloadingTick(generalTimer);
            }
        }
    }
    
    deleteLastReloadingTick(generalTimer) {
        for (const thisTick of generalTimer.listOfTicks) {
            if (thisTick.nameOfTick === 'Reloading Enemy Distance Weapon EnemyId:' + this.id) {
                if (thisTick.done && !thisTick.old) {
                    thisTick.old = true;
                    //console.log(thisTick.old);
                    break;
                }
            }
        }
    }

    afterDeath(chests) {
        this.isAlive = false;
        const {
            x,
            y,
            drop,
            dropAmount
        } = this;
        chests.push(new Chest(x, y, 30, 30, new Hitbox(x, y, 30, 30), drop));
        console.log(chests);
        this.hitboxActive = false;
    }
    
    choosePlayer (players) {
        const {x, y} = this;
        const chooseMode = 'closer'; //MODES: tapping - random - closer
        
        if (chooseMode === 'closer') {
            let distances = [];
            
            players.forEach((player, idOfPlayer) => {
                const distanceY = Math.max(y - player.y, player.y - y);
                const distanceX = Math.max(x - player.x, player.x - x);
                if (player.isAlive && player.state !== 'spectator') {
                    distances.push({
                        distance: distanceX + distanceY,
                        id: idOfPlayer
                    });    
                }
            });
            
            if (distances.length !== 0) {
                const closest = distances.reduce(
                    (acc, loc) =>
                    acc.distance < loc.distance ?
                    acc :
                    loc
                );
                this.objectivePlayer = players[closest.id];
            }
        }
    }

    threats(bullets, playerObject) {
        const {
            x,
            y,
            width,
            height
        } = this;
        this.levelOfThreat = 0;
        let xAxis = false;
        let yAxis = false;
        let distance = false;

        //BulletThreats
        if (this.inteligence >= 1) {
            for (const bullet of bullets) {
                if (bullet.owner === this.objectivePlayer.id) {
                    if (bullet.movingDirectionAxisX === 'Left' && bullet.x > x ||
                        bullet.movingDirectionAxisX === 'Right' && bullet.x < x) {
                        this.levelOfThreat += 1;
                        xAxis = true;
                    }
                    if (bullet.x - x <= 0) {
                        if (bullet.distance >= x - bullet.x - 25) {
                            this.levelOfThreat += 1;
                            distance = true;
                        }
                    } else {
                        if (bullet.distance >= bullet.x - x - 25) {
                            this.levelOfThreat += 1;
                            distance = true;
                        }
                    }
//                    console.log(bullet);
                    if (bullet.movingDirectionAxisY === 'Up' && bullet.y > y ||
                        bullet.movingDirectionAxisY === 'Down' && bullet.y < y ||
                        bullet.movingDirectionAxisY === 'None' && distance) {
                        this.levelOfThreat += 1;
                        yAxis = true;
                    }
                    if (distance && xAxis && bullet.movingDirectionAxisY === 'None') {
                        this.levelOfThreat += 1;
                    }
                    if (this.levelOfThreat >= 3) {
                        /*this.x = playerObject.x + playerObject.width * 2;
                        this.y = playerObject.y + playerObject.height * 2;*/
                        this.aiState = 'dodge';
                        if (bullet.movingDirectionAxisY === 'Down') {
                            this.objectiveY = y - height * 1.2;
                            this.walkingDirectionY = 'Up';
                        } else if (bullet.movingDirectionAxisY === 'Up') {
                            this.objectiveY = y + height * 1.2;
                            this.walkingDirectionY = 'Down';
                        } else {
                            this.objectiveY = y + height;
                            this.walkingDirectionY = 'Down';
                        }
                    }
                }
                //console.log(this.levelOfThreat);
                this.levelOfThreat = 0;
            }
        }
//        console.warn(distance, xAxis, yAxis, this.levelOfThreat);
        //BulletThreats
    }
    
    checkCanShoot(playerObject, generalTimer) {
        const {x, y, weapon, ammunition, secondAiState} = this;
        const {x2, y2} = playerObject;
        
        if (x < playerObject.x) {
            //I am a left side from player
            const distance = weapon.distance;
            const yAxisDifference = Math.max(y - playerObject.y, playerObject.y - y );
            if (distance >= yAxisDifference + (playerObject.x - x)) {
                this.aiState = 'shooting';
            } else {
                this.aiState = 'quest';
                this.secondAiState = 'none';
                //this.deleteLastReloadingTick(generalTimer);
            }
        } else if (x > playerObject.x) {
            //I am a right side from player
            const distance = weapon.distance;
            const yAxisDifference = Math.max(y - playerObject.y, playerObject.y - y );
            if (distance >= yAxisDifference + (x - playerObject.x)) {
                this.aiState = 'shooting';
            } else {
                this.aiState = 'quest';
                this.secondAiState = 'none';
                //this.deleteLastReloadingTick(generalTimer);
            }
        }
    }
    
    checkCollision() {
        const {hitbox, aiState} = this;
        if (checkCollisionWith(hitbox, this.objectivePlayer.hitbox)) {
            if (aiState !== 'toattack') {
                this.aiState = 'toattack';    
            } 
            return true;
        } else {
            this.aiState = 'quest';   
            return false;
        }    
    }
    
    enemyAi(attackList, playerObject, generalTimer, chests, bullets, blocks) {
        const {
            isAlive,
            aiState,
            secondAiState,
            weapon,
            hp,
            ammunition
        } = this;
        
        const {
            listOfTicks
        } = generalTimer;
        if (hp <= 0) {
            if (isAlive) {
                this.afterDeath(chests);
            }
            this.isAlive = false;
        } else {
            if (isAlive) {
                if (aiState !== 'oblivion') {
                    this.threats(bullets, playerObject);
                    this.wherePlayer(playerObject, blocks);
                }
                if (aiState === 'quest') { //1.MOVE TO PLAYER
                    this.moveToPlayer(playerObject);
                    if (weapon.type === 'melee') {
                        this.checkCollision();
                    }
                    attackList.pop();
                } else if (aiState === 'dodge') {
                    this.moveTo(generalTimer);
                } else if (aiState === 'toattack') { //2.ATTACKING STATE
                    if (weapon.type === 'melee') { //TUTAJ DODAJEMY ATAK JEŚLI GO NIE MA
                        let attackIs = false;
                        const next = this.checkCollision();
                        if (!next) {
                            for (let i = 0; i < listOfTicks.length; i++) {
                                if (listOfTicks[i].nameOfTick === 'EnemyLightAttack EnemyId:' + this.id) {
                                    attackList.pop();
                                    listOfTicks[i].old = true;
                                }
                            }
                        } else {
                            for (let i = 0; i < listOfTicks.length; i++) {
                                if (listOfTicks[i].nameOfTick === 'EnemyLightAttack EnemyId:' + this.id) {
                                    if (!listOfTicks[i].done && !listOfTicks[i].old) { //Jeśli nieskończony i nie stary:
                                        attackIs = true;
                                        break;
                                    }
                                }
                            }

                            if (!attackIs) {
                                generalTimer.listOfTicks.push(new Tick('EnemyLightAttack EnemyId:' + this.id, generalTimer.generalGameTime, generalTimer.generalGameTime + this.weapon.speedLightAttack * 1.5));
                                //console.log(this.weapon.speedLightAttack * 1.5);
                            }
                        }
                    }
                    if (attackList[attackList.length - 1] !== 'EnemyLightAttack EnemyId:' + this.id) {
                        attackList.push('EnemyLightAttack' + this.id);
                    }
                }
                if (aiState === 'shooting' && secondAiState === 'icanshoot?') {
                    this.secondAiState = 'reloading';
                }
                if (secondAiState === 'icanshoot?' && aiState !== 'oblivion') {
                    this.checkCanShoot(playerObject, generalTimer);
                } else if (secondAiState === 'waitforreaload') {
                    for (const thisTick of listOfTicks) {
                        if (thisTick.nameOfTick === 'Reloading Enemy Distance Weapon EnemyId:' + this.id) {
                            if (thisTick.done && !thisTick.old) {
                                this.secondAiState = 'shoot';
                                //console.log(listOfTicks);
                                thisTick.old = true;
                                this.checkCanShoot(playerObject, generalTimer);
                                break;
                            }
                        }
                    }

                } else if (secondAiState === 'shoot' && aiState === 'shooting') {
                    //console.error('SHOOT');
//                    weapon.attack(this, this.objectivePlayer, generalTimer, undefined, ammunition, 'enemy');
                    this.weapon.attack(this, null, generalTimer, playerObject, 'enemy');
                    this.secondAiState = 'reloading';
                } else if (secondAiState === 'reloading' && aiState === 'shooting') {
                    generalTimer.listOfTicks.push(new Tick('Reloading Enemy Distance Weapon EnemyId:' + this.id, generalTimer.generalGameTime, generalTimer.generalGameTime + 125));
                    this.secondAiState = 'waitforreaload';
                    this.checkCanShoot(playerObject, generalTimer);
                }
            }
        }
    }
}

module.exports = {Enemy};