class Bullet {
    constructor(x, y, width, height, hitbox, speed, minDmg, maxDmg, targetX, targetY, owner, distance) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = hitbox;
        this.minDmg = minDmg;
        this.maxDmg = maxDmg;
        this.speed = speed;
        this.movingDirectionAxisX;
        this.movingDirectionAxisY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distance = distance;
        this.owner = owner;
        this.directionSet = false;
        this.getMove = true;
    }
}

function checkTheDirectionOfTheBullet(bullet, wieldingWeapon) {
    const {
        targetX,
        targetY,
        directionSet
    } = bullet;
    const {
        x,
        y,
        width
    } = wieldingWeapon;


    if (!directionSet) {
        bullet.movingDirectionAxisX = (x < targetX) ? bullet.movingDirectionAxisX = 'Right' : bullet.movingDirectionAxisX = 'Left';
        bullet.movingDirectionAxisY = (y > targetY) ? bullet.movingDirectionAxisY = 'Up' : bullet.movingDirectionAxisY = 'Down';
        bullet.directionSet = true;
    }

    if (targetX + width * 1.3 >= x && targetX - width * 1.3 <= x) {
        bullet.movingDirectionAxisX = 'None';
        bullet.targetX = 'None';
        if (bullet.movingDirectionAxisY === 'Up') {
            bullet.targetY /= 7;
        } else {
            bullet.targetY *= 7;
        }
    }
}

function moveBullet(bullet) {
    const {
        x,
        y,
        movingDirectionAxisX,
        movingDirectionAxisY,
        speed,
        targetX,
        targetY,
        getMove
    } = bullet;

    bullet.x = bullet.x;
    bullet.y = parseInt(bullet.y);
    bullet.speed = parseInt(bullet.speed);

    if (getMove) {
        if (movingDirectionAxisX === 'Left') {
            bullet.x -= bullet.speed;
            bullet.distance -= bullet.speed;
        } else if (movingDirectionAxisX === 'Right') {
            bullet.x += bullet.speed;
            bullet.distance -= bullet.speed;
        }

        if (movingDirectionAxisY === 'Up') {
            bullet.y -= bullet.speed;
            bullet.distance -= bullet.speed;
        } else if (movingDirectionAxisY === 'Down') {
            bullet.y += bullet.speed;
            bullet.distance -= bullet.speed;
        }
    }

    if (targetX === 'None' && movingDirectionAxisY === 'None') {
        bullet.distance = 0;
    }

    const additionalLimit = speed;
    if (y === targetY || y - additionalLimit >= targetY && y + additionalLimit >= targetY && movingDirectionAxisY !== 'Up') {
        bullet.movingDirectionAxisY = 'None';
    } else if (movingDirectionAxisY === 'Up' && y === targetY || y + additionalLimit >= targetY && y - additionalLimit <= targetY) {
        bullet.movingDirectionAxisY = 'None';
    }

    if (bullet.distance <= 0) {
        bullet.speed = 0;
    }

}

module.exports = {
    Bullet,moveBullet, checkTheDirectionOfTheBullet
};