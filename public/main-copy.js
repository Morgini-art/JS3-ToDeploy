const version = '1.0.0';

const can = document.querySelector('#game');
const canDirty = document.querySelector('#dirty-game');
const canUi = document.querySelector('#game-ui');
const clickHandler = document.querySelector('#click-handler');
const info = document.querySelector('#info');
const playerNick = document.getElementById('nick-name');
const startGameBtn = document.querySelector('#start-game');
const startMenu = document.querySelector('#menu');
const gameWindow = document.querySelector('#game-window');
const serverStatusInfo = document.querySelector('#server-status-info');
const serverPingInfo = document.querySelector('#server-ping-info');
const ctx = can.getContext('2d');
const ctxUi = canUi.getContext('2d');
const dirtyCtx = canDirty.getContext('2d');

let originX = 0;
let originY = 0;
let cursorMode = 'none';

let showInvetory = false;
let showCrafting = false;
let gameTime;

startGameBtn.addEventListener('click', () => {
    startGame();
});

//Mobile
const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let mobileShootingCursor = false;
//Mobile END

class Hitbox {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

const camera = {
    x: 1600,
    y: 180,
    width : 1400,
    height: 920,
    hitbox: new Hitbox(0, 0, 1400, 920)
};

//1100
//180

const cameraMoveAxis = {
    x: 0,
    y: 0
}

let state = 'waitForNick';

let ping = 0;
let debug = {
    showCameraViewport: true,
    savedItems: [],
    savedItemsSecondVersion: [],
    showSavedItems: true,
    showHitbox: true,
    mousePosition : true
};

let debugData = {
    enemiesPath: []
};

let tools = {
    creatingEnemy: false,
    deletingEnemy: false,
};

let myPlayer;
let tryReconnect = false;
let timeToFailedReconnect = 8000;
let gamePlayers = [];
let gameBullets = [];
let gameChests = [];
let gameEnemies = [];
let gameMap = [];
let gameBlocks = [];
let gameChunks = [];
let gameNpcs = [];

let gameState;
let cameraState = 'unlock';

class Button {
    constructor(x, y, width, height, event, active, image, other) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.event = event;
        this.active = active;
        this.image = image;
        this.hitbox;
        this.other = other;
    }

    draw() {
        const {
            image,
            x,
            y,
            active
        } = this;
        if (active) {
            ctxUi.drawImage(image, x, y);
        }
    }
}

//IMAGES
//Ui
const openUiBtnImage = new Image();
const craftUiBtnImage = new Image();
const changeWeaponUiBtnImage = new Image();
const shootUiBtnImage = new Image();
const solidObjectsSpritesheet = new Image();
const backgroundSpritesheet = new Image();
const invetoryImage = new Image();
const hpBarFullImage = new Image();
const hpBarEmptyImage = new Image();
const hpBarNearlyFullImage = new Image();
openUiBtnImage.src = 'img/ui/open3.png';
craftUiBtnImage.src = 'img/ui/craft.png';
changeWeaponUiBtnImage.src = 'img/ui/change-weapon.png';
shootUiBtnImage.src = 'img/ui/shoot.png';
solidObjectsSpritesheet.src = 'img/world/solidObjectsTile.png';
backgroundSpritesheet.src = 'img/world/backgroundTiled01.png';
invetoryImage.src = 'img/ui/invetory/invetory.png';
hpBarFullImage.src = 'img/ui/hp-bar/full2.png';
hpBarNearlyFullImage.src = 'img/ui/hp-bar/3.4.png';
hpBarEmptyImage.src = 'img/ui/hp-bar/1.4.png';
//Ui End

//World
const grassSpritesheet = new Image();
grassSpritesheet.src = 'img/world/grass.png';
//World End
//END - IMAGES

const uiButtons = {
    open: new Button(575, 650, 50, 50, 'open-chest', false, openUiBtnImage),
    changeWeapon: new Button(50, 650, 100, 100, 'change-weapon', true, changeWeaponUiBtnImage),
    shoot: new Button(50, 500, 100, 100, 'shoot', mobile, shootUiBtnImage),
    craftingButtons: []
};

const log = document.getElementById('log');

function startGame() {
    const mode = document.getElementById('player-mode').value;
//    console.log(mode);
    if (playerNick.value !== '') {
        let state;
        if (mode === 'player') {
            state = 'yesPlay';
        } else if (mode === 'spectator') {
            state = 'spectator';
        }

        const host = 'localhost';

        const socket = io(); //Connect => connected
        
        socket.on('connect_error', (err) => {
            socket.disconnect()
            socket.sendBuffer = [];
            gameWindow.style.display = 'none';
            if (confirm('Server disconnected. Do you want to try to reconnect to the server?')) {
                startGame();    
            }
        });
                
        const object = {
            state: state,
            name: playerNick.value
        };
        
        socket.emit('enter-to-game', object); //Server check version (true) => :145 or(false) => :149

        socket.once('assign-player', data => {
            myPlayer = data;
            updateUi();
        });
        
        clickHandler.addEventListener('click', (e) => {
            const {
                invetory
            } = myPlayer;
//            console.warn(invetory);
            if (showInvetory) {
                socket.emit('move-item-in-invetory', {
                    x: mouseX,
                    y: mouseY
                });
            }
        });
        
        socket.on('get-version', (callback) => {
            /*callback({
                version: version
            });*/
        });
        
        socket.on('delete-connection', data => {
            socket = null;
            alert('Your client version is no good');
        });

        socket.on('send-alert', data => {
            alert(data);
        });
        
        socket.on('send-time', data => {
            gameTime = data;
        });

        socket.on('change-cursor-state', data => {
            cursorMode = data;
//            console.error(cursorMode);
            if (cursorMode === 'marking') {
                clickHandler.style.cursor = 'crosshair';
            } else if (cursorMode === 'direction') {

                clickHandler.style.cursor = 'pointer';
            } else {
                clickHandler.style.cursor = 'auto';
                cursorMode = 'moving';
            }
        });

        socket.on('send-status-server', data => {
            if (data.state === 'connected') {
                serverStatusInfo.innerHTML = 'Status: Connected';
                socket.emit('client-version', version);
                //serverStatusInfo.innerHTML += 'Server status: Connected Checking Version';
            } else {
                serverStatusInfo.innerHTML = data;
            }
        });

        socket.on('send-info', data => {
            info.innerHTML = data;
        });

        socket.on('send-players', data => {
            gamePlayers = data;
            for (const player of gamePlayers) {
                if (socket.id === player.id) {
                    if (JSON.stringify(myPlayer) !== JSON.stringify(player)) {
                        myPlayer = player;
                        updateUi();
                        socket.emit('update-object');
                    }
                } else {
//                    console.log(player.movingSpeed);
                }
            }
        });

        socket.on('send-bullets', data => {
            gameBullets = data;
        });
        
        socket.on('debug-saved-items-count', data => {
            debug.savedItems = data;
        });
        
        socket.on('debug-saved-items-second-count', data => {
            debug.savedItemsSecondVersion = data;
        });

        socket.on('send-chests', data => {
            gameChests = data;
        });
        
        socket.on('send-npcs', data => {
            gameNpcs = data;
        });

        socket.on('send-enemies', data => {
            gameEnemies = data;
        });

        socket.on('send-map', data => {
            gameMap = data;
        });

        socket.on('send-blocks', data => {
            gameBlocks = data;
        });

        socket.on('send-game-state', data => {
            gameState = data;
        });

        socket.on('send-chunks', data => {
            gameChunks = data;
        });
        
        
        //EVENTS-------------------------------------------------------------------------------------------------------------------------------
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 32) {
                e.preventDefault();
                socket.emit('player-open-chest');
            } else if (e.keyCode === 86) {
                socket.emit('player-change-weapon');
            } else if (e.keyCode === 69) {
                socket.emit('request-cursor-mode', cursorMode);
            } else if (e.keyCode === 84) {
                socket.emit('player-change-spell');
            } else if (e.keyCode === 89) {
                if (cameraState === 'lock') {
                    cameraState = 'unlock';
                } else {
                    cameraState = 'lock';
                }
                console.log(cameraState);
            } else if (e.keyCode === 57) {
                debug.showSavedItems = !debug.showSavedItems;
                updateUi();
            } else if (e.keyCode === 48) {
                debug.showCameraViewport = !debug.showCameraViewport;
            } else if (e.keyCode === 76) {
                tools.deletingEnemy = false;
                tools.creatingEnemy = !tools.creatingEnemy;
                updateUi();
            } else if (e.keyCode === 75) {
                tools.deletingEnemy = !tools.deletingEnemy;
                tools.creatingEnemy = false;
                updateUi();
            } else if (e.keyCode === 71) {
                direction *= -1;
                
                /*for (const ray of fieldOfView) {
                    const {state} = ray;
                    if (state === 3) ray.state = 2;
                    else if (state === 2) ray.state = 1;
                    else if (state === 1) ray.state = 0;
                    else if (state === 0) ray.state = 3;
                }*/
            }
        });
        
        document.addEventListener('keydown', e => {
            if (cameraState === 'unlock') {
                if (e.keyCode === 38) {
                    cameraMoveAxis.y = -7;
                } else if (e.keyCode === 40) {
                    cameraMoveAxis.y = 7;
                } else if (e.keyCode === 37) {
                    cameraMoveAxis.x = -7;
                } else if (e.keyCode === 39) {
                    cameraMoveAxis.x = 7;
                }
            }
            if (e.keyCode === 107) {
                console.log(camera);
                camera.width -= 76;
                camera.height -= 50;
                console.log(camera);
            } else if (e.keyCode === 109) {
                console.log(camera);
                camera.width += 76;
                camera.height += 50;
            }
        });
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 38 || e.keyCode === 40) {
                cameraMoveAxis.y = 0;
            } else if (e.keyCode === 37 || e.keyCode === 39) {
                cameraMoveAxis.x = 0;
            } 
        });
        
        

        clickHandler.addEventListener('click', e => {

            //fconsole.warn(checkCollisionWith(new Hitbox(e.offsetX, e.offsetY, 4, 4), new Hitbox(uiButtons.open.x, uiButtons.open.y, uiButtons.open.width, uiButtons.open.height)));
            for (const button of uiButtons.craftingButtons) {
                console.log(button);
                if (checkCollisionWith(new Hitbox(e.offsetX, e.offsetY, 4, 4), new Hitbox(button.x,button.y, button.width, button.height))) {
                    console.log(button.other, 'Click');
                    socket.emit('craft-item', button.other);
                }
            }
            
            if (checkCollisionWith(new Hitbox(e.offsetX, e.offsetY, 4, 4), new Hitbox(uiButtons.open.x, uiButtons.open.y, uiButtons.open.width, uiButtons.open.height))) {
//                console.log('SSSSS');

                socket.emit('player-open-chest');
            } else if (checkCollisionWith(new Hitbox(e.offsetX, e.offsetY, 4, 4), new Hitbox(uiButtons.changeWeapon.x, uiButtons.changeWeapon.y, uiButtons.changeWeapon.width, uiButtons.changeWeapon.height))) {
                socket.emit('player-change-weapon');
            } else if (checkCollisionWith(new Hitbox(e.offsetX, e.offsetY, 4, 4), new Hitbox(uiButtons.shoot.x, uiButtons.shoot.y, uiButtons.shoot.width, uiButtons.shoot.height))) {
                mobileShootingCursor = !mobileShootingCursor;
            } else if (!mobileShootingCursor) {
                
            } else if (mobileShootingCursor) {
                const object = {
                    x: e.offsetX,
                    y: e.offsetY
                };
//                console.log(object);
                socket.emit('player-attack', object);
            }

            if (cursorMode === 'marking') {
                let counter = 0;
                let uses = false;
                const targetX = (e.offsetX - 700) + myPlayer.x;
                const targetY = (e.offsetY - 460) + myPlayer.y;
                const cursorHitbox = new Hitbox(targetX, targetY, 5, 5);

//                console.error('DWAAAAAAAA', cursorHitbox, myPlayer.x, myPlayer.y);
                socket.emit('spell-marking', cursorHitbox);

               
            } else if (cursorMode === 'direction') {
               
            }
            
            if (tools.creatingEnemy) {
                socket.emit('create-enemy',{x:mouseX,y:mouseY,camera:camera});
//                ctx.fillRect(mouseX + x - ((width - myPlayer.width) / 2), mouseY + y - ((height - myPlayer.height) / 2), 50, 65);
            }
            
            if (tools.deletingEnemy) {
                socket.emit('delete-enemy',{x:mouseX,y:mouseY,camera:camera});
            }

        });


        document.addEventListener('mousedown', (e) => {
            socket.emit('player-mouse-down', e.which);
        });

        window.oncontextmenu = function () {
            return false;
        }

        document.addEventListener('mouseup', (e) => {
            socket.emit('player-mouse-up', e.which);
        });

        document.addEventListener('keydown', (e) => {
            socket.emit('player-start-move', e.keyCode);
        });

        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 73) {
                showInvetory = !showInvetory;
                showCrafting = false;
                uiButtons.craftingButtons.length = 0;
                updateUi();
            } else if (e.keyCode === 52) {
                console.log(uiButtons.craftingButtons);
                showCrafting = !showCrafting;
                showInvetory = false;
                uiButtons.craftingButtons.length = 0;
                updateUi();
            }
        });

        document.addEventListener('keyup', (e) => {
            socket.emit('player-stop-move', e.keyCode);
        });

        setInterval(() => {
            const start = Date.now();

            socket.emit('ping', () => {
                const duration = Date.now() - start;
                ping = duration + 'ms';
//                const day = floor(gameTime / 6000 * 2);
//                const hour = gameTime - day;
                serverPingInfo.innerHTML = 'Ping: '+ping;
            });
        }, 1000);

        clickHandler.addEventListener('contextmenu', e => {
            e.preventDefault();
//            console.log(e);
            const object = {
                x: e.offsetX,
                y: e.offsetY
            };
//            console.log(object);
            socket.emit('player-attack', object);
//            console.log('playerattack');
        });



        gameWindow.style.display = 'grid';
        document.getElementById('header-1').style.display = 'none';
        //        can.style.display = 'block';
        canUi.style.display = 'block';
        canDirty.style.display = 'block';
        clickHandler.style.display = 'block';
        startMenu.style.display = 'none';
        // gameWindow.requestFullscreen(({ navigationUI: 'show' }));
        if (mobile) {
            let width = /*Math.min(1200, window.innerWidth);*/ 1200;
            let height = /*Math.min(800, window.innerHeight);*/ 800;
        }
    }
}


let mouseX;
let mouseY;

clickHandler.addEventListener('mousemove', (e) => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});

ctx.font = '20px Monospace';
ctxUi.font = '20px Monospace';

function drawAll() {
    ctx.clearRect(0, 0, 5000, 5000);
    drawMap(gameMap);
    drawBlocks(gameBlocks);
    drawPlayers(gamePlayers);
    drawEnemies(gameEnemies);
    drawNpcs(gameNpcs);
    drawChests(gameChests);
    drawBullets(gameBullets);
    if (myPlayer !== undefined) {
        drawInvetory(myPlayer.invetory, null, ctxUi, 'full-view', canUi, invetoryImage);
//        drawCrafting();
    }
    uiButtons.changeWeapon.draw();
    uiButtons.open.draw();
    uiButtons.shoot.draw();
    for (const button of uiButtons.craftingButtons) {
//        console.error(button.draw);
        button.draw();
    }
    if (debug.showCameraViewport && myPlayer !== undefined) {
        const {x,y,width,height} = myPlayer;
//        ctx.strokeRect((camera.width - width) / 2, (camera.height - height) / 2, 1400, 920);  
//        ctx.strokeRect(x - camera.width/ 2 - width, (camera.height - height) / 2, 1400, 920);  
        ctx.strokeStyle = 'red';
        ctx.strokeRect(x - ((1400 - myPlayer.width) / 2), y - ((920 - myPlayer.height) / 2), 1400, 920);  
        ctx.strokeStyle = 'black';
//        ctx.strokeRect(x - (camera.width / 2), y - (camera.height / 2), 1400, 920);  
    }
    if (debug.mousePosition && myPlayer !== undefined) {
//        updateUi();
    }
    drawTools();
    setCamera();
    requestAnimationFrame(drawAll);
}

function drawTools() {
    if (tools.creatingEnemy) {
//        const {x,y,width,height} = myPlayer;
        const {x,y,width,height} = camera;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = 'brown';
        ctx.fillRect(mouseX + x - ((width - myPlayer.width) / 2), mouseY + y - ((height - myPlayer.height) / 2), 50, 65);
        ctx.globalAlpha = 1;
    } 
    if (tools.deletingEnemy) {
//        const {x,y,width,height} = myPlayer;
        const {x,y,width,height} = camera;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#c78d1a';
        ctx.fillRect(mouseX + x - ((width - myPlayer.width) / 2), mouseY + y - ((height - myPlayer.height) / 2), 25, 25);
        ctx.globalAlpha = 1;
    }
}

function setCamera() {
    if (cameraState === 'lock' && myPlayer !== undefined) {
        const {x,y,width,height} = myPlayer;
        camera.x = x;
        camera.y = y;
    }
    if (gameState === 'play') {
        dirtyCtx.clearRect(0, 0, canDirty.width, canDirty.height);
        dirtyCtx.drawImage(can, camera.x - Math.floor((camera.width - myPlayer.width) / 2), camera.y - Math.floor((camera.height - myPlayer.height) / 2), camera.width, camera.height, 0, 0, 1400, 920);
//        dirtyCtx.drawImage(can, camera.x - 700, camera.y - 460, canDirty.width, canDirty.height, 0, 0, 1400, 920);
    }
    camera.x += cameraMoveAxis.x;
    camera.y += cameraMoveAxis.y;
}

function drawBullets(gameBullets) {
    if (gameBullets.length !== 0) {
        for (const bullet of gameBullets) {
            const {x, y, width, height} = bullet;
            if (bullet.icon === myPlayer.id) {
                ctx.fillStyle = '#32a852';
            } else {
                ctx.fillStyle = '#b84f28';
            }
            ctx.fillRect(x, y, width, height);
            if (debug.showHitbox) {
                ctx.fillStyle = 'red';
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
}


function drawMap(gameMap) {
    /*if (gameMap.length !== 0) {
        for (let width = 0; width < 5; width++) {
            for (let height = 0; height < 5; height++) {
                const chunk = gameMap.chunks[width][height];
                for (const block of chunk.content) {
                    const {x, y, width, height, type} = block;
                    
                    ctx.drawImage(backgroundSpritesheet, 64 * type, 0, 64, 64, x, y, width, height);
//            ctx.strokeRect(x, y, width, height);
            }
                //ctx.strokeRect(gameMap.chunks[width][height].x, gameMap.chunks[width][height].y, gameMap.chunks[width][height].width, gameMap.chunks[width][height].height);
            }
        }
    }*/


    if (gameChunks.length !== 0) {
        for (let width = 0; width < 3; width++) {
            for (let height = 0; height < 3; height++) {
                const chunk = gameChunks[width][height];
//                console.log(gameChunks);
                /*for (const block of chunk.content) {
                    const {x, y, width, height, type} = block;
                    
                    ctx.drawImage(backgroundSpritesheet, 64 * type, 0, 64, 64, x, y, width, height);
//            ctx.strokeRect(x, y, width, height);
            }*/
                //ctx.strokeRect(gameMap.chunks[width][height].x, gameMap.chunks[width][height].y, gameMap.chunks[width][height].width, gameMap.chunks[width][height].height);
            }
        }
    }
}

function drawChests(gameChests) {
    if (gameChests.length !== 0) {
        for (const chest of gameChests) {
            const {x,y,width,height} = chest;
            if (chest.icon === 'item') {
                ctx.fillStyle = '#239db0';
            } else if (chest.icon === 'chest') {
                ctx.fillStyle = '#b0531e';
            }

            if (!chest.isOpen) {
                ctx.fillRect(x, y, width, height);
                if (debug.showHitbox) {
                    ctx.fillStyle = 'red';
                    ctx.strokeRect(x, y, width, height);
                }
            }
            
        }
    }
}

function checkCollisionWith(hitbox1, hitbox2) {
    if (hitbox1.x < hitbox2.x + hitbox2.width &&
        hitbox1.x + hitbox1.width > hitbox2.x &&
        hitbox1.y < hitbox2.y + hitbox2.height &&
        hitbox1.height + hitbox1.y > hitbox2.y) {

        return true;

    } else {
        return false;
    }
}

function drawInvetory(invetory, ctx, functionDrawText, mode, can, graphics) {
//    console.log(invetory);
    const {
        basicSlots,
        numberOfBasicSlots,
    } = invetory;
    //console.log(graphics);

    if (showInvetory && mode === 'quick-preview') {
        functionDrawText(1080, 40, basicSlots, 'black', 20, 'Monospace', numberOfBasicSlots, 'Invetory/content');
    } else if (showInvetory && mode === 'full-view') {
//        console.warn('A');
        const generalY = (950 - 698) / 2;
        const generalX = (1500 - 854) / 2;
        ctxUi.drawImage(graphics, generalX, generalY);

        ctxUi.fillStyle = 'black';
        ctxUi.fillRect(generalX, generalY ,20 ,20);
        ctxUi.fillStyle = 'white';
        ctxUi.fillText('D',generalX, generalY + 20);
        for (let i = 0; i < numberOfBasicSlots; i++) {
            const dSlot = basicSlots[i];
//            console.log(dSlot);
            if (dSlot.content !== 'empty') {
                if (dSlot.content.itemName === 'Test01') {
                    ctxUi.fillStyle = 'green';
                } else {
                    ctxUi.fillStyle = 'white';
                }
                ctxUi.fillStyle = 'black';
                ctxUi.fillText(dSlot.content.itemName, generalX + dSlot.x, generalY + dSlot.y);
                ctxUi.fillText(dSlot.amount, generalX + dSlot.x, generalY + dSlot.y - 20);
                ctxUi.fillText('2', 500, 500);
                ctxUi.fillStyle = 'white';
                ctxUi.fillRect(generalX + dSlot.x, generalY + dSlot.y, 85, 85);
            }
        }
    }

    if (showInvetory) {
        for (const slot of myPlayer.invetory.basicSlots) {
            const slotHitbox = new Hitbox(323 + slot.x, 126 + slot.y, 85, 85);
            const cursor = new Hitbox(mouseX, mouseY, 1, 1);
            const collisionWith = checkCollisionWith(cursor, slotHitbox);

            if (collisionWith) {
//                console.log(slot);
                ctxUi.fillStyle = 'black';
                if (slot.content !== 'empty') {
                    //                drawText(323 + 55, 126 + 490 + 20, slot.content.itemName, 'black', 20);
                    ctxUi.fillText(slot.content.itemName, 323 + slot.x, 126 + slot.y + 20);
                    ctxUi.fillText(slot.amount, 323 + slot.x, 126 + slot.y + 20 + 20);
                } else {
                    //                drawText(323 + slot.x, 126 + slot.y + 20, slot.content, 'black', 20);
                    ctxUi.fillText(slot.content, 323 + slot.x, 126 + slot.y + 20);
                }
            }
        }
    }
    /*const slotHitbox = new Hitbox(323 + slot.x, 126 + slot.y, 85, 85);
            const cursor = new Hitbox(mouseX, mouseY, 1, 1);
            const collisionWith = checkCollisionWith(cursor, slotHitbox);

            if (collisionWith) {
                console.log(slot);
                ctxUi.fillStyle = 'black';
                if (slot.content !== 'empty') {
                    //                drawText(323 + 55, 126 + 490 + 20, slot.content.itemName, 'black', 20);
                    ctxUi.fillText(slot.content.itemName, 323 + slot.x, 126 + slot.y + 20);
                    ctxUi.fillText(slot.amount, 323 + slot.x, 126 + slot.y + 20 + 20);
                } else {
                    //                drawText(323 + slot.x, 126 + slot.y + 20, slot.content, 'black', 20);
                    ctxUi.fillText(slot.content, 323 + slot.x, 126 + slot.y + 20);
                }
            }*/
    if (showCrafting) {
        updateUi();
        let counterX = 350;
        let buttonCounter = 0;
        let spaceWidth = 0;
        for (const recipe of myPlayer.recipes) {
            let counter = 350;
//            console.log(recipe);
            ctxUi.fillStyle = 'black';
            for (const ingredient of recipe.ingredients) {
                const string = ingredient.item.itemName + '/' + ingredient.amount;
                ctxUi.fillText(string, counterX, counter);
                spaceWidth = Math.max(spaceWidth, ctxUi.measureText(string).width);
                counter += 30;
            }
            ctxUi.fillText('=>', counterX, counter);
            counter += 30;
            for (const product of recipe.products) {
                const string = product.item.itemName + '/' + product.amount;
                ctxUi.fillText(string, counterX, counter);
                spaceWidth = Math.max(spaceWidth, ctxUi.measureText(string).width);
                counter += 30;
            }
            uiButtons.craftingButtons[buttonCounter] = new Button(counterX, counter, 50, 50, 'open-chest', true, craftUiBtnImage, buttonCounter);
            buttonCounter++;
            counterX += spaceWidth + 25;
//            uiButtons open: new Button(575, 650, 50, 50, 'open-chest', false, openUiBtnImage),
        }
    }
}

function drawCrafting() {
    
}

   
let fieldOfView = [];

function drawPlayers(gamePlayers) {
    if (gamePlayers.length !== 0) {
        for (const player of gamePlayers) {
            const {x,y,width,height} = player;
            if (player.id === myPlayer.id) {
                ctx.fillStyle = 'green';
                ctx.fillText('You', x, y - 8);                
            } else {
                const hpPercent = convertNumberToPercent(player.hp, player.maxHp);
                const hpBarWidth = width * hpPercent / 100;
                ctx.fillStyle = '#4A2323';
                ctx.fillRect(x, y - 12, width, 8);
                if (player.hp > 0) {
                    ctx.fillStyle = '#f74d4d';
                    ctx.fillRect(x, y - 12, hpBarWidth, 8);
                }
                ctx.lineWidth = '3px';
                ctx.strokeRect(x, y - 12, width, 8);
                ctx.fillStyle = 'red';
                ctx.fillText(player.name, x, y - 16);
//                console.log(.name, .id);
            }
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = 'black';

            if (!player.isAlive) {
                ctx.fillStyle = 'black';
                ctx.fillText('DIE', x, y + 16);
            }
            if (debug.showHitbox) {
                ctx.fillStyle = 'red';
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
}

function drawEnemies(gameEnemies) {
    if (gameEnemies.length !== 0) {
        for (const enemy of gameEnemies) {
            const {
                x,
                y,
                width,
                height,
                hp,
                maxHp
            } = enemy;
            if (enemy.isAlive) {
                ctx.fillStyle = 'brown';
                ctx.fillRect(x, y, width, height);

                const hpPercent = convertNumberToPercent(hp, maxHp);
                const hpWidth = enemy.width * hpPercent / 100;

//                console.log(hpWidth);
                ctx.fillStyle = '#4A2323';
                ctx.fillRect(x, y - 10, width, 8);
                ctx.fillStyle = '#f74d4d';
                ctx.fillRect(x, y - 10, hpWidth, 8);
                ctx.fillStyle = 'black';
                ctx.lineWidth = '0.3px';
                ctx.strokeRect(x, y - 10, width, 8);
                ctx.font = 'Monospace 10px';
                //                ctx.fillText(enemy.ammunition[0].allAmmunition, x, y - 20);
                ctx.fillText(enemy.ammunition[0].actualAmmunition + ',' + enemy.ammunition[0].allAmmunition, x, y - 20);
                if (debug.showHitbox) {
                    ctx.fillStyle = 'red';
                    ctx.strokeRect(x, y, width, height);
                }
                
                for (let z = 0; z < enemy.fieldOfViewData.realView.length; z++) {
                    const pointX = enemy.fieldOfViewData.realView[z];
                    const pointY = enemy.fieldOfViewData.realView[z += 1];
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    ctx.lineTo(x+pointX,y+pointY);
                    ctx.stroke();
                }
                /*for (const path of debugData.enemiesPath) {
                    if (path.id === enemy.id) {
                        ctx.fillStyle = 'yellow';

                        console.log(path);
                        //                        ctx.strokeRect(x,y, path.path[1].x,path.path[1].y);
                        console.error(enemy.path.length);

                        ctx.fillStyle = 'yellow';

                        if (enemy.path.length === 2) {
                            ctx.beginPath();
                            ctx.moveTo(enemy.x, enemy.y);
                            ctx.lineTo(path.path[0].x, path.path[0].y);
                            ctx.stroke();
                            ctx.beginPath();
                            
                            ctx.beginPath();
                            console.warn(path.path[0].x);
                            ctx.moveTo(path.path[0].x, path.path[0].y);
                            ctx.lineTo(path.path[1].x, path.path[1].y);
                            ctx.stroke();
                            ctx.beginPath();
                        } else if (enemy.path.length === 1) {
                            ctx.beginPath();
                            ctx.moveTo(path.path[0].x, path.path[0].y);
                            ctx.lineTo(path.path[1].x, path.path[1].y);
                            ctx.stroke();
                            ctx.beginPath();
                        }
                        ctx.beginPath();
                        ctx.moveTo(enemy.x, enemy.y);
                        ctx.lineTo(path.path[0].x, path.path[0].y);
                        ctx.stroke();
                        ctx.beginPath();
                        
                        
                        ctx.moveTo(path.path[0].x, path.path[0].y);
                        ctx.moveTo(path.path[1].x, path.path[1].y);
                        ctx.stroke();
                    }
                }*/
                /*if (enemy.debug.path[1] !== undefined && enemy.debug !== undefined) {
                    console.error('set');
                    console.warn(enemy.debug.path);
                    debugData.enemiesPath.push({id:enemy.id,path:enemy.debug.path});
                    ctx.fillStyle = 'yellow';
                    
                    ctx.strokeRect(x,y, enemy.debug.path[0].x,enemy.debug.path[0].y);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    [ { x: 1440, y: 610 }, { x: 1440, y: 5 } ]
                    ctx.lineTo(enemy.debug.path[0].x,enemy.debug.path[0].y);
                    ctx.stroke()
                    ctx.moveTo(enemy.debug.path[0].x,enemy.debug.path[0].y);
                    ctx.moveTo(enemy.debug.path[1].x,enemy.debug.path[1].y);
                    ctx.stroke();
                }*/
            }
        }
    }
}

function drawNpcs(gameNpcs) {
    if (gameNpcs.length !== 0) {
        for (const npc of gameNpcs) {
            const {
                x,
                y,
                width,
                height
            } = npc;
            ctx.fillRect(x, y, width, height);
            if (debug.showHitbox) {
                ctx.fillStyle = 'red';
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
}

function drawBlocks(gameBlocks) {
    if (gameBlocks.length !== 0) {
        for (const block of gameBlocks) {
            const {
                x,
                y,
                width,
                height,
                type
            } = block;
            ctx.drawImage(solidObjectsSpritesheet, 64 * type, 0, 64, 64, x, y, width, height);
            if (debug.showHitbox) {
                ctx.fillStyle = 'red';
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
}

function updateUi() {
    ctxUi.fillText('Shooting:' + mobileShootingCursor, 50, 480);
    for (const chest of gameChests) {
        if (checkCollisionWith(myPlayer.hitbox, chest.hitbox)) {
            uiButtons.open.active = true;
            uiButtons.open.x = 100;
            uiButtons.open.y = 550;
//            console.warn(uiButtons.open.x, uiButtons.open.y);
        } else {
            uiButtons.open.active = false;
        }
    }
    const hpPercent = convertNumberToPercent(myPlayer.hp, myPlayer.maxHp);
    const magicEnergyPercent = convertNumberToPercent(myPlayer.magicEnergy, myPlayer.maxMagicEnergy);
    //const actualSpellOfMagicEnergyPercent = convertNumberToPercent(actualPlayerSpell.requiredMagicEnergy, player1.maxMagicEnergy);
    const width = 300;
    const hpPercentWidth = width * hpPercent / 100;
    const magicEnergyPercentWidth = width * magicEnergyPercent / 100;
    //const actualSpellOfMagicEnergyPercentWidth = width * actualSpellOfMagicEnergyPercent / 100;
    //const to = 15 + magicEnergyPercentWidth;
    //const from = to - actualSpellOfMagicEnergyPercentWidth;
    //playerHpWidthCounter = hpPercentWidth;
    /*if (oldplayerHpWidthCounter >= playerHpWidthCounter && !healthingPlayer) {
        oldplayerHpWidthCounter -= 1.4;
    } else if (oldplayerHpWidthCounter <= playerHpWidthCounter && healthingPlayer) {
        oldplayerHpWidthCounter += 1.2;
    }*/



    ctxUi.clearRect(0, 0, 1400, 920);
    /*ctxUi.fillText(myPlayer.block, 80, 180);
    ctxUi.fillStyle = '#4A2323';
    ctxUi.fillRect(15, 5, width, 20);
    ctxUi.fillStyle = '#f74d4d';
    if (myPlayer.hp > 0) {
        ctxUi.fillRect(15, 5, hpPercentWidth, 20);
    }*/
    ctxUi.fillText('Aktualne zaklęcie:' + myPlayer.actualSpell, 120, 550);
    
    if (debug.showSavedItems) {
        let i = 35;
        let a = 0;
        let b = 0;
        ctxUi.globalAlpha = 0.4;
        ctxUi.fillStyle = 'white';
//        ctxUi.strokeStyle = 'white';
//        ctxUi.beginPath();
//        ctxUi.roundRect(1075, 50, 350, i + (debug.savedItemsSecondVersion.length * 35) + 60, [40]);
//        ctxUi.stroke();
        roundRect(1075, 50, 320, i + (debug.savedItemsSecondVersion.length * 35) + 60, 25, ctxUi);
        ctxUi.fillStyle = 'black';
        ctxUi.globalAlpha = 1;
        for (const obj of debug.savedItems) {
//            console.log(obj);
            a += obj.a;
            b += obj.b;
            ctxUi.fillText('Loaded-blocks:' + obj.a + '/' + obj.b, 1100, 50 + i);
            i += 35;
        }
        for (const obj of debug.savedItemsSecondVersion) {
            ctxUi.fillText('Loaded-'+obj.name + ':' + obj.a + '/' + obj.b , 1100, 50 + i);
            a += obj.a;  
            b += obj.b;  
            i += 35;
        }
        ctxUi.fillText('Saved-ALL'+ ':' + a + '/' + b + ' ' + convertNumberToPercent(a, b).toFixed(2) + '%', 1100, 50 + i);        
    }
    
        let i = 35;
        ctxUi.globalAlpha = 0.4;
        ctxUi.fillStyle = 'white';
        roundRect(800, 50, 270, i + (1 * 35), 25, ctxUi);
        ctxUi.fillStyle = 'black';
        ctxUi.globalAlpha = 1;
        if (tools.creatingEnemy) {
            ctxUi.fillText('Tool: createEnemy', 825, 50 + i);    
        } else if(tools.deletingEnemy) {
            ctxUi.fillText('Tool: deletingEnemy', 825, 50 + i);    
        }
    
    if (debug.mousePosition) {
        ctxUi.globalAlpha = 0.4;
        ctxUi.fillStyle = 'white';
        roundRect(800, 125, 270, 65, 15, ctxUi);
        ctxUi.fillStyle = 'black';
        ctxUi.globalAlpha = 1;
        const {x,y,width,height} = camera;
        const realX = mouseX + x - ((width - myPlayer.width) / 2);
        const realY = mouseY + y - ((height - myPlayer.height) / 2);
//        console.warn(realX, realY);
        ctxUi.fillText('MouseX(Game):'+realX, 825, 150);    
        ctxUi.fillText('MouseY(Game):'+realY, 825, 175);    
    }

    //HP - Bar
    if (hpPercent > 85) {
        ctxUi.drawImage(hpBarFullImage, 15, 5);
        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.hp + '/' + myPlayer.maxHp, 15 + 158, 5 + 35);
    } else if (hpPercent > 35) {
        ctxUi.drawImage(hpBarNearlyFullImage, 15, 5);
        ctxUi.fillStyle = 'blue';
        ctxUi.fillRect(15, 5, hpPercentWidth, 8);

        ctxUi.clearRect(15 + 254, 5 + 28, (width - hpPercentWidth) * -1 + 50, 22);

        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.hp + '/' + myPlayer.maxHp, 15 + 158, 5 + 35);

    } else {
        ctxUi.drawImage(hpBarEmptyImage, 15, 5);
        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.hp + '/' + myPlayer.maxHp, 15 + 158, 5 + 35);
    }
    //END HP - Bar

    //MANA - Bar
    if (magicEnergyPercent > 85) {
        ctxUi.drawImage(hpBarFullImage, 15, 90);
        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.magicEnergy + '/' + myPlayer.maxMagicEnergy, 15 + 158, 90 + 35);
    } else if (magicEnergyPercent > 35) {
        ctxUi.drawImage(hpBarNearlyFullImage, 15, 90);
        ctxUi.fillStyle = 'blue';
        //        ctxUi.fillRect(15, 5, magicEnergyPercentWidth, 8);

        ctxUi.clearRect(15 + 254, 90 + 28, (width - magicEnergyPercentWidth) * -1 + 90, 22);

        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.magicEnergy + '/' + myPlayer.maxMagicEnergy, 15 + 158, 90 + 35);

    } else {
        ctxUi.drawImage(hpBarEmptyImage, 15, 90);
        ctxUi.fillStyle = 'black';
        ctxUi.fillText(myPlayer.magicEnergy + '/' + myPlayer.maxMagicEnergy, 15 + 158, 90 + 35);
    }
    //END MANA - Bar

    //    ctxUi.clearRect(268, 32, hpPercentWidth, 22);
    ctxUi.fillStyle = 'green';
    ctxUi.fillRect(15, 5, hpPercentWidth, 8);

    
    if (myPlayer.spellsBuffer.reloadsTimes[0] !== undefined) {
        //        const loadProcess = 100 - convertNumberToPercent(myPlayer.spellsBuffer.reloadsTimes[0], myPlayer.actualSpell.reload[0] * 1000);
        //        const drawingProcess = 65 * loadProcess / 100;

        //        ctxUi.fillRect(850, 120, drawingProcess, 65);
        ctxUi.fillStyle = 'red';
        ctxUi.fillText(myPlayer.spellsBuffer.reloadsTimes[0], 125, 570);
    }

    //    ctxUi.fillStyle = 'red';
    //    ctxUi.fillRect(15, 0, -35, 8);

    const {
        name,
        type
    } = myPlayer.weapon;
    const {
        actualAmmunition,
        maxMagazine,
        reloading,
        allAmmunition
    } = myPlayer.ammunition[0];

    ctxUi.font = '20px Monospace';
    ctxUi.fillStyle = 'black';
    /*ctxUi.fillText('You:' + myPlayer.name, 15, 45);
    ctxUi.fillText('Weapon:'+name, 15, 95);
    ctxUi.fillText('Type:'+type, 15, 115);*/
    if (type === 'distance') {
//        console.log(myPlayer.ammunition[0]);
//        console.log(myPlayer.ammunition[0].actualAmmunition);
        ctxUi.fillText(actualAmmunition + '/' + maxMagazine + ',' + reloading + ',' + allAmmunition, 15, 150)
    }

    /*if (hpPercent >= 0) {
        ctx.fillRect(15, 5, magicEnergyPercentWidth, 20);    
    }
    ctx.fillStyle = '#152C55';
    ctx.fillRect(15, 30, width, 20);
    ctx.fillStyle = '#1F5FD1';
    if (magicEnergyPercent >= 0) {
        ctx.fillRect(15, 30, magicEnergyPercentWidth, 20);    
    }
    if (actualPlayerSpell.requiredMagicEnergy <= player1.magicEnergy) {
        ctx.fillStyle = '#F3E50A';   
        ctx.fillRect(from, 30, actualSpellOfMagicEnergyPercentWidth, 20);    
    } else {
        ctx.fillStyle = '#E7620B';
        ctx.fillRect(15, 30, actualSpellOfMagicEnergyPercentWidth, 20);  
        ctx.fillStyle = '#F3E50A';   
        ctx.fillRect(15, 30, magicEnergyPercentWidth, 20);    
    }*/
}
function roundRect(x, y, width, height, radius, ctx) {
    const r = x + width;
    const b = y + height;
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = '0';
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + height - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
}

function convertNumberToPercent(part, all) {
    return (part / all) * 100;
}

requestAnimationFrame(drawAll);