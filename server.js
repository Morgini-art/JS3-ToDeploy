const {Invetory,Slot,Recipe,createItemsFromRecipe,fillInvetoryWithSlots,addItem,Item} = require('./serverFiles/invetory');
const {User,allUsers,findUser,updateUser,createUser,deleteUser,convertObject} = require('./serverFiles/database');
const {Bullet,checkTheDirectionOfTheBullet,moveBullet} = require('./serverFiles/bullet');
const {Enemy, choosePlayer, enemyAi, fieldOfView} = require('./serverFiles/enemy');
const {Block,createBlock,createBlocksWithGrid} = require('./serverFiles/block');
const {Spell,SpellsBuffer,renewMagicEnergy} = require('./serverFiles/spell');
const {GameMap,Chunk,generatePlane,loadMap} = require('./serverFiles/map');
const {Weapon,attackWeapon,Ammunition} = require('./serverFiles/weapon');
const {Hitbox,checkCollisionWith} = require('./serverFiles/hitbox');
const {Timer,Tick,clearTimerCache} = require('./serverFiles/time');
const interpeter = require('./serverFiles/text').interpeter;
const {Quest,Npc,Dialogue} = require('./serverFiles/quest');
const {Chest,openChest} = require('./serverFiles/chest');
const {Player, attack} = require('./serverFiles/player');
const Version = require('./version');

//MAIN IMPORTS
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const adminApp = express();
const http = require('http');
const fs = require('fs');
const { networkInterfaces } = require('os');
const os = require('os');
const {Server} = require('socket.io');

let serverConfig = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
console.log(`...JS3RebulidMultiplayer Server...`);
console.log(`...Server version:${Version.version}...`);
console.log(`...NodeJs Version:${process.version}...`);
console.log('...Compabityle with:',Version.accessWith,'...');
console.log(`...Configuration...\nIp:${serverConfig.ip}\nPort:${serverConfig.port}\nPassword:${serverConfig.password}\nAdminPanel:${serverConfig.adminpanel}\n...`);

//ADMIN SERVER
let adminServer = 'off', adminIo = 'off', adminPanelOn = false;

if (serverConfig.adminpanel) {
    adminPanelOn = true;
    adminServer = http.createServer(adminApp);
    adminServer.listen(process.env.PORT+32, () => {
        console.log(`^^Admin Server start ${serverConfig.ip}:${process.env.PORT+32}^^`);
    });
    adminIo = new Server(adminServer,{ transports: ['websocket'] });
    /*adminApp.get('/', (req, res) => {
        console.log('Ax');
        res.sendFile('index.html', {
            root: '\admin'
        });
    });*/
    adminApp.get('/watch/:objectId', (req, res) => {
        res.sendFile('watch.html', {
            root: '\watch'
        });
    });
    /*adminApp.get('/watch/:objectId', (req, res) => {
        res.sendFile('watch.html', {
            root: '\watch'
        });
    });*/
    /*adminApp.get('/watch/:object/socket-lib', (req, res) => {
        console.log('URK');
        res.sendFile('admin/socket.io-lib\socket.io\client-dist\socket.io.min.js', {
            root: 'admin/socket.io-lib\socket.io\client-dist'
        });
    });*/
    /*adminApp.get('/watch/:object/socket-lib', (req, res) => {
        res.sendFile('watch.html', {
            root: '../admin'
        });
    });*/
//    watch/Enemy~0
    
    adminApp.use(express.static('admin'));
//    adminIo.set('transports', ['websocket']);
}

//END - ADMIN SERVER
//CLIENT SERVER
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`^^Client Server start ${serverConfig.ip}:${process.env.PORT}^^`);
});
const io = new Server(server);
app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: '\public'
    });
});
app.use(express.static('public'));
//END CLIENT SERVER

//DATABASE CONNECTION
const databaseUrl = 'mongodb+srv://HerokuJS3:518N6Byan4HRPbLF@js3.4114ia6.mongodb.net/Main';
console.log(`^^Connecting MongoDB to ${databaseUrl}^^`);
mongoose.connect(databaseUrl);

const house01TileObject = [8, 12, 12, 12, 12, 9,
            10, 12, 12, 12, 12, 11,
            10, 12, 12, 12, 12, 11,
            10, 12, 12, 12, 12, 11,
            13, 6, 4, 4, 6, 14,
            3, 4, 4, 4, 4, 5,
            3, 4, 6, 6, 4, 5,
            3, 4, 1, 2, 4, 5];

const house02TileObject = [0, 0, 8, 12, 12, 12, 12, 9, 0, 0,
            0, 8, 10, 12, 12, 12, 12, 11, 9, 0,
            8, 10, 13, 6, 4, 7, 6, 14, 11, 9,
            10, 13, 4, 7, 4, 4, 7, 4, 14, 11,
            13, 4, 4, 6, 4, 4, 6, 4, 5, 14,
            3, 7, 4, 4, 7, 4, 4, 4, 7, 5,
            3, 4, 7, 4, 4, 4, 7, 4, 7, 5,
            3, 3, 1, 3, 6, 6, 5, 2, 4, 5];

let gameAttackList = [];

const trialAmmunition1 = 'Pistol/Caliber9mm/Pistolet XD',
    trialAmmunition2 = 'Crosbow/ArrowHeadSize20mm/Kusza z XIV wieku',
    trialAmmunition3 = 'Rifle/Caliber12mm/Adminowy Karabin Maszynowy',
    trialAmmunition4 = 'Pistol/Caliber12mm/Pistolet XD';

const newAmmo = new Ammunition('Pistol/Caliber9mm/Pistolet XD', 1,'bullet', 20);
const newWeapon = new Weapon('Pistolet', 2, 4, 1, 20, 80, 'distance', 2, newAmmo);

const ammunitions = [
    new Ammunition('Pistol/Caliber9mm/Pistolet XD', 1.1, 'bullet', 20),
    new Ammunition('Crosbow/ArrowHeadSize20mm/Kusza z XIV wieku', 3.8, 'bullet', 3),
    new Ammunition('Rifle/Caliber12mm/Adminowy Karabin Maszynowy', 2,2, 'bullet', 50)
];

const blockHitboxPrecision = 4;

const gameTimer = new Timer();

const GameObjects = {
    map : new GameMap(),
    bullets : [],
    chests : [],
    enemies: [],
    blocks: []
};

const items = [
    new Item('Test01',3,0,'test01',false),
    new Item('Test02',7,0,'test02',false),
    new Item('Żelazo',7,0,'Żelazo',false),
    new Item('Drewno',7,0,'Drewno',false),
    new Item('Mały miecz',7,0,'weapon',false)
];

const recipes = [
    new Recipe('Mały miecz', [{item: items[2], amount: 1}, {item: items[3], amount: 1}], [{item: items[4], amount: 1}], 0),
    new Recipe('Mały miecz 232145', [{item: items[2], amount: 3}, {item: items[3], amount: 4}], [{item: items[4], amount: 2}], 0)
];

const npcs = [
    new Npc(0, 1500, 750, 50, 65, new Hitbox(1500, 750, 50, 65), [
        new Dialogue('0', 'Hi!', false)
    ])
];

const dialogues = [
    new Dialogue('0', 'Hi!', false)
];

const quests = [
    new Quest('Give me one: "Mały miecz"', 0, [], [npcs[0]])
];


GameObjects.chests.push(new Chest(1500, 800, 25, 25, new Hitbox(1500, 800, 25, 25), structuredClone(items[2])));

GameObjects.chests[0].content.amount = 1;

const weapons = [
    new Weapon('Pistolet', 1, 3, 1, 20, 20, 'distance', 3, structuredClone(ammunitions[0]), 90),
    new Weapon('Młot', 24, 34, 1, 20, 350, 'melee'),
    new Weapon('Mały Miecz', 6, 13, 1, 20, 240, 'melee'),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 800)
];

const spells = [
    new Spell('Błyskawica', 18, 'dmg', 'thunderboltAttack', 'enemy:1', 2, 14, 18),
    new Spell('Kula Ognia', 2, 'dmg', 'ballOfFire', 'direction:hitenemy:1', 1, 16, 35),
    new Spell('Magiczna pułapka', 24, 'dmg', 'magicTrap', 'direction:hitenemy:1', 2.6, 12, 27),
    new Spell('Niepamięć', 23, 'time', 'oblivion', 'enemy:1', 7, null, null, 4)
];

//const player1 = new Player('id', 'Player1', 'PvP',10, 10, 50, 65, 100, 100, weapons[3], new Hitbox(10, 10, 50, 65), 4, 50, 50, [structuredClone(ammunitions[1])],);
//player1.ammunition[0].allAmmunition = 15;

//GameObjects.enemies.push(new Enemy(0, 1565, 610, 50, 65, 40, 40, weapons[3], new Hitbox(undefined, undefined, 50, 65), 1, 1, structuredClone(items[1]), 1, 0, [structuredClone(ammunitions[1])]));

//GameObjects.enemies[0].secondAiState = 'icanshoot?';
//GameObjects.enemies[0].aiState = 'whereplayer';
//GameObjects.enemies[0].ammunition[0].allAmmunition = 15;


createBlocksWithGrid(800, 50, 64, 64, house02TileObject, 10, 8, GameObjects);

createBlocksWithGrid(1500, 80, 64, 64, house01TileObject, 6, 8, GameObjects);

createBlocksWithGrid(2570, 90, 64, 64, house02TileObject, 10, 8, GameObjects);


generatePlane(3, GameObjects.map, 1024, 1024);
//loadMap(GameObjects.map, 3, mapFirstLayer, mapSecondLayer, GameObjects);

GameObjects.chests.push(new Chest(2200, 2200, 25, 25, new Hitbox(2200, 2200, 25, 25), 'nothing', 'chest'));

let gameState = 'off';

let players = [];

let gamePlayers = [];
let countOfPlayers = 0;
const maxCountOfPlayers = 2;

let whereToGo = 0;

function writeToLog(text) {
    const dateObject = new Date();
    const date = 'Day:'+dateObject.getDate()+'-'+dateObject.getHours()+':'+dateObject.getMinutes()+':'+dateObject.getSeconds();
    
    fs.writeFile('\logs.txt', date+'=>'+text+'\n', {flag: 'a'},err => {
        if (err) {
            console.error(err);
        }
    });
}

function updateGameState () {
    let counter = 0;
    for (const player of gamePlayers) {
        if (player.state === 'yesPlay') {
            counter++;
        }
    }
    if (countOfPlayers >= 1 && counter >= 1) {
        gameState = 'play';
        io.emit('send-game-state', 'play');
    } else {
        gameState = 'off';
        const numberOfPlayers = countOfPlayers - 1;
        io.emit('send-info', 'Other players:' + numberOfPlayers);
    }  
    if (adminPanelOn) {
        adminIo.emit('player-count',counter);
    }
}

/*socket.on('client-version', clientVersion => {
        if (Version.version === clientVersion) {

        } else {
            socket.emit('send-alert', 'Sorry but your version' + clientVersion + 'is not actually. Please update and come back.');
            let idOfUser;
            console.log('User close. User ID:' + socket.id + '.');
            gamePlayers.forEach((player, i) => {
                if (socket.id === player.id) {
                    idOfUser = i;
                    console.log('User close. User in array:' + i + '.');
                }
            });

            whereToGo = idOfUser;

            gamePlayers.splice(idOfUser, 1);
            players.splice(idOfUser, 1);
            countOfPlayers--;
            whereToGo--;
            
            socket.emit('close');            
        }
    });*/

function clientVersionIsGood(socket) {
    socket.emit('get-version', (ok=false,reponse)=>{
        console.warn(ok);
        console.log('We must',reponse);
        if (isUndefined(reponse)) {
            console.error('DA');
        }
        /*if (Version.version === clientVersion) {
        return true;
    } else {
        socket.emit('send-alert', 'Sorry but your version' + clientVersion + 'is not actually. Please update and come back.');
        socket.emit('delete-connection');
        return false;
    }*/
    });
}  

adminIo.on('connection', (socket) => {
    console.log('Connect',socket.id);
});


io.on('connection', (socket) => {
    writeToLog('User with id:'+socket.id+' connect with server.');
    
    io.emit('send-info', 'Players:' + countOfPlayers);
    const status = {
        host:  socket.handshake.headers.host,
        state: 'connected'
    };
    io.emit('send-status-server', status);
    
    setInterval(updateGameState, 1000);
        
    writeToLog('User with id:'+socket.id+' connect with server.');
    
    socket.on('enter-to-game', data => {
        writeToLog('User with id:'+data.name+' go to game.');

        
        writeToLog('Checking client version...');
//        const next = clientVersionIsGood(socket); TODO: Check client version
        
        const x = 1735;
        const y = 5;
        const newWeapon = new Weapon('Sztylet', 8, 14, 1, 80, 15, 'melee', 2);
        const newInvetory = new Invetory();
        const newSpellsBuffer = new SpellsBuffer();
        newInvetory.basicSlots.length = 30;
        fillInvetoryWithSlots(newInvetory);
        
        /*const items = [
    new Item('Test01',3,0,'test01',false),
    new Item('Test02',7,0,'test02',false),
    new Item('Żelazo',7,0,'Żelazo',false),
    new Item('Drewno',7,0,'Drewno',false),
    new Item('Mały miecz',7,0,'weapon',false)
];*/
        newInvetory.basicSlots[0].content = items[2];
        newInvetory.basicSlots[1].content = items[3];
        newInvetory.basicSlots[2].content = items[3];
        newInvetory.basicSlots[3].content = items[2];
        newInvetory.basicSlots[0].amount = 6;
        newInvetory.basicSlots[1].amount = 8;
        newInvetory.basicSlots[2].amount = 7;
        newInvetory.basicSlots[3].amount = 14;
        let newPlayer = new Player(socket.id, socket.id, 'PvP', x, y, 50, 65, 100, 100, weapons[3], new Hitbox(x, y, 50, 65), 3, 250, 280, [structuredClone(ammunitions[1])], newInvetory, newSpellsBuffer, structuredClone(spells), structuredClone(recipes));
        newPlayer.state = data.state;
        newPlayer.name = data.name;
        newPlayer.login = data.login;
        console.log(newPlayer.login);

        //    const player1 = new Player('id', 'Player1', 'PvP',10, 10, 50, 65, 100, 100, weapons[3], new Hitbox(10, 10, 50, 65), 4, 50, 50, [structuredClone(ammunitions[1])]);
        newPlayer.ammunition[0].allAmmunition = 15;
        
        findUser({
            name: newPlayer.login
        }).then(res => {
            if (res.length === 0) {
                createUser({
                    name: newPlayer.login,
                    password: '',
                    object: convertObject(newPlayer, 'json')
                });
                console.log("ZZZZZZZZZZZZZZZZZZZZZZ");
                players.push(newPlayer);
                gamePlayers.push(players[whereToGo]);
                socket.emit('send-players', gamePlayers);
                socket.emit('assign-player', players[whereToGo]);
                socket.emit('send-players', gamePlayers);
                socket.emit('send-blocks', GameObjects.blocks);
                socket.emit('send-npcs', npcs);
                countOfPlayers++;
                whereToGo++;
            } else {
                            
                newPlayer = convertObject(res[0].object, 'object');
                newPlayer.id = socket.id;
                let next = true;
                for (const player of gamePlayers) {
                    console.log(player.login, newPlayer.login, player.login === newPlayer.login);
                    if (player.login === newPlayer.login) {
                        
                        socket.emit('connect-error');
//                        socket.emit('delete-connection');
//                        socket.disconnect();
                        socket.emit('send-info','Sorry, but you are now logged.');
                        socket.emit('send-status-server','Disconnected');
                        if (next) {
                            next = false;
                        }                        
                    }
                }
                console.log('REEEEEEEE',next);
                if (next) {
                    players.push(newPlayer);
                    gamePlayers.push(players[whereToGo]);
                    socket.emit('send-players', gamePlayers);
                    socket.emit('assign-player', players[whereToGo]);
                    socket.emit('send-players', gamePlayers);
                    socket.emit('send-blocks', GameObjects.blocks);
                    socket.emit('send-npcs', npcs);

                    countOfPlayers++;
                    whereToGo++;
                }
                console.log('REEEEEEEE',next, gamePlayers);
            }
        });
        
    });
    
    socket.on('client-version', clientVersion => {
        /*if (Version.version === clientVersion) {

        } else {
            socket.emit('send-alert', 'Sorry but your version' + clientVersion + 'is not actually. Please update and come back.');
            let idOfUser;
            gamePlayers.forEach((player, i) => {
                if (socket.id === player.id) {
                    idOfUser = i;
                }
            });

            whereToGo = idOfUser;

            gamePlayers.splice(idOfUser, 1);
            players.splice(idOfUser, 1);
            countOfPlayers--;
            whereToGo--;
            
            socket.emit('close');            
        }*/
    });

    socket.on('set-player-move-target', data => {
       const player = findPlayer(socket.id);
        player.targetX = data.x;
        player.targetY = data.y;
    });
    
    socket.on('create-enemy', data => {
        const player = findPlayer(socket.id);
//        ctx.fillRect(mouseX + x - ((width - myPlayer.width) / 2), mouseY + y - ((height - myPlayer.height) / 2), 50, 65);
        GameObjects.enemies.push(new Enemy(0, (data.camera.x - (data.camera.width - player.width) / 2) + data.x, (data.camera.y - (data.camera.height - player.height) / 2) + data.y, 50, 65, 40, 40, weapons[1], new Hitbox(undefined, undefined, 50, 65), 1, 1, structuredClone(items[1]), 1, 0, [structuredClone(ammunitions[1])]));
//        console.log('Itsenemy',enemy);
//        const length = GameObjects.enemies.length - 1;
        const enemy = GameObjects.enemies.pop();
        enemy.secondAiState = 'icanshoot?';
        enemy.aiState = 'whereplayer';
        enemy.ammunition[0].allAmmunition = 15;
        let counter = 0;
        for (let x = 0; x < 9; x++) {
            enemy.fieldOfView[x] = {
                x: counter,
                y: -180,
                state: 2
            };
            counter += 20;
        } 
        fieldOfView(enemy,GameObjects.blocks);
        GameObjects.enemies.push(enemy);
        choosePlayer(enemy,gamePlayers);
    });
    
    socket.on('delete-enemy', data => {
        const player = findPlayer(socket.id);
//        ctx.fillRect(mouseX + x - ((width - myPlayer.width) / 2), mouseY + y - ((height - myPlayer.height) / 2), 50, 65);
        const cursorHitbox = new Hitbox((data.camera.x - (data.camera.width - player.width) / 2) + data.x,  (data.camera.y - (data.camera.height - player.height) / 2) + data.y, 25, 25);
        GameObjects.enemies.forEach((enemy, id)=>{
            if (checkCollisionWith(enemy.hitbox, cursorHitbox)) {
                GameObjects.enemies.splice(id, 1);        
            }    
        });
        
        /*GameObjects.enemies.push(new Enemy(0, (data.camera.x - (data.camera.width - player.width) / 2) + data.x, (data.camera.y - (data.camera.height - player.height) / 2) + data.y, 50, 65, 40, 40, weapons[3], new Hitbox(undefined, undefined, 50, 65), 1, 1, structuredClone(items[1]), 1, 0, [structuredClone(ammunitions[1])]));

        const length = GameObjects.enemies.length - 1;
        GameObjects.enemies[length].secondAiState = 'icanshoot?';
        GameObjects.enemies[length].aiState = 'whereplayer';
        console.log(GameObjects.enemies[length]);
        GameObjects.enemies[length].ammunition[0].allAmmunition = 15;*/
    });
    
    socket.on('change-moving-state', data => {
        const player = findPlayer(socket.id);
        player.moving = data;
    });
    
    socket.on('craft-item', data => {
        const player = findPlayer(socket.id);
        const recipe = player.recipes[data];
        const harvested = structuredClone(recipe);
        const invetory = player.invetory.basicSlots;
        
        harvested.ingredients.forEach((ingredient, index)=>{
            ingredient.amount = 0;
        });
        
        recipe.ingredients.forEach((ingredient, index)=>{
            invetory.forEach((item, itemIndex)=>{
                if (harvested.ingredients[index].item.itemName === ingredient.item.itemName && harvested.ingredients[index].amount < ingredient.amount && harvested.ingredients[index].item.itemName === item.content.itemName) {
                    harvested.ingredients[index].amount += item.amount;
                    const old = harvested.ingredients[index].amount;
                    
                    if (harvested.ingredients[index].amount > ingredient.amount) {
                        harvested.ingredients[index].amount = ingredient.amount;
                        console.log(ingredient.amount,  old);
                        item.amount -= Math.abs( old - ingredient.amount);
                    } else {
                        item.amount = 0;
                        item.content = 'empty';
                    }
                }
            });
        });
        
        const need = harvested.ingredients.every((ingredient, index) => {
            const require = recipe.ingredients[index];
            return ingredient.item.itemName === require.item.itemName && ingredient.amount === require.amount;
        });
        console.log(need);
        if (need) {
            recipe.products.forEach((product, index)=>{
                addItem(player.invetory,product.item, product.amount);
                console.log(product);
            });
        }
        
    });

    socket.on('move-item-in-invetory', data => {
        const player = findPlayer(socket.id);
        player.invetory.basicSlots.forEach((slot, index)=>{
            if (checkCollisionWith(new Hitbox(data.x, data.y, 1, 1), new Hitbox(slot.x + 323, slot.y + 126, 85, 85))) {
                const {moving, movingItem} = player.movingInvetoryBuffer;
                
                if (!moving && slot.content !== 'empty') {
                    player.movingInvetoryBuffer.moving = true;
                    player.movingInvetoryBuffer.movingItem = slot.content;
                    player.movingInvetoryBuffer.movingItem.amount = slot.amount;
                    player.movingInvetoryBuffer.oldSlotNumber = index;
                    player.movingInvetoryBuffer.oldSlotAmount = slot.amount;
                    slot.content = 'empty';
                    slot.amount = 0;
                } else if (moving && slot.content !== 'empty') {
                    if (slot.content.itemName === player.movingInvetoryBuffer.movingItem.itemName) {
                        player.movingInvetoryBuffer.moving = false;
                        player.invetory.basicSlots[player.movingInvetoryBuffer.oldSlotNumber].amount
                        slot.content = player.movingInvetoryBuffer.movingItem;
                        slot.amount += player.movingInvetoryBuffer.movingItem.amount;
                    } else {
                        player.movingInvetoryBuffer.moving = false;
                        player.invetory.basicSlots[player.movingInvetoryBuffer.oldSlotNumber].content = slot.content;
                        player.invetory.basicSlots[player.movingInvetoryBuffer.oldSlotNumber].amount = slot.amount;
                        slot.content = player.movingInvetoryBuffer.movingItem;
                        slot.amount = player.movingInvetoryBuffer.movingItem.amount;
                    }

                } else if (moving && slot.content === 'empty') {
                    player.movingInvetoryBuffer.moving = false;
                    slot.content = player.movingInvetoryBuffer.movingItem;
                    slot.amount = player.movingInvetoryBuffer.movingItem.amount;
                    player.movingInvetoryBuffer.movingItem;
                    player.movingInvetoryBuffer.movingItem.amount;
                    player.movingInvetoryBuffer.movingItem = slot.content;
                    player.movingInvetoryBuffer.movingItem.amount = slot.amount;
                }
            }
        });
    });
    
    function findPlayer(socketId) {
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
                return player;
            }
        }
    }
        
    socket.on('request-cursor-mode', data => {
        const player = findPlayer(socket.id);
        for (const spell of spells) {
            if (spell.name === player.actualSpell) {
                console.log('Player:', player.actualSpell, 'Finded:', spell.name);
                const cursorMode = spell.bewitch(data, player, 'player', player.spellsBuffer);
                socket.emit('change-cursor-state', cursorMode);
            }
        }
    });
    
    socket.on('spell-marking', data => {
        const player = findPlayer(socket.id);
        let actualSpell;
        for (const spell of spells) {
            if (player.actualSpell === spell.name) {
                actualSpell = spell;
                break;
            }
        }

        if (actualSpell.availablesObjects.substr(0, 5) === 'enemy') {
            const objects = GameObjects.enemies.concat(gamePlayers);
            socket.emit('change-cursor-state', 'auto');

            for (const object of objects) {

                const collisionWith = checkCollisionWith(data, object.hitbox);
                if (collisionWith) {

                    socket.emit('change-cursor-state', 'auto');
                    player.magicEnergy -= actualSpell.requiredMagicEnergy;
                    if (actualSpell.action === 'thunderboltAttack') {
                        actualSpell.completeSpell(object);
                        player.spellsBuffer.spells.push('thunderboltAttack');
                        player.spellsBuffer.reloadsTimes.push(actualSpell.reload * 1000);
                    } else if (actualSpell.action === 'oblivion' && object.aiState !== undefined) {
                        const oldAiState = object.aiState;
                        const oldSecondAiState = object.secondAiState;
                        //
                        object.aiState = 'oblivion';
                        object.secondAiState = 'oblivion';

                        player.spellsBuffer.spells.push('oblivion');
                        player.spellsBuffer.reloadsTimes.push(actualSpell.reload * 1000);
                        //
                        setTimeout(() => {
                        }, 100);
                        //
                        setTimeout(() => {
                            object.aiState = oldAiState;
                            object.secondAiState = oldSecondAiState;
                        }, actualSpell.time * 1000);
                    }
                }
            }
        } else if (actualSpell.availablesObjects.substr(0, 9) === 'direction') {
            const {
                action,
                minDmg,
                maxDmg
            } = actualSpell;
            let bulletWidth, bulletHeight;

            if (actualSpell.availablesObjects.substr(0, 9) === 'direction') {
                if (action === 'ballOfFire') {
                    bulletWidth = 50;
                    bulletHeight = 50;
                } else if (action === 'magicTrap') {
                    bulletHeight = 25;
                    bulletWidth = 25;
                }
                player.magicEnergy -= actualSpell.requiredMagicEnergy;
                player.spellsBuffer.spells.push(actualSpell.action);
                player.spellsBuffer.reloadsTimes.push(actualSpell.reload * 1000);


                GameObjects.bullets.push(new Bullet(player.x, player.y, bulletWidth, bulletHeight, new Hitbox(player.x, player.y, bulletWidth, bulletHeight), 2, minDmg, maxDmg, data.x, data.y, player.id, 560));


                if (action === 'magicTrap') {
                    GameObjects.bullets[GameObjects.bullets.length - 1].getMove = false;
                    GameObjects.bullets[GameObjects.bullets.length - 1].distance = 1;
                }

                for (const bullet of GameObjects.bullets) {
                    if (bullet.owner === player.id) {
                        checkTheDirectionOfTheBullet(bullet, player);
                    }
                }
                /*cursorMode = 'moving';
                can.style.cursor = 'auto';*/
                socket.emit('change-cursor-state', 'moving');
            }
        }
    });
        
    
    socket.on('player-attack', data => {
        const player = findPlayer(socket.id);
        if (player.state !== 'spectator') {
            //                player.attack(data, gameTimer, undefined, undefined, 'player');OLD
            attack(data, gameTimer, player, player.weapon, attackWeapon);
        }
    });
    
    /*socket.on('player-mouse-down', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator' && data === 3) {
                gameTimer.listOfTicks.push(new Tick('Player To block PlayerId:' + player.id, gameTimer.generalGameTime, gameTimer.generalGameTime + 150));    
                break;
            }
        }
    });
    
     socket.on('player-mouse-up', data => {
         for (const player of gamePlayers) {
             if (socket.id === player.id && player.state !== 'spectator' && data === 3) {
                 for (const tick of gameTimer.listOfTicks) {
                     if (tick.nameOfTick.substr(0, 24) === 'Player To block PlayerId' && tick.nameOfTick.substr(25) === player.id) {
                         tick.old = true;
                     }
                 }
             }
         }
     });*/

    
    
    socket.on('player-open-chest', data => {
        const player = findPlayer(socket.id);
        if (player.state !== 'spectator') {
            for (const chest of GameObjects.chests) {
                if (checkCollisionWith(player.hitbox, chest.hitbox)) {
                    openChest(chest ,player, player.invetory);
                    writeToLog('Player with name:' + player.name + ' (id)' + player.id + 'open the chest.');
                }
            }
        }
    });
    
    socket.on('player-change-weapon', data => {
        const player = findPlayer(socket.id);
        if (player.state !== 'spectator') {
            player.weapon = weapons[player.weaponCounter];
            player.weaponCounter++;
            if (player.weaponCounter === 4) {
                player.weaponCounter = 0;
            }
        }
    });
    
    socket.on('player-change-spell', data => {
        const player = findPlayer(socket.id);
        if (player.state !== 'spectator') {
            player.actualSpell = spells[player.spellCounter].name;
            player.spellCounter++;
            if (player.spellCounter === 4) {
                player.spellCounter = 0;
            }
        }
    });
    
    socket.on('player-start-move', keyCode => {
        const player = findPlayer(socket.id);
        console.log(socket.id, player);
        if (player.state !== 'spectator') {
            if (keyCode === 87) {
                player.movingDirectionAxisY = 'Up';
            } else if (keyCode === 83) {
                player.movingDirectionAxisY = 'Down';
            } else if (keyCode === 65) {
                player.movingDirectionAxisX = 'Left';
            } else if (keyCode === 68) {
                player.movingDirectionAxisX = 'Right';
            }
        }
    });

    socket.on('player-stop-move', keyCode => {
        const player = findPlayer(socket.id);
        if (player.state !== undefined && player.state !== 'spectator') {
            if (keyCode === 87 || keyCode === 83) {
                player.movingDirectionAxisY = 'None';
            } else if (keyCode === 65 || keyCode === 68) {
                player.movingDirectionAxisX = 'None';
            }
        }
    });
    
    socket.on('update-object', keyCode => {
        const player = findPlayer(socket.id);
        /*const x = player.x - 700 - 50;
                const y = player.y - 460 - 50;
                const cameraHitbox = new Hitbox(x, y, 1400 + 50, 920 + 50);

                let chunksToSend = [];
                for (let i = 0; i < 3; i++) {
                    chunksToSend[i] = [];
                }
                
                for (let width = 0; width < 3; width++) {
                    for (let height = 0; height < 3; height++) {
                        const chunk = GameObjects.map.chunks[width][height];
                        const chunkHitbox = new Hitbox(chunk.x, chunk.y, chunk.width, chunk.height);
                        if (checkCollisionWith(chunkHitbox, cameraHitbox)) {
                            chunksToSend.push(chunk);
                        }
                    }
                }

        */
        const x = player.x - ((1400 - player.width) / 2);
        const y = player.y - ((920 - player.height) / 2);
//        const y = player.y - 460 - 50;
        const cameraHitbox = new Hitbox(x, y, 1400, 920);
//        ((1400 - myPlayer.width) / 2)

        let blocks = [];
        let blocksToCheck = [];

        for (let i = 0; i < GameObjects.blocks.length; i++) {
            const block = GameObjects.blocks[i];
            if (Math.max(block.x - player.x, player.x - block.x) + Math.max(block.y - player.y, player.y - block.y) < 1800) {
                blocksToCheck.push(block);
            }
        }

        for (let i = 0; i < blocksToCheck.length; i++) {
            const block = blocksToCheck[i];
            if (checkCollisionWith(block.hitbox, cameraHitbox)) {
                blocks.push(block);
            }
        }

        //                socket.emit('send-chunks', chunksToSend);

//        socket.emit('send-blocks', blocks);//TODO: Na potrzeby wygody zmieniono na wszystkie bloki. Zmienić potem!!!
        socket.emit('send-blocks', GameObjects.blocks);
        socket.emit('debug-saved-items-count', [{a:blocks.length, b:GameObjects.blocks.length}]);
    });
    
    
    socket.on('ping', (callback) => {
        callback();
    });

    socket.on('save-progress', ()=> {
        const player = findPlayer(socket.id);
        updateUser({name:player.login},{object:convertObject(player, 'json')}).then(res=>{
            if (res === 'Error') {
                socket.emit('save-status',{status:'error'});
            } else {
                socket.emit('save-status',{status:'saved'});
            }
            
        });
//        io.to(socket.id).emit('save-status',{status:'saved'});
        /*console.log('Save');
    for (const player of gamePlayers) {
        updateUser({name:player.login},{object:convertObject(player, 'json')});    
    }*/
    });
    
    socket.on('disconnect', function () {
        let idOfUser = -1;

        const player = findPlayer(socket.id);
        console.log('User close. User ID:' + socket.id + '.');
        gamePlayers.forEach((player, i) => {
            if (socket.id === player.id) {
                idOfUser = i;
                console.log('User close. User in array:' + i + '.');
            }
        });

        if (idOfUser !== -1) {
            whereToGo = idOfUser;
            gamePlayers.splice(idOfUser, 1);
            players.splice(idOfUser, 1);
            countOfPlayers--;
            io.emit('send-info', 'Other players:' + countOfPlayers);
            writeToLog('User with id:' + socket.id + ' disconnect with server.');
        }
    });
});

function convertNumberToPercent(part, all) {
    return (part / all) * 100;
}

function bulletsLoop() {
    const listOfTicks = gameTimer.listOfTicks;

    for (const tick of listOfTicks) {
        if (tick.nameOfTick.substr(0, 17) === 'Creating a Bullet' && tick.done && !tick.old) {
            let rawData = interpeter(tick.nameOfTick);
            rawData[0] = parseInt(rawData[0].substring(2)); //x
            rawData[1] = parseInt(rawData[1].substring(2)); //y
            rawData[2] = parseInt(rawData[2].substring(6)); //width
            rawData[3] = parseInt(rawData[3].substring(7)); //height
            rawData[4] = parseInt(rawData[4].substring(6)); //speed
            rawData[5] = parseInt(rawData[5].substring(7)); //mindmg   
            rawData[6] = parseInt(rawData[6].substring(7)); //maxdmg
            rawData[7] = parseInt(rawData[7].substring(8)); //targetX
            rawData[8] = parseInt(rawData[8].substring(8)); //targetY
            rawData[9] = rawData[9].substring(6); //owner
            
            
            GameObjects.bullets.push(new Bullet(rawData[0], rawData[1], rawData[2], rawData[3], new Hitbox(rawData[0], rawData[1], rawData[2], rawData[3]), rawData[4], rawData[5], rawData[6], rawData[7], rawData[8], rawData[9], 600));
            
            tick.old = true;
            for (const bullet of GameObjects.bullets) {
                for (const player of gamePlayers) {
                    if (bullet.owner === player.id) {
                        checkTheDirectionOfTheBullet(bullet,player);
                    }
                }
                for (const enemy of GameObjects.enemies) {
                    if (bullet.owner === 'Enemy'+enemy.id) {
                        checkTheDirectionOfTheBullet(bullet,enemy);
                    }
                }
            }
            break;
        }
    }
}

function updateHitboxs()
{
    for (const bullet of GameObjects.bullets) {
        bullet.hitbox.x = bullet.x;
        bullet.hitbox.y = bullet.y;
    }
    for (const chest of GameObjects.chests) {
        chest.hitbox.x = chest.x;
        chest.hitbox.y = chest.y;
    }
    for (const player of gamePlayers) {
        player.hitbox.x = player.x;
        player.hitbox.y = player.y;
    }
    for (const enemy of GameObjects.enemies) {
        if (enemy.hitboxActive) {
            enemy.hitbox.x = enemy.x;   
            enemy.hitbox.y = enemy.y; 
        }
    }
}

function playerLoop() {
    //socket.emit('moving-player', {x: mouseX, y: mouseY});
    for (const player of gamePlayers) {
        const {movingSpeed, x, y, width, height, spellsBuffer} = player;
        
        let oldX = x;
        let oldY = y;
        let oldDirectionX = player.movingDirectionAxisX;
        let oldDirectionY = player.movingDirectionAxisY;
        
        const lenght = spellsBuffer.spells.length;
        for (let i = 0; i < lenght; i++) {
            spellsBuffer.reloadsTimes[i] -= 15;
            if (spellsBuffer.reloadsTimes[i] <= 0) {
                spellsBuffer.reloadsTimes.splice(i, 1);
                spellsBuffer.spells.splice(i, 1);
            }
        }
        
        if (player.movingDirectionAxisX === 'Left') {
            player.x -= movingSpeed;
        } else if (player.movingDirectionAxisX === 'Right') {
            player.x += movingSpeed;
        } else if (player.movingDirectionAxisY === 'Up') {
            player.y -= movingSpeed;
        } else if (player.movingDirectionAxisY === 'Down') {
            player.y += movingSpeed;
        }
        
        for (const block of GameObjects.blocks) { //TODO: Ogranicz ilość sprawdzanych bloków IMPORTANT:TAG
            /*let hitbox = structuredClone(block.hitbox);
            hitbox.width /= blockHitboxPrecision;
            hitbox.height /= blockHitboxPrecision;
            
            let x = 0;
            for (let y = 0; i < blockHitboxPrecision;) {
                hitbox.x += x * hitbox.width;
                hitbox.y += y * hitbox.height;
                x++;
                if (x === )
//                if (y === blockHitboxPrecision / 2)
            }*/
            if (checkCollisionWith(block.hitbox, player.hitbox)) {
                if (oldDirectionX === 'Left' && player.x > block.x) {
                    player.x += movingSpeed;    
                } 
                if (oldDirectionX === 'Right' && player.x < block.x) {
                    player.x -= movingSpeed;   
                }
                
                if (oldDirectionY === 'Up' && player.y > block.y) {
                    player.y += movingSpeed;    
                } 
                if (oldDirectionY === 'Down' && player.y < block.y) {
                    player.y -= movingSpeed;   
                }
                break;
            }
        }
    }
}

setInterval(playerLoop, 15);


function gameLoop() {
    if (gameState === 'play') {
        updateHitboxs();
        
        let playersToSend = [];
        for (let i = 0; i < gamePlayers.length; i++) {
            if (gamePlayers[i].state !== 'noPlay' && gamePlayers[i].state !== 'spectator') {
                playersToSend.push(gamePlayers[i]);
            }
        }
                

        for (const player of gamePlayers) {
            if (player !== 'noPlay' && player.state !== 'spectator') {
                if (player.hp <= 0) {
                    player.isAlive = false;    
                }
            }
            
            GameObjects.bullets.forEach((bullet, idOfBullet) => {
                if (checkCollisionWith(player.hitbox, bullet.hitbox) && bullet.owner !== player.id) {
                    const givenDmg = Math.floor(Math.random() * (bullet.maxDmg - bullet.minDmg + 1) + bullet.minDmg);
                    player.hp -= givenDmg;
                    GameObjects.bullets.splice(idOfBullet, 1);
                }
            });
        }
        
        for (const enemy of GameObjects.enemies) {
            choosePlayer(enemy, gamePlayers);
            fieldOfView(enemy,GameObjects.blocks);
            enemyAi(enemy,gameAttackList, enemy.objectivePlayer, gameTimer, GameObjects.chests, GameObjects.bullets, GameObjects.blocks);
//            console.log(enemy.aiState, enemy.secondAiState);

            if (enemy.aiState !== 'dodge') {
                if (enemy.weapon.type === 'distance' && enemy.aiState !== 'shooting' && enemy.secondAiState !== 'loadingpath' && enemy.secondAiState !== 'walk') {
                    enemy.secondAiState = 'icanshoot?';
                }
                if (enemy.weapon.type === 'distance' && enemy.aiState !== 'shooting' && enemy.aiState !== 'oblivion' && enemy.aiState !== 'pathwalking' && enemy.aiState !== 'walk') {
//                    enemy.aiState = 'quest';
                } else if (enemy.weapon.type !== 'distance' && enemy.aiState !== 'oblivion' && enemy.aiState !== 'pathwalking' && enemy.aiState !== 'walk') {
//                    enemy.aiState = 'quest';
                }
            }

        }
        
        for (const npc of npcs) {
            npc.ai();
        }
        
        GameObjects.bullets.forEach((bullet, idOfBullet) => {
            moveBullet(bullet);
            if (bullet.speed <= 0) {
                GameObjects.bullets.splice(idOfBullet, 1);
            }
            for (const enemy of GameObjects.enemies) {
                if (checkCollisionWith(bullet.hitbox, enemy.hitbox) && enemy.hitboxActive && bullet.owner.length === 20) {
                    const givenDmg = Math.floor(Math.random() * (bullet.maxDmg - bullet.minDmg + 1) + bullet.minDmg);
                    enemy.hp -= givenDmg;
                    GameObjects.bullets.splice(idOfBullet, 1);
                }
            }
            for (const block of GameObjects.blocks) {
                if (checkCollisionWith(block.hitbox, bullet.hitbox)) {
                    GameObjects.bullets.splice(idOfBullet, 1);    
                }
            }
            
        });
        
        const listOfTicks = gameTimer.listOfTicks;

        for (const tick of listOfTicks) {
            if (tick.nameOfTick.substr(0, 13) === 'Player attack' && tick.done && !tick.old) {
                let rawData = interpeter(tick.nameOfTick);
                rawData[0] = rawData[0].substring(3); //id
                rawData[1] = parseInt(rawData[1].substring(4)); //dmg
                
                const attacker = gamePlayers.filter(player => {
                    return player.id === rawData[0];
                })[0];
                
                for (const player of gamePlayers) {
                    if (attacker !== undefined) {
                        if (attacker !== player && checkCollisionWith(attacker.hitbox, player.hitbox)) {
                            player.hp -= rawData[1];
                        }    
                    }
                }
                
                for (const enemy of GameObjects.enemies) {
                    if (attacker !== undefined) {
                        if (checkCollisionWith(attacker.hitbox, enemy.hitbox)) {
                            enemy.hp -= rawData[1];
                        }    
                    }
                }
                tick.old = true;

            } else if (tick.nameOfTick.substr(0, 34) === 'Reloading a player distance weapon' && tick.done && !tick.old) {   
                console.log(tick.nameOfTick)
                console.log(tick)
                console.log(tick.nameOfTick.substr(0, 34), tick.nameOfTick.substr(34).split(',')[0], tick.nameOfTick.substr(34).split(',')[1]);
                const ammoId = tick.nameOfTick.substr(34).split(',')[1];
                const player = gamePlayers.filter(player => {
                    return player.id === tick.nameOfTick.substr(34).split(',')[0];
                })[0];
                console.log(player)
                console.log(player.ammunition);
                player.ammunition[ammoId].reloading = false;    
                console.log(player.ammunition[ammoId].actualAmmunition, player.ammunition[ammoId], player.ammunition[ammoId].maxMagazine)
                player.ammunition[ammoId].actualAmmunition = player.ammunition[ammoId].actualAmmunition + Math.min(player.ammunition[ammoId].allAmmunition, player.ammunition[ammoId].maxMagazine);
                tick.old = true;
            } else if (tick.nameOfTick.substr(0, 33) === 'Reloading a enemy distance weapon' && tick.done && !tick.old) {   
                console.log(tick.nameOfTick.substr(0, 33), tick.nameOfTick.substr(33).split(',')[0], tick.nameOfTick.substr(33).split(',')[1]);
                const ammoId = tick.nameOfTick.substr(33).split(',')[1];
                const enemy = GameObjects.enemies.filter(enemy => {
                    return enemy.id === Number(tick.nameOfTick.substr(33).split(',')[0]);
                })[0];
                console.log(tick.nameOfTick.substr(33).split(',')[0]);
//                console.log(GameObjects.enemies[0].id);
                enemy.ammunition[ammoId].reloading = false;   
                console.log(enemy.ammunition[ammoId]);
                console.log(enemy.ammunition[ammoId].actualAmmunition, enemy.ammunition[ammoId], enemy.ammunition[ammoId].maxMagazine);
                enemy.ammunition[ammoId].actualAmmunition = enemy.ammunition[ammoId].actualAmmunition + Math.min(enemy.ammunition[ammoId].allAmmunition, enemy.ammunition[ammoId].maxMagazine);
                tick.old = true;
            } else {
                for (const enemy of GameObjects.enemies) {
                    if (tick.nameOfTick === 'EnemyLightAttack EnemyId:' + enemy.id && tick.done && !tick.old) {
                        const playerId = gamePlayers.map(object => object.id).indexOf(enemy.objectivePlayer.id);
            
                        enemy.weapon.attack(enemy, null, gameTimer, gamePlayers[playerId], 'enemy');
                        tick.old = true;
                    }
                }
            }
        }
        //TODO: Sprawdź co gracz widzi!!!!! I wyślij tylko to do niego!!!!!!!! IMPORTANT:TAG ZROBIONO: Bloki, skrzynie, bullets, player. ZOSTAŁY: enemies. 
        
        
        for (const player of gamePlayers) {
            const chest = sendObjects(GameObjects.chests, player, 'send-chests');   
            const players = sendObjects(gamePlayers, player, 'send-players');   
            const bullets = sendObjects(GameObjects.bullets, player, 'send-bullets');   
            const npsc = sendObjects(npcs, player, 'send-npcs');   
            io.to(player.id).emit('debug-saved-items-second-count',[chest, players, bullets, npsc]);
        }
        
        
        io.emit('send-enemies', GameObjects.enemies);
        io.emit('send-time', gameTimer.generalGameTime);
        clearTimerCache(gameTimer);
    }
}

function sendObjects(allObjects, player, emitName) {
            const {width,height} = player;
            const x = player.x - ((1400 - player.width) / 2);
            const y = player.y - ((920 - player.height) / 2);
            const cameraHitbox = new Hitbox(x, y, 1400, 920);

            let objects = [];
            let objectsToCheck = [];

            for (let i = 0; i < allObjects.length; i++) {
                const object = allObjects[i];
                if (Math.max(object.x - player.x, player.x - object.x) + Math.max(object.y - player.y, player.y - object.y) < 1800) {
                    objectsToCheck.push(object);
                }
            }

            for (let i = 0; i < objectsToCheck.length; i++) {
                const object = objectsToCheck[i];
                if (checkCollisionWith(object.hitbox, cameraHitbox)) {
                    objects.push(object);
                }
            }
            io.to(player.id).emit(emitName, objects);
            return {a:objects.length,b:allObjects.length,name:emitName.split('-')[1]};
        }

let lastTime = Date.now();

setInterval(()=>{
    if(adminPanelOn) {
        const data = {objects:GameObjects,players:gamePlayers}
        adminIo.emit('game-objects',data);
    }
},100);

setInterval(()=>{
    console.log('Save');
    for (const player of gamePlayers) {
        updateUser({name:player.login},{object:convertObject(player, 'json')});    
    }
},1000*50);

setInterval(bulletsLoop, 35);
setInterval(gameLoop, 30);
setInterval(() => {
    gameTimer.generalGameTime += 15;
    for (let i = 0; i < gameTimer.listOfTicks.length; i++) {
        if (gameTimer.listOfTicks[i].endTime < gameTimer.generalGameTime) {
            gameTimer.listOfTicks[i].done = true;
        }
    }
    /*gameTimer.generalGameTime += 15 + ( 15 - (Date.now() - lastTime));
    lastTime = Date.now();
    for (let i = 0; i < gameTimer.listOfTicks.length; i++) {
        if (gameTimer.listOfTicks[i].endTime < gameTimer.generalGameTime) {
            gameTimer.listOfTicks[i].done = true;
        }
    }*/
}, 15);