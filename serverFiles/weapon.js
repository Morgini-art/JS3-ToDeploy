const Tick = require('./time').Tick;

class Weapon {
    constructor(name, minDmg, maxDmg, weight, energyLightAttack, speedLightAttack, type, bulletSpeed = 0, requiredAmmunition, reloadingTime) {
        this.name = name;
        this.minDmg = minDmg;
        this.maxDmg = maxDmg;
        this.weight = weight;
        this.energyLightAttack = energyLightAttack;
        this.speedLightAttack = speedLightAttack;
        this.type = type;
        this.bulletSpeed = bulletSpeed;
        this.requiredAmmunition = requiredAmmunition;
        this.distance = 500;
        this.reloadingTime = reloadingTime;
    }

    reload(generalTimer, ammunition, wieldingWeapons, ammunitionId, wieldingWeaponsType) {
        const {
            type,
            reloadingTime
        } = this;
        const {
            reloading,
            actualAmmunition,
            maxMagazine,
            allAmmunition
        } = ammunition;
        
        if (type === 'distance') {
            if (!reloading && actualAmmunition < maxMagazine && allAmmunition !== 0) {
                if (wieldingWeaponsType === 'enemy') {
                     generalTimer.listOfTicks.push(new Tick('Reloading a enemy distance weapon' + wieldingWeapons.id + ',' + ammunitionId, generalTimer.generalGameTime, generalTimer.generalGameTime + reloadingTime));    
                    console.log('Reloading a enemy distance weapon' + wieldingWeapons.id + ',' + ammunitionId);
                } else {
                    generalTimer.listOfTicks.push(new Tick('Reloading a player distance weapon' + wieldingWeapons.id + ',' + ammunitionId, generalTimer.generalGameTime, generalTimer.generalGameTime + reloadingTime));    
                }
                console.warn(allAmmunition, maxMagazine, actualAmmunition, reloading, reloadingTime);
                wieldingWeapons.ammunition[ammunitionId].reloading = true;
                console.log(ammunition.maxMagazine, );
                wieldingWeapons.ammunition[ammunitionId].allAmmunition -= Math.min(maxMagazine, allAmmunition);
            }
        }

    }

    attack(wieldingWeapons, objectives, generalTimer, objective, wieldingWeaponsType) {
        const {
            type,
            minDmg,
            maxDmg,
            bulletSpeed,
            requiredAmmunition
        } = this;

        const {
            x,
            y
        } = wieldingWeapons;

        if (type === 'melee') {
            const givenDmg = Math.floor(Math.random() * (this.maxDmg - this.minDmg + 1) + this.minDmg);
            if (wieldingWeaponsType === 'enemy') { //Enemy attack
                objective.hp -= givenDmg;
                console.log('Enemy attack');
            } else if (wieldingWeaponsType === 'player') { //Player attack
                generalTimer.listOfTicks.push(new Tick('Player attack{id:' + wieldingWeapons.id + ',dmg:' + givenDmg + '}', generalTimer.generalGameTime, generalTimer.generalGameTime + this.speedLightAttack));
                console.log('Player attack');
            }
        }


        if (type === 'distance') {
            let ammunition;
            for (const ammo of wieldingWeapons.ammunition) {
                if (ammo.name === requiredAmmunition.name) {
                    ammunition = ammo;
                }
            }
            
            let id = 0;
            
            for (let i = 0; i > wieldingWeapons.ammunition.length; i++) {
                const ammo = wieldingWeapons.ammunition[i];
                if (ammo.name === ammunition.name) {
                    id = i;
                    break;
                }    
            }

            const {
                actualAmmunition,
                reloading
            } = wieldingWeapons.ammunition[id];
            
//            console.log(wieldingWeapons, wieldingWeapons.ammunition);
            
            if (actualAmmunition > 0 && !reloading) { //We can shoot
                //So we shoot
                if (wieldingWeaponsType === 'player') {
                    console.log(objectives);
                    const targetX = (x - 700) + objectives.x;
                    const targetY = (y - 460) + objectives.y;
                    generalTimer.listOfTicks.push(new Tick('Creating a Bullet{x:' + x + ',y:' + y + ',width:20,height:20,speed:4,minDmg:' + minDmg + ',maxDmg:' + maxDmg + ',targetX:' + targetX + ',targetY:' + targetY + ',owner:' + wieldingWeapons.id + '}', generalTimer.generalGameTime, generalTimer.generalGameTime + this.speedLightAttack));
                } else if (wieldingWeaponsType === 'enemy') {
                    generalTimer.listOfTicks.push(new Tick('Creating a Bullet{x:' + x + ',y:' + y + ',width:20,height:20,speed:4,minDmg:' + minDmg + ',maxDmg:' + maxDmg + ',targetX:' + objective.x + ',targetY:' + objective.y + ',owner:Enemy' + wieldingWeapons.id + '}', generalTimer.generalGameTime, generalTimer.generalGameTime + this.speedLightAttack));
                }
                
                console.log(wieldingWeapons.ammunition[id].actualAmmunition);
                wieldingWeapons.ammunition[id].actualAmmunition--;
                console.log(wieldingWeapons.ammunition[id].actualAmmunition);
                
                //Auto Reload
                if (!reloading && wieldingWeapons.ammunition[id].actualAmmunition === 0) {
                    console.log('RELOAD');
                    this.reload(generalTimer, wieldingWeapons.ammunition[id], wieldingWeapons, id, wieldingWeaponsType);
                }
            }

        }
    }
}

class Ammunition {
    constructor(name, weight, type, maxMagazine, allAmmunition) {
        this.name = name;
        this.type = type;
        this.weight = weight;
        this.maxMagazine = maxMagazine;
        this.allAmmunition = allAmmunition;
        this.actualAmmunition = maxMagazine;
        this.reloading = false;
    }
}

module.exports = {
    Weapon,
    Ammunition
};