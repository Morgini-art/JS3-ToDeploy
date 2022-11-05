const express = require('express');
const playerFile = require('./serverFiles/player');
const timeFile = require('./serverFiles/time');
const Player = playerFile.Player;
const Weapon = require('./serverFiles/weapon').Weapon;
const Ammunition = require('./serverFiles/weapon').Ammunition;
const interpeter = require('./serverFiles/text').interpeter;
const Bullet = require('./serverFiles/bullet').Bullet;
const Chest = require('./serverFiles/chest').Chest;
const Hitbox = require('./serverFiles/hitbox').Hitbox;
const Enemy = require('./serverFiles/enemy').Enemy;
const mapFile = require('./serverFiles/map');
const BlockFile = require('./serverFiles/block');
const InvetoryFile = require('./serverFiles/invetory');
const SpellFile = require('./serverFiles/spell');
const Spell = SpellFile.Spell;
const SpellsBuffer = SpellFile.SpellsBuffer;
const renewMagicEnergy = SpellFile.renewMagicEnergy;
const Invetory = InvetoryFile.Invetory;
const Slot = InvetoryFile.Slot;
const fillInvetoryWithSlots = InvetoryFile.fillInvetoryWithSlots;
const Item = InvetoryFile.Item;
const Block = BlockFile.Block;
const createBlock = BlockFile.createBlock;
const createBlocksWithGrid = BlockFile.createBlocksWithGrid;
const checkCollisionWith = require('./serverFiles/hitbox').checkCollisionWith;
const Timer = timeFile.Timer;
const Tick = timeFile.Tick;
const clearTimerCache = timeFile.clearTimerCache;
const timeLoop = timeFile.timeLoop;
const GameMap = mapFile.GameMap;
const Chunk = mapFile.Chunk;
const generatePlane = mapFile.generatePlane;
const loadMap = mapFile.loadMap;
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const { networkInterfaces } = require('os');

const Version = require('./version');

console.log('Server version:',Version.version);
console.log('Compabityle with:',Version.accessWith);

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(results);

server.listen(process.env.PORT, () => {
    console.log('Server start on: localhost');
    writeToLog('Server start');
});

function onErr(err) {
    console.log(err);
    return 1;
}

const {Server} = require('socket.io');
const io = new Server(server);

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

const mapFirstLayer = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

const mapSecondLayer = [37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            39, 40, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0,
            43, 44, 0, 0, 46, 48, 0, 0, 0, 48, 0, 0, 46, 0, 48, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 48, 0, 0, 0, 48, 41, 42, 46, 0, 48, 0, 0, 0, 0, 0, 0, 28, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 28, 43, 44, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 46, 0, 0, 28, 0, 0, 0, 0, 0,
            48, 0, 0, 0, 37, 38, 36, 48, 0, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33,
            0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 33, 0, 0, 16, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 36, 0, 0, 49, 0, 39, 40, 0, 0, 0, 0, 48, 0, 0, 48, 0, 0, 36, 0, 0, 49, 0, 0, 0,
            0, 0, 0, 25, 41, 42, 0, 0, 37, 38, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 16, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 43, 44, 0, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 37, 38, 0, 43, 44, 0, 0, 46, 0, 0, 0, 0, 25, 0, 0, 0, 0, 37, 38, 0, 0, 0,
            0, 0, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0, 0, 0, 33, 0, 0, 0, 39, 40, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 39, 40, 0, 0, 0,
            0, 0, 0, 0, 48, 0, 0, 0, 43, 44, 36, 0, 0, 49, 0, 0, 0, 0, 0, 0, 41, 42, 0, 49, 0, 0, 41, 42, 0, 48, 25, 0, 0, 0, 0, 36, 0, 0, 49, 0, 49, 0, 0, 41, 42, 0, 0, 25,
            0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 0, 43, 44, 0, 0, 0, 0, 43, 44, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 43, 44, 0, 0, 0,
            48, 0, 0, 0, 0, 0, 0, 25, 14, 0, 0, 0, 37, 38, 0, 0, 39, 40, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 25, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 41, 42, 48, 0, 0, 37, 38, 0, 0, 0, 14, 0, 0, 41, 42, 0, 0, 0, 0, 48, 0, 39, 40, 0, 0, 0, 0, 14, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 43, 44, 0, 0, 0, 39, 40, 0, 37, 38, 37, 38, 0, 43, 44, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0, 37, 38, 0, 0, 0,
            0, 0, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 39, 40, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 39, 40, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 48, 0, 0, 0, 43, 44, 0, 41, 42, 41, 42, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0,
            0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 14, 5, 0, 39, 40, 0, 0, 37, 38, 0, 0, 0, 43, 44, 43, 44, 0, 28, 0, 39, 40, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0,
            0, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 37, 38, 41, 42, 37, 38, 39, 40, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 37, 38, 39, 40, 43, 44, 39, 40, 41, 42, 0, 39, 40, 0, 48, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 0, 0,
            0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 39, 40, 41, 42, 37, 38, 41, 42, 43, 44, 0, 41, 42, 0, 37, 38, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0,
            0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 41, 42, 43, 44, 39, 40, 43, 44, 0, 46, 0, 43, 44, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 41, 42, 0, 0, 37, 38, 0, 0, 0, 0, 41, 42, 0, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 0, 0, 43, 44, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 39, 40, 0, 36, 0, 0, 43, 44, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 16, 39, 40, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 37, 38, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 37, 38, 0, 0, 0, 37, 38, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0, 48, 0, 0, 0, 48, 0, 0, 46, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 33, 0, 0, 39, 40, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 41, 42, 48, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 48, 43, 44, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 46, 43, 48, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 48, 0, 0, 0, 0, 0, 0, 46, 0, 48, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 0, 37, 38, 0, 48, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 48, 0, 0, 49, 48, 0, 0, 46, 0, 48, 0, 0, 0,
            37, 38, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 0, 39, 40, 0, 0, 0, 0, 33, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 28,
            39, 40, 0, 0, 48, 0, 33, 0, 0, 48, 36, 0, 0, 49, 0, 0, 0, 0, 0, 0, 41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 25, 0, 37, 38, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            41, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, 0, 0, 16, 0, 0, 43, 44, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 39, 40, 0, 33, 0, 0, 48, 0, 0, 0, 0,
            43, 44, 0, 0, 46, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 41, 42, 0, 41, 42, 0, 0, 25, 0, 0, 0, 28, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 36, 33, 0, 49, 0, 0, 0, 0, 43, 44, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            48, 0, 0, 0, 0, 0, 36, 0, 0, 49, 0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0,
            0, 0, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 48, 0, 0, 14, 0, 0, 36, 0, 0, 49, 0, 0, 0, 0,
            0, 0, 0, 25, 0, 0, 25, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16,
            0, 0, 0, 0, 48, 0, 0, 0, 39, 40, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0, 0, 0, 0, 25, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 0, 0, 41, 42, 0, 0, 25, 0,
            0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 0, 0, 0, 0,
            48, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

console.log('Environment');
console.log('NodeJs Version: ' + process.version);
console.log('Version: ' + process.env.npm_package_version);

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


//    const y = 800;
//const x = 1500;

const items = [
    new Item('Test01',3,0,'test01',false),
    new Item('Test02',7,0,'test02',false)
];

GameObjects.chests.push(new Chest(1500, 800, 25, 25, new Hitbox(1500, 800, 25, 25), structuredClone(items[0])));


const weapons = [
    new Weapon('Pistolet', 1, 3, 1, 20, 20, 'distance', 3, structuredClone(ammunitions[0]), 90),
    new Weapon('Młot', 24, 34, 1, 20, 350, 'melee'),
    new Weapon('Mały Miecz', 6, 13, 1, 20, 240, 'melee'),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80)
];

const spells = [
    new Spell('Błyskawica', 18, 'dmg', 'thunderboltAttack', 'enemy:1', 2, 14, 18),
    new Spell('Kula Ognia', 2, 'dmg', 'ballOfFire', 'direction:hitenemy:1', 1, 16, 35),
    new Spell('Magiczna pułapka', 24, 'dmg', 'magicTrap', 'direction:hitenemy:1', 2.6, 12, 27),
    new Spell('Niepamięć', 23, 'time', 'oblivion', 'enemy:1', 7, null, null, 4)
];

//const player1 = new Player('id', 'Player1', 'PvP',10, 10, 50, 65, 100, 100, weapons[3], new Hitbox(10, 10, 50, 65), 4, 50, 50, [structuredClone(ammunitions[1])],);
//player1.ammunition[0].allAmmunition = 15;

GameObjects.enemies.push(new Enemy(0, 450, 80, 50, 65, 40, 40, weapons[3], new Hitbox(undefined, undefined, 50, 65), 1, 1, structuredClone(items[1]), 1, 0, [structuredClone(ammunitions[1])]));
console.log(GameObjects.enemies[0]);

GameObjects.enemies[0].secondAiState = 'icanshoot?';
GameObjects.enemies[0].ammunition[0].allAmmunition = 15;


createBlocksWithGrid(800, 50, 64, 64, house02TileObject, 10, 8, GameObjects);

createBlocksWithGrid(1500, 80, 64, 64, house01TileObject, 6, 8, GameObjects);

createBlocksWithGrid(2570, 90, 64, 64, house02TileObject, 10, 8, GameObjects);


generatePlane(3, GameObjects.map, 1024, 1024);
loadMap(GameObjects.map, 3, mapFirstLayer, mapSecondLayer, GameObjects);
/*
console.group();
console.log('Test Objects:');
console.log('Enemy:' , GameObjects.enemies[0]);
//console.log('Him weapon:' , newWeapon);
//console.log('Ammo to weapon:' , newWeapon.requiredAmmunition);
//console.log('Player ammo:' , player1.ammunition);
console.groupEnd();*/

//console.log(weapons[0]);

GameObjects.chests.push(new Chest(2200, 2200, 25, 25, new Hitbox(2200, 2200, 25, 25), 'nothing', 'chest'));

let gameState = 'off';

let players = [];

let gamePlayers = [];
let countOfPlayers = 0;
const maxCountOfPlayers = 2;

let whereToGo = 0;

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: '\public'
    });
});

function writeToLog(text) {
    const dateObject = new Date();
    const date = 'Day:'+dateObject.getDate()+'-'+dateObject.getHours()+':'+dateObject.getMinutes()+':'+dateObject.getSeconds();
    
    fs.writeFile('\logs.txt', date+'=>'+text+'\n', {flag: 'a'},err => {
        if (err) {
            console.error(err);
        }
    });
}

app.use(express.static('public'));

function updateGameState () {
    let counter = 0;
    for (const player of gamePlayers) {
        if (player.state === 'yesPlay') {
            counter++;
        }
    }
    if (countOfPlayers >= 2 && counter >= 2) {
        gameState = 'play';
        io.emit('send-game-state', 'play');
    } else {
        gameState = 'off';
        const numberOfPlayers = countOfPlayers - 1;
        io.emit('send-info', 'Other players:' + numberOfPlayers +'<br>'+'To play required minimum two players with active status');
    }   
}


io.on('connection', (socket) => {
    socket.on('client-version', clientVersion => {
        /*if (Version.version === clientVersion) {

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
        }*/
    });
    writeToLog('User with id:'+socket.id+' connect with server.');
    io.emit('send-info', 'Other players:' + countOfPlayers);
    const status = {
        host:  socket.handshake.headers.host,
        state: 'connected'
    };
    io.emit('send-status-server', status);

    
    const x = 1500;
    const y = 800;
    const newWeapon = new Weapon('Sztylet', 8, 14, 1, 80, 15, 'melee', 2);
    const newInvetory = new Invetory();
    const newSpellsBuffer = new SpellsBuffer();
    newInvetory.basicSlots.length = 30;
    fillInvetoryWithSlots(newInvetory);
    newInvetory.basicSlots[0].content = items[0];
    newInvetory.basicSlots[2].content = items[1];
    const newPlayer = new Player(socket.id, socket.id, 'PvP', x, y, 50, 65, 100, 100, weapons[3], new Hitbox(x, y, 50, 65), 3, 250, 280, [structuredClone(ammunitions[1])], newInvetory, newSpellsBuffer, structuredClone(spells));
    //    const player1 = new Player('id', 'Player1', 'PvP',10, 10, 50, 65, 100, 100, weapons[3], new Hitbox(10, 10, 50, 65), 4, 50, 50, [structuredClone(ammunitions[1])]);
    newPlayer.ammunition[0].allAmmunition = 15;
    players.push(newPlayer);
    gamePlayers.push(players[whereToGo]);
    socket.emit('assign-player', players[whereToGo]);

    countOfPlayers++;
    whereToGo++;
    
    
    /*console.log('-----------------------');
    console.log(players);
    console.log('-----------------------');*/

    
    setInterval(updateGameState, 1000);

    socket.on('set-player-move-target', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
                player.targetX = data.x;
                player.targetY = data.y;
            }
        }
    });
    
    socket.on('change-moving-state', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
                player.moving = data;
            }
        }
    }); 
    
    socket.on('request-cursor-mode', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
                for (const spell of spells) {
                    if (spell.name === player.actualSpell) {
                        console.log('Player:',player.actualSpell, 'Finded:',spell.name);
                        const cursorMode = spell.bewitch(data, player, 'player', player.spellsBuffer);
                        socket.emit('change-cursor-state', cursorMode);
                    }
                }
            }
        }
    });
    
    socket.on('spell-marking', data => {
        console.log(data);
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
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
                    console.log(objects.length, GameObjects.enemies.length + gamePlayers.length);

                    for (const object of objects) {

                        const collisionWith = checkCollisionWith(data, object.hitbox);
                        //                    console.log(collisionWith, data, object.hitbox);
                        if (collisionWith) {

                            //                        console.log('DWA', object);
                            socket.emit('change-cursor-state', 'auto');
                            //                        can.style.cursor = 'auto';
                            player.magicEnergy -= actualSpell.requiredMagicEnergy;
                            if (actualSpell.action === 'thunderboltAttack') {
                                console.log('AA');
                                actualSpell.completeSpell(object);
                                player.spellsBuffer.spells.push('thunderboltAttack');
                                player.spellsBuffer.reloadsTimes.push(actualSpell.reload * 1000);
                                console.log(player.spellsBuffer.reloadsTimes, player.spellsBuffer.spells);
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
                                    console.log(object.aiState)
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

                        console.log(GameObjects.bullets[GameObjects.bullets.length - 1]);

                        if (action === 'magicTrap') {
                            GameObjects.bullets[GameObjects.bullets.length - 1].getMove = false;
                            GameObjects.bullets[GameObjects.bullets.length - 1].distance = 1;
                        }

                        for (const bullet of GameObjects.bullets) {
                            console.log(bullet);
                            if (bullet.owner === player.id) {
                                console.log('TRUE', player, 'TRUE');
                                bullet.checkTheDirection(player);
                            }
                        }
                        /*cursorMode = 'moving';
                        can.style.cursor = 'auto';*/
                        socket.emit('change-cursor-state', 'moving');
                    }
                }
            }
        }
    });
        
    
    socket.on('player-attack', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
//                player.attack(data, gameTimer, undefined, undefined, 'player');OLD
                player.attack(data, gameTimer);    
            }
        }
    });
    
    /*socket.on('player-mouse-down', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator' && data === 3) {
                gameTimer.listOfTicks.push(new Tick('Player To block PlayerId:' + player.id, gameTimer.generalGameTime, gameTimer.generalGameTime + 150));    
                console.log('Added', gameTimer.listOfTicks);
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
                         console.log('Removed');
                     }
                 }
             }
         }
     });*/

    socket.on('enter-to-game', data => {
        console.log(data);
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
                console.log(socket.id, player);
                player.state = data.state;
                player.name = data.name;
                console.log(socket.id, player);
                
                if (countOfPlayers < 2) {
                    //socket.emit('send-alert', 'Waiting for more players. Required minimum two players with active status');
                }
            }
        }
    });
    
    socket.on('player-open-chest', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
                for (const chest of GameObjects.chests) {
                    if (checkCollisionWith(player.hitbox, chest.hitbox)) {
                        chest.open(player, player.invetory);
                        console.log('Player with name:'+player.name+' (id)'+player.id+'open the chest.');
                    }
                }
            }
        }
    });
    
    socket.on('player-change-weapon', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
                player.weapon = weapons[player.weaponCounter];
                player.weaponCounter++;
                if (player.weaponCounter === 4) {
                    player.weaponCounter = 0;   
                }
            }
        }
    });
    
    socket.on('player-change-spell', data => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
                player.actualSpell = spells[player.spellCounter].name;
                player.spellCounter++;
                if (player.spellCounter === 4) {
                    player.spellCounter = 0;   
                }
            }
        }
    });
    
    socket.on('player-start-move', keyCode => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
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
        }
    });

    socket.on('player-stop-move', keyCode => {
        for (const player of gamePlayers) {
            if (socket.id === player.id && player.state !== 'spectator') {
                if (keyCode === 87 || keyCode === 83) {
                    player.movingDirectionAxisY = 'None';
                } else if (keyCode === 65 || keyCode === 68) {
                    player.movingDirectionAxisX = 'None';
                }
            }
        }
    });
    
    socket.on('update-object', keyCode => {
        for (const player of gamePlayers) {
            if (socket.id === player.id) {
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

                console.log(chunksToSend.length, GameObjects.map.chunks.length * GameObjects.map.chunks.length);
                console.log(convertNumberToPercent(chunksToSend.length, GameObjects.map.chunks.length * GameObjects.map.chunks.length).toFixed(2));
//                socket.emit('send-chunks', chunksToSend);*/
                
                const x = player.x - 700 - 50;
                const y = player.y - 460 - 50;
                const cameraHitbox = new Hitbox(x, y, 1400 + 50, 920 + 50);

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
                
                socket.emit('send-blocks', blocks);
                socket.emit('send-blocks-stats', convertNumberToPercent(blocksToCheck.length, GameObjects.blocks.length).toFixed(2));

            }
        }
    });
    
    
    socket.on('ping', (callback) => {
        callback();
    });

    socket.on('disconnect', function () {
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
        io.emit('send-info', 'Other players:' + countOfPlayers);
        console.log('-----------------------');
        console.log(idOfUser);
        console.log(players);
        console.log(gamePlayers);
        console.log('-----------------------');
        writeToLog('User with id:'+socket.id+' disconnect with server.');
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
                        bullet.checkTheDirection(player);
                    }
                }
                for (const enemy of GameObjects.enemies) {
                    if (bullet.owner === 'Enemy'+enemy.id) {
                        bullet.checkTheDirection(enemy);
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
            enemy.choosePlayer(gamePlayers);
            enemy.enemyAi(gameAttackList, enemy.objectivePlayer, gameTimer, GameObjects.chests, GameObjects.bullets, GameObjects.blocks);

            if (enemy.aiState !== 'dodge') {
                if (enemy.weapon.type === 'distance' && enemy.aiState !== 'shooting') {
                    enemy.secondAiState = 'icanshoot?';
                }
                if (enemy.weapon.type === 'distance' && enemy.aiState !== 'shooting' && enemy.aiState !== 'oblivion') {
                    enemy.aiState = 'quest';
                } else if (enemy.weapon.type !== 'distance' && enemy.aiState !== 'oblivion') {
                    enemy.aiState = 'quest';
                }
            }

        }
        
        GameObjects.bullets.forEach((bullet, idOfBullet) => {
            bullet.move();
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
                console.log(tick.nameOfTick.substr(0, 34), tick.nameOfTick.substr(34).split(',')[0], tick.nameOfTick.substr(34).split(',')[1]);
                const ammoId = tick.nameOfTick.substr(34).split(',')[1];
                const player = gamePlayers.filter(player => {
                    return player.id === tick.nameOfTick.substr(34).split(',')[0];
                })[0];
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
                console.log(GameObjects.enemies[0].id);
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
        
        //TODO: Sprawdź co gracz widzi!!!!! I wyślij tylko to do niego!!!!!!!! IMPORTANT:TAG ZROBIONO: Bloki. ZOSTAŁY: skrzynie, enemies, bullets, players 
        io.emit('send-bullets', GameObjects.bullets);
        io.emit('send-chests', GameObjects.chests);
        io.emit('send-enemies', GameObjects.enemies);
        io.emit('send-players', gamePlayers);
        
        clearTimerCache(gameTimer);
        
    }
    
    /*for (const user of gamePlayers) {
        let msg = '';
        for (const player of gamePlayers) {
            if (player.id === user.id) {
                msg += player.id + ':' + 'OK<br>';     
            } else {
                msg += player.id + ':' + 'X<br>';      
            }
        }
        io.to(user.id).emit('send-status-server', 'YOU are:' + user.id + '<br>' + msg + '<br>END');
        console.log(user.id);
    }*/
}

setInterval(bulletsLoop, 35);
setInterval(gameLoop, 25);
setInterval(timeLoop, 1, gameTimer);