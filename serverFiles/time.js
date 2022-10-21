class Timer {
    generalGameTime = 0;
    listOfTicks = new Array;
    clearedCache = 0;
    
    checkTheTickTime() {
        for (let i = 0; i < this.listOfTicks.length; i++) {
            if (this.listOfTicks[i].endTime === this.generalGameTime) {
                this.listOfTicks[i].done = true;
                //console.log('The Tick Has Be End: ' + this.listOfTicks[i].nameOfTick);
            }
        }

        this.generalGameTime++;
    }
}

class Tick {
    constructor(nameOfTick, startTime, endTime, done = false, old = false) {
        this.nameOfTick = nameOfTick;
        this.startTime = startTime;
        this.endTime = endTime;
        this.done = done;
        this.old = old;
    }
}


function timeLoop(timerObject) {
    timerObject.checkTheTickTime();
    //console.log(timerObject.generalGameTime);
}

function clearTimerCache (timer) {
    const old = timer.listOfTicks.length;
    
    timer.listOfTicks.forEach((tick, id)=>{
        if (tick.done && tick.old || tick.old && !this.done) {
            timer.listOfTicks.splice(id, 1);    
        }    
    });
    
    timer.clearedCache += old-timer.listOfTicks.length;
    //console.log(timer.listOfTicks.length, timer.clearedCache);
}

module.exports = {Timer, Tick, timeLoop, clearTimerCache};