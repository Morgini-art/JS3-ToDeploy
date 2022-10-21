class Spell {
    constructor(name, requiredMagicEnergy, type, action, availablesObjects, reload, minDmg = null, maxDmg = null, time = null) {
        this.name = name;
        this.requiredMagicEnergy = requiredMagicEnergy;
        this.type = type;
        this.action = action;
        this.availablesObjects = availablesObjects;
        this.reload = reload;
        this.minDmg = minDmg;
        this.maxDmg = maxDmg;
        this.time = time;
    }
    
    bewitch(cursorMode ,thrower, typeOfThrower, spellsBuffer) {
        const {
            availablesObjects,
            requiredMagicEnergy,
            name,
            reload
        } = this;
        
        if (thrower.magicEnergy >= requiredMagicEnergy) {
            const lenght = spellsBuffer.spells.length;
            for (let x = 0; x < lenght; x++) {
                if (spellsBuffer.spells[x] === name) {
                    return 'moving';   
                }
            }
            if (typeOfThrower === 'player') {
                return 'marking';
                if (availablesObjects.substr(0, 5) === 'enemy' && cursorMode !== 'marking') {
                    return 'marking';
                } else if (cursorMode === 'marking') {
                    return 'moving';
                }
                
                if (availablesObjects.substr(0, 9) === 'direction' && cursorMode !== 'direction') {
                    return 'direction';
                } else if (cursorMode === 'direction') {
                    return 'moving';
                }
            }
        }
    }
    
    completeSpell(objective) {
        const {
            type,
            action,
            minDmg,
            maxDmg
        } = this;
        
        const givenDmg = Math.floor(Math.random() * (maxDmg - minDmg + 1) + minDmg);
        objective.hp -= givenDmg;
    }
}

class SpellsBuffer {
    constructor() {
        this.spells = [];
        this.reloadsTimes = [];
    }
}

function renewMagicEnergy(restoring, magicEnergyPerSecond) {  
        const {
            magicEnergy,
            maxMagicEnergy
        } = restoring;
        
        restoring.loaderMagicEnergy += magicEnergyPerSecond;
        
        if (restoring.loaderMagicEnergy >= 1) {
            if (++restoring.magicEnergy > maxMagicEnergy) {
                restoring.magicEnergy = maxMagicEnergy;
            } else {
                restoring.magicEnergy;    
            }
            restoring.loaderMagicEnergy = restoring.loaderMagicEnergy - 1;    
        }
        if (magicEnergyPerSecond > 1) {
            if (restoring.magicEnergy + magicEnergyPerSecond > maxMagicEnergy) {
                restoring.magicEnergy = maxMagicEnergy;
                restoring.loaderMagicEnergy = 0;
            }
        }
        
}


module.exports = {Spell, renewMagicEnergy, SpellsBuffer};