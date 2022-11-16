class Bullet {
    constructor(x, y, width, height, hitbox, speed, minDmg, maxDmg, targetX, targetY,owner, distance) {
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

    draw(ctx) {
        const {
            x,
            y,
            width,
            height
        } = this;
        ctx.fillStyle = '#b3a276';
        ctx.fillRect(x, y, width, height);
    }
    
    checkTheDirection(wieldingWeapon) {
        const {targetX, targetY, directionSet} = this;
        const {x, y, width} = wieldingWeapon;
        
        console.log('WWWWWWWWWWWWW', x, y, width);
        
        if (!directionSet) {
            this.movingDirectionAxisX = (x < targetX) ? this.movingDirectionAxisX = 'Right' : this.movingDirectionAxisX = 'Left';
            this.movingDirectionAxisY = (y > targetY) ? this.movingDirectionAxisY = 'Up' : this.movingDirectionAxisY = 'Down';
            this.directionSet = true;
        }
        
        if (targetX + width * 1.3 >= x && targetX - width * 1.3 <= x) {
            this.movingDirectionAxisX = 'None';
            this.targetX = 'None';
            if (this.movingDirectionAxisY === 'Up') {
                this.targetY /= 7;    
            } else {
                this.targetY *= 7;         
            }
        }
    }
    
    move() {
        const {
            x,
            y,
            movingDirectionAxisX,
            movingDirectionAxisY,
            speed,
            targetX,
            targetY,
            getMove
        } = this;
        
        this.x = this.x;
        this.y = parseInt(this.y);
        this.speed = parseInt(this.speed);
        
        if (getMove) {
            if (movingDirectionAxisX === 'Left') {
                this.x -= this.speed;
                this.distance -= this.speed;
            } else if (movingDirectionAxisX === 'Right') {
                this.x += this.speed;
                this.distance -= this.speed;
            }

            if (movingDirectionAxisY === 'Up') {
                this.y -= this.speed;
                this.distance -= this.speed;
            } else if (movingDirectionAxisY === 'Down') {
                this.y += this.speed;
                this.distance -= this.speed;
            }
        }
        
        if (targetX === 'None' && movingDirectionAxisY === 'None') {
            this.distance = 0;    
        }
        
        const additionalLimit = speed;
        if (y === targetY || y - additionalLimit >= targetY && y + additionalLimit >= targetY && movingDirectionAxisY !== 'Up') {
            this.movingDirectionAxisY = 'None';
        } else if (movingDirectionAxisY === 'Up' && y === targetY || y + additionalLimit >= targetY && y - additionalLimit <= targetY) {
            this.movingDirectionAxisY = 'None';
        }
        
        if (this.distance <= 0) {
            this.speed = 0;
        }
        
    }
}

module.exports = {Bullet};