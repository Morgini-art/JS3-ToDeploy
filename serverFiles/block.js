const Hitbox = require('./hitbox').Hitbox;

class Block {
    constructor(x, y, width, height, hitbox, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = hitbox;
        this.type = type;
    }
}

function createBlock(GameObjects, x, y, width, height, type) {
    GameObjects.blocks.push(new Block(x, y, width, height, new Hitbox(x, y, width, height), type));
}

function createBlocksWithGrid(baseX, baseY, blockWidth, blockHeight, blockMap, gridWidth, gridHeight, GameObjects) {
    //createBlocksWithGrid(2200, 2000, 50, 50, [], 10, 10, GameObjects);

    let x = 0;
    let y = 0;
    
    
    let jump = gridWidth;
    let start = true;
    
//    console.log(blockMap);
    
    for (let i = 0; i < blockMap.length; i++) {
         blockMap[i] -= 1;
        
        if (blockMap[i] !== -1) {
            createBlock(GameObjects, baseX + x, baseY + y, blockWidth, blockHeight, blockMap[i]);        
        }

        x += blockWidth;
        if (i === gridWidth || start && i === (gridWidth - 1)) {
            //console.log('Generating coll');
            x = 0;
            y += blockHeight;
            gridWidth += jump;
            if (start) {
                gridWidth--;
            }
            start = false;
        }
         //console.log(y);
    }
    
    for (let i = 0; i < blockMap.length; i++) {
        blockMap[i] += 1;
    }
    
    
//    console.log(GameObjects.blocks);
}

module.exports = {Block, createBlock, createBlocksWithGrid};