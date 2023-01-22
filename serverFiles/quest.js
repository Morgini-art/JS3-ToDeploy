const randomXY = require('./lib-0').randomXY;

class Npc {
    constructor(id, x, y, width, height, hitbox, dialogues) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = hitbox;
        this.dialogues = dialogues;
        
        this.startX = x;
        this.startY = y;
        this.aiState = 'wandering';
        this.objectiveX;
        this.objectiveY;
        this.walkingDirectionX = 'none';
        this.walkingDirectionY = 'none';
    }

    draw(ctx, color) {
        const {
            x,
            y,
            width,
            height
        } = this;
        ctx.fillStyle = color;
    }

    moveTo() {
        const {
            x,
            y,
            walkingDirectionX,
            walkingDirectionY,
            aiState,
            objectiveX,
            objectiveY
        } = this;
        
        const movingSpeed = 3; //TODO: delete const
        
        if (walkingDirectionX === 'Left' &&  x !== objectiveX) {
            this.x -= movingSpeed;
            if (this.x <= this.objectiveX) {
                this.walkingDirectionX = 'None';
                this.aiState = 'wandering';
            }
        } else if (walkingDirectionX === 'Right'  &&  x !== objectiveX) {
            this.x += movingSpeed;
            if (this.x >= this.objectiveX) {
                this.walkingDirectionX = 'None';
                this.aiState = 'wandering';
            }
        }

        if (walkingDirectionY === 'Up'  &&  y !== objectiveY) {
            this.y -= movingSpeed;
            if (this.y <= this.objectiveY) {
                this.walkingDirectionY = 'None';
                this.aiState = 'wandering';
            }
        } else if (walkingDirectionY === 'Down'  &&  y !== objectiveY) {
            this.y += movingSpeed;
            if (this.y > this.objectiveY) {
                this.walkingDirectionY = 'None';
                this.aiState = 'wandering';
            }
        }
    }
    
    whereTarget(target) {
        const {
            x,
            y,
            aiState
        } = this;

        if (target.x > x) {
            this.walkingDirectionX = 'Right';
            this.objectiveX = target.x;
        } else {
            this.walkingDirectionX = 'Left';
            this.objectiveX = target.x;
        }

        if (target.y > y) {
            this.walkingDirectionY = 'Down';
            this.objectiveY = target.y;
        } else {
            this.walkingDirectionY = 'Up';
            this.objectiveY = target.y;
        }
        
    }
    
    ai() {
        const {
            aiState,
            x,
            y
        } = this;

//        console.log(Math.abs(this.startX - x) + Math.abs(this.startY - y));
        if (aiState === 'wandering') {
            this.aiState = 'wait';
            const time = ( Math.floor(Math.random() * 6.5 ) + 2.5) * 1000;
//            const time = 10;
            setTimeout(() => {
                const object = randomXY(this.startX, this.startY, x, y, 280, -280, 450, 280);

                //            console.log(object);
                this.aiState = 'walking';
                this.whereTarget(object);
            }, time);
        } else if (aiState === 'walking') {
            this.moveTo();
        }
    }
}



class Quest {
    constructor(name, state, eventList, npcList) {
        this.name = name;
        this.state = state;
        this.eventList = eventList;
        this.npcList = npcList;
    }
}

class Dialogue {
    constructor(name, words, choice, choices, talking) {
        this.name = name;
        this.words = words;
        this.choice = choice;
        this.choices = choices;
        this.talking = talking;
    }
}

module.exports = {
    Npc,
    Quest,
    Dialogue
};