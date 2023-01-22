const {Creature} = require('./creature');
const {Tick} = require('./time');
const {Chest} = require('./chest');
const {attackWeapon} = require('./weapon');
const {Hitbox,checkCollisionWith,checkCollisionWithLineRectangle,checkCollisionWithLineRectangleSpecial} = require('./hitbox');
const {randomXY,getDistance,convertNumberToPercent} = require('./lib-0');

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
        
        this.debug;
        this.fieldOfView = [];
        this.fieldOfViewData = {direction:4,realView:[]};
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


}

function fieldOfView(enemy, gameBlocks) {
    enemy.fieldOfView.forEach(ray => {
        const {
            state,
            x,
            y
        } = ray;
        const direction = enemy.fieldOfViewData.direction;

        if (state === 3) {
            ray.x += direction;
        } else if (state === 2) {
            ray.y += direction;
        } else if (state === 1) {
            ray.x -= direction;
        } else if (state === 0) {
            ray.y -= direction;
        }
        if (direction > 0) {
            if (state === 3 && x > 200) {
                ray.state = 2;
            } else if (state === 2 && y > 200) {
                ray.state = 1
            } else if (state === 1 && x < -200) {
                ray.state = 0;
            } else if (state === 0 && y < -200) {
                ray.state = 3;
            }
        } else if (direction < 0) {
            if (state === 1 && x > 200) {
                ray.state = 2;
            } else if (state === 0 && y > 200) {
                ray.state = 1;
            } else if (state === 3 && x < -200) {
                ray.state = 0;
            } else if (state === 2 && y < -200) {
                ray.state = 3;
            }
        }

    });

    
    let allPoints = [];
    enemy.fieldOfViewData.realView = [];
    enemy.fieldOfView.forEach((ray, i) => {
        let collision = false;
        for (const block of gameBlocks) {
            const result = checkCollisionWithLineRectangleSpecial(enemy.x, enemy.y, enemy.x + ray.x, enemy.y + ray.y, block.hitbox);
            if (result.bool) {
                for (let x = 0; x < result.points.length; x++) {
                    const pointX = result.points[x];
                    const pointY = result.points[x += 1];
                    allPoints.push(~~pointX, ~~pointY, i);
                    if (!collision) collision = true;
                }
            }

        }
        if (!collision) {
            enemy.fieldOfViewData.realView.push(ray.x, ray.y);   
        }
    });


    let filtr = [];
    let min = 1000;
    let minData = [];
    let memory = 0;
    for (let z = 0; z < allPoints.length; z++) {
        const pointX = allPoints[z];
        const pointY = allPoints[z += 1];
        if (memory !== allPoints[z += 1] || allPoints.length === z) {
            filtr.push(minData[0], minData[1]);
            min = 1000;
            memory++;
        } else {
            const dist = ~~getDistance(enemy.x, enemy.y, pointX, pointY);
            if (dist < min) {
                min = dist;
                minData[0] = pointX - enemy.x;
                minData[1] = pointY - enemy.y;
            }
        }
    }
    if (filtr.length > 0) {
        enemy.fieldOfViewData.realView = [...enemy.fieldOfViewData.realView, ...filtr];
    }
}

function wherePlayer(enemy,playerObject, blocks) {
    const {
        x,
        y,
        aiState
    } = enemy;
    
    if (playerObject === undefined) {
        return;
    }
    const path = [{
        x: enemy.x,
        y: enemy.y
        }, {
        x: playerObject.x,
        y: playerObject.y,
        }];

    let isThereObstacle = true;
    let xCounter = x;
    let yCounter = y;
    let collisionBlock;
    //TODO: Ogranicz ilość sprawdzanych bloków
    let direction = 'left-right'; // || up-down
    let walkingMethodPath = 'plus';
    let randomMethodPath = Math.random();
    if (randomMethodPath < 0.5) {
        walkingMethodPath = 'minus';
    }
    
//    console.log(playerObject.x);
//    console.log(playerObject.y);
    enemy.debug = {path: [{
        x: playerObject.x,
        y: playerObject.y,
        }, {
        x: playerObject.x,
        y: y
        }]};
    
    for (const block of blocks) {
        isThereObstacle = checkCollisionWithLineRectangle(playerObject.x, playerObject.y, playerObject.x, y, block.hitbox);
        if (isThereObstacle) {
            direction = 'up-down';
            break;
        }
    }
    
    console.log(direction);
    isThereObstacle = true;
    mainLoop: while (isThereObstacle) {
//        (blocks, playerX,playerY, x, y, enemy, direction)
        if (colide(blocks, playerObject.x, playerObject.y,xCounter, yCounter, enemy,direction,walkingMethodPath)) {
            if (direction === 'left-right') {
//            if (direction === 'up-down') {
                if (walkingMethodPath === 'plus') {
                    yCounter += 25;
                } else {
                    yCounter -= 25;
                }
            } else {
                if (walkingMethodPath === 'plus') {
                    xCounter += 25;
                } else {
                    xCounter -= 25;
                }
            }
        } else {
            break mainLoop;
        }
    }
//    console.log('LOG:',xCounter, yCounter);
//    console.log(xCounter, yCounter);
    
    if (direction === 'left-right') {
//    if (direction === 'up-down') {
        path[0].y = yCounter;
        path[1].y = yCounter;
        path[0].x = enemy.x;
        path[1].x = playerObject.x;
    } else {
        path[0].x = xCounter;
        path[1].x = xCounter;
        path[0].y = enemy.y;
        path[1].y = playerObject.y;
    }
    /*path[0].y = yCounter;
//    path[0].x = xCounter;
    path[1].y = yCounter;*/
//    path[1].x = xCounter;
    enemy.aiState = 'pathwalking';
    enemy.secondAiState = 'loadingpath';
    
    enemy.path = path;
//    console.log('Change');
//    enemy.debug = {path: enemy.path};
//    console.log(enemy.debug.path);
//    console.log('Enemy path ready:', enemy.path);
    
}

function colide(blocks, playerX, playerY, x, y, enemy, direction, method) {
//    console.log('I recieved', x, y);
    //        console.log('Check collision (colide)');
    //        console.log(yCounter);
    for (const block of blocks) {
        //            console.log('I walking in array blocks');
        if (direction === 'left-right') {
            //            colide(blocks, playerObject.x, xCounter, yCounter, enemy,direction
            //px, cx,
            //                                               px,cy,px,cy
            if (method === 'minus') {
                const collision = checkCollisionWithLineRectangle(x, y, playerX, y, block.hitbox);
                //                const collision = checkCollisionWithLineRectangle(x, y, playerX, y, block.hitbox);
                if (collision) {
                    // console.log('No way');
                    return true;
                }
            } else {
                const collision = checkCollisionWithLineRectangle(x, y, playerX, y, block.hitbox);
                if (collision) {
                    // console.log('No way');
                    return true;
                }
            }

        } else {
            //       
            if (method === 'minus') {
//                console.log('cx',x,)
                const collision = checkCollisionWithLineRectangle(x + enemy.width, y, x + enemy.width, playerY, block.hitbox);
                if (collision) {
                    // console.log('No way');
                    return true;
                }
            } else {
                const collision = checkCollisionWithLineRectangle(x, y, x, playerY, block.hitbox);
                if (collision) {
                    // console.log('No way');
                    return true;
                }
            }
//            console.log('counterx', x, 'y:', y, 'counterx', x, 'playerY', playerY);

        }

        /*if (walkingMethodPath === 'up') {
            
        } else {
            const collision = checkCollisionWithLineRectangle(xCounter, yCounter, playerX, yCounter, block.hitbox);
            if (collision) {
                //console.log('No way');
                return true;
            }
        }*/
    }
    return false;
}

function moveToPlayer(enemy,playerObject) {
    const {
        x,
        y,
        walkingDirectionX,
        walkingDirectionY,
        movingSpeed
    } = enemy;

    if (walkingDirectionX === 'Left' && x != playerObject.x) {
        enemy.x -= movingSpeed;
    } else if (walkingDirectionX === 'Right' && x != playerObject.x) {
        enemy.x += movingSpeed;
    }

    if (walkingDirectionY === 'Up' && y != playerObject.y) {
        enemy.y -= movingSpeed;
    } else if (walkingDirectionY === 'Down' && y != playerObject.y) {
        enemy.y += movingSpeed;
    }
}

function moveTo(enemy,generalTimer) {
    const {
        x,
        y,
        walkingDirectionX,
        walkingDirectionY,
        movingSpeed,
        aiState
    } = enemy;

    let bonusSpeed = 10;
    if (aiState === 'dodge') {
        bonusSpeed = 1.5;
    }
    
//    console.log('I walking to:', enemy.objectiveX, enemy.objectiveY, 'with sides:', walkingDirectionX, walkingDirectionY)
    if (walkingDirectionX === 'Left') {
        enemy.x -= movingSpeed * bonusSpeed;
//        console.log('Moving left', enemy.x, enemy.objectiveX);
        if (enemy.x < enemy.objectiveX) {
            enemy.walkingDirectionX = 'none';
            if (enemy.aiState === 'pathwalking' && walkingDirectionY === 'none') {
                enemy.secondAiState = 'loadingpath';
            } else {
//                enemy.aiState = 'quest';
//                enemy.secondAiState = 'none';
            }
        }
    } else if (walkingDirectionX === 'Right') {
        enemy.x += movingSpeed * bonusSpeed;
//        console.log('Moving right', enemy.x, enemy.objectiveX);
        if (enemy.x >= enemy.objectiveX) {
            enemy.walkingDirectionX = 'none';
            if (enemy.aiState === 'pathwalking' && walkingDirectionY === 'none') {
                enemy.secondAiState = 'loadingpath';
            } else {
//                enemy.aiState = 'quest';
//                enemy.secondAiState = 'none';
            }
        }
    }

    if (walkingDirectionY === 'Up') {
        enemy.y -= movingSpeed * bonusSpeed;
//        console.log('Moving up', enemy.y);
        if (enemy.y <= enemy.objectiveY) {
            enemy.walkingDirectionY = 'none'
            if (enemy.aiState === 'pathwalking' && walkingDirectionX === 'none') {
                enemy.secondAiState = 'loadingpath';
            }/* else {
                enemy.aiState = 'quest';
                enemy.secondAiState = 'none';
            }   */
        }
    } else if (walkingDirectionY === 'Down') {
        //(-50) += 10 === -40
        if (enemy.objectiveY < 0) {
            enemy.y -= movingSpeed * bonusSpeed;
        } else {
            enemy.y += movingSpeed * bonusSpeed;
        }
//        console.log(enemy.y, enemy.objectiveY);
//        console.log('Moving down', enemy.y, enemy.objectiveY);
        if (enemy.y > enemy.objectiveY && walkingDirectionX === 'none') {
            enemy.walkingDirectionY = 'none';
            if (enemy.aiState === 'pathwalking') {
                enemy.secondAiState = 'loadingpath';
            } else {
//                enemy.aiState = 'quest';
//                enemy.secondAiState = 'none';
            }
        }
    }
}

function deleteLastReloadingTick(generalTimer) {
    for (const enemyTick of generalTimer.listOfTicks) {
        if (enemyTick.nameOfTick === 'Reloading Enemy Distance Weapon EnemyId:' + enemy.id) {
            if (enemyTick.done && !enemyTick.old) {
                enemyTick.old = true;
                break;
            }
        }
    }
}

function afterDeath(enemy,chests) {
    enemy.isAlive = false;
    const {
        x,
        y,
        drop,
        dropAmount
    } = enemy;
    chests.push(new Chest(x, y, 30, 30, new Hitbox(x, y, 30, 30), drop));
    console.log(chests);
    enemy.hitboxActive = false;
}

function choosePlayer(enemy,players) {
    const {
        x,
        y
    } = enemy;
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
            enemy.objectivePlayer = players[closest.id];
        }
    }
}

function threats(enemy,bullets, playerObject) {
    const {
        x,
        y,
        width,
        height
    } = enemy;
    enemy.levelOfThreat = 0;
    let xAxis = false;
    let yAxis = false;
    let distance = false;

    //BulletThreats
    if (enemy.inteligence >= 1) {
        for (const bullet of bullets) {
            if (bullet.owner === enemy.objectivePlayer.id) {
                if (bullet.movingDirectionAxisX === 'Left' && bullet.x > x ||
                    bullet.movingDirectionAxisX === 'Right' && bullet.x < x) {
                    enemy.levelOfThreat += 1;
                    xAxis = true;
                }
                if (bullet.x - x <= 0) {
                    if (bullet.distance >= x - bullet.x - 25) {
                        enemy.levelOfThreat += 1;
                        distance = true;
                    }
                } else {
                    if (bullet.distance >= bullet.x - x - 25) {
                        enemy.levelOfThreat += 1;
                        distance = true;
                    }
                }
                //                    console.log(bullet);
                if (bullet.movingDirectionAxisY === 'Up' && bullet.y > y ||
                    bullet.movingDirectionAxisY === 'Down' && bullet.y < y ||
                    bullet.movingDirectionAxisY === 'None' && distance) {
                    enemy.levelOfThreat += 1;
                    yAxis = true;
                }
                if (distance && xAxis && bullet.movingDirectionAxisY === 'None') {
                    enemy.levelOfThreat += 1;
                }
                if (enemy.levelOfThreat >= 3) {
                    /*enemy.x = playerObject.x + playerObject.width * 2;
                    enemy.y = playerObject.y + playerObject.height * 2;*/
                    enemy.aiState = 'dodge';
                    if (bullet.movingDirectionAxisY === 'Down') {
                        enemy.objectiveY = y - height * 1.2;
                        enemy.walkingDirectionY = 'Up';
                    } else if (bullet.movingDirectionAxisY === 'Up') {
                        enemy.objectiveY = y + height * 1.2;
                        enemy.walkingDirectionY = 'Down';
                    } else {
                        enemy.objectiveY = y + height;
                        enemy.walkingDirectionY = 'Down';
                    }
                }
            }
            //console.log(enemy.levelOfThreat);
            enemy.levelOfThreat = 0;
        }
    }
    //        console.warn(distance, xAxis, yAxis, enemy.levelOfThreat);
    //BulletThreats
}

function checkCanShoot(enemy,playerObject, generalTimer) {
    const {
        x,
        y,
        weapon,
        ammunition,
        secondAiState
    } = enemy;
    const {
        x2,
        y2
    } = playerObject;

    if (x < playerObject.x) {
        //I am a left side from player
        const distance = weapon.distance;
        const yAxisDifference = Math.max(y - playerObject.y, playerObject.y - y);
        if (distance >= yAxisDifference + (playerObject.x - x)) {
            enemy.aiState = 'shooting';
        } else {
//            enemy.aiState = 'quest';
//            enemy.secondAiState = 'none';
            //enemy.deleteLastReloadingTick(generalTimer);
        }
    } else if (x > playerObject.x) {
        //I am a right side from player
        const distance = weapon.distance;
        const yAxisDifference = Math.max(y - playerObject.y, playerObject.y - y);
        if (distance >= yAxisDifference + (x - playerObject.x)) {
            enemy.aiState = 'shooting';
        } else {
//            enemy.aiState = 'quest';
//            enemy.secondAiState = 'none';
            //enemy.deleteLastReloadingTick(generalTimer);
        }
    }
}

function checkCollision(enemy) {
    const {
        hitbox,
        aiState
    } = enemy;
    if (checkCollisionWith(hitbox, enemy.objectivePlayer.hitbox)) {
        if (aiState !== 'toattack') {
            enemy.aiState = 'toattack';
        }
        return true;
    } else {
        enemy.aiState = 'quest';
        return false;
    }
}

function pathWalking(enemy, generalTimer, blocks) {
    if (enemy.secondAiState === 'loadingpath') {
        if (enemy.path.length === 0) {
            
            if (enemy.weapon.type === 'distance') {
                enemy.aiState = 'shooting';
                enemy.secondAiState = 'icanshoot?';
            } else {
                enemy.aiState = 'quest';
                enemy.secondAiState = 'none';
            }
            //                        enemy.secondAiState = 'icanshoot?';  TODO
        } else {
            if (enemy.path[0].x > enemy.x) {
                enemy.walkingDirectionX = 'Right';
            } else if (enemy.path[0].x === enemy.x) {
                enemy.walkingDirectionX = 'none';
            } else {
                enemy.walkingDirectionX = 'Left';
            }
            enemy.objectiveX = enemy.path[0].x;

            if (enemy.path[0].y > enemy.y) {
                enemy.walkingDirectionY = 'Down';
            } else if (enemy.path[0].y === enemy.y) {
                enemy.walkingDirectionY = 'none';
            } else {
                enemy.walkingDirectionY = 'Up';
            }
            enemy.objectiveY = enemy.path[0].y;

            console.log('target', enemy.objectiveX, enemy.objectiveY, enemy.x, enemy.y, enemy.walkingDirectionY, enemy.walkingDirectionX, enemy.path);
            enemy.path.shift();
            //                        1590 693.5 1590 693.5 none none [ { x: 1762, y: 693.5 } ]
            enemy.secondAiState = 'walk';
        }
    } else if (enemy.secondAiState === 'walk') {
        moveTo(enemy, generalTimer, blocks); //TODO: DELETE blocks i usuń z funkcji
    }
}

function toAttack(enemy, generalTimer, attackList, playerObject) {
    const {
        weapon,
        aiState,
        secondAiState
    } = enemy;

    if (weapon.type === 'melee') { //MELEE
        let attackIs = false;
        const {
            listOfTicks
        } = generalTimer;
        const next = checkCollision();
        if (!next) {
            for (let i = 0; i < listOfTicks.length; i++) {
                if (listOfTicks[i].nameOfTick === 'EnemyLightAttack EnemyId:' + enemy.id) {
                    attackList.pop();
                    listOfTicks[i].old = true;
                }
            }
        } else {
            for (let i = 0; i < listOfTicks.length; i++) {
                if (listOfTicks[i].nameOfTick === 'EnemyLightAttack EnemyId:' + enemy.id) {
                    if (!listOfTicks[i].done && !listOfTicks[i].old) { //Jeśli nieskończony i nie stary:
                        attackIs = true;
                        break;
                    }
                }
            }

            if (!attackIs) {
                generalTimer.listOfTicks.push(new Tick('EnemyLightAttack EnemyId:' + enemy.id, generalTimer.generalGameTime, generalTimer.generalGameTime + enemy.weapon.speedLightAttack));
            }
        }
        if (attackList[attackList.length - 1] !== 'EnemyLightAttack EnemyId:' + enemy.id) {
            attackList.push('EnemyLightAttack' + enemy.id);
        }

    }

}

function shootAttack(enemy, generalTimer, playerObject) {
    const {weapon,secondAiState,aiState} = enemy;
    if (weapon.type === 'distance') { //DISTANCE
        console.log('DIS');
        if (aiState === 'shooting' && secondAiState === 'icanshoot?') {
            enemy.secondAiState = 'reloading';
        }
        if (secondAiState === 'icanshoot?' && aiState !== 'oblivion') {
            checkCanShoot(enemy, playerObject, generalTimer);
        } else if (secondAiState === 'waitforreaload') {
            for (const enemyTick of generalTimer.listOfTicks) {
                if (enemyTick.nameOfTick === 'Reloading Enemy Distance Weapon EnemyId:' + enemy.id) {
                    if (enemyTick.done && !enemyTick.old) {
                        enemy.secondAiState = 'shoot';
                        enemyTick.old = true;
                        checkCanShoot(enemy, playerObject, generalTimer);
                        break;
                    }
                }
            }

        } else if (secondAiState === 'shoot' && aiState === 'shooting') {
            attackWeapon(enemy, weapon, enemy.objectivePlayer, generalTimer, enemy.objectivePlayer, 'enemy');
            enemy.secondAiState = 'reloading';
        } else if (secondAiState === 'reloading' && aiState === 'shooting') {
            generalTimer.listOfTicks.push(new Tick('Reloading Enemy Distance Weapon EnemyId:' + enemy.id, generalTimer.generalGameTime, generalTimer.generalGameTime + 800));
            console.log(generalTimer.generalGameTime + 800);
            enemy.secondAiState = 'waitforreaload';
            checkCanShoot(enemy, playerObject, generalTimer);
        }
    }
}

function enemyAi(enemy, attackList, playerObject, generalTimer, chests, bullets, blocks) {
    const {
        isAlive,
        aiState,
        secondAiState,
        weapon,
        hp,
        ammunition
    } = enemy;

    if (playerObject === undefined) {
        console.log('none');
        return;
    }
    console.log(aiState, secondAiState);

    const {
        listOfTicks
    } = generalTimer;
    if (hp <= 0) {
        if (isAlive) {
            afterDeath(enemy, chests);
        }
        enemy.isAlive = false;
    } else {
        if (isAlive) {
            if (aiState !== 'oblivion') {
                threats(enemy, bullets, playerObject);
                //wherePlayer(enemy,playerObject, blocks);
            }
            if (aiState === 'quest') { //1.MOVE TO PLAYER
                moveToPlayer(enemy, playerObject);
                if (weapon.type === 'melee') {
                    checkCollision(enemy);
                }
                attackList.pop();
            } else if (aiState === 'whereplayer') {
                wherePlayer(enemy, playerObject, blocks);
            } else if (aiState === 'pathwalking') {
                pathWalking(enemy, generalTimer, blocks);
            } else if (aiState === 'dodge') {
                moveTo(enemy, generalTimer, blocks);
            } else if (aiState === 'toattack') {
                toAttack(enemy, generalTimer, attackList, playerObject);
            } else if (aiState === 'shooting') {
                shootAttack(enemy, generalTimer, playerObject);
            }
        }

    }
}

module.exports = {
    Enemy,
    enemyAi,
    choosePlayer,
    fieldOfView
};