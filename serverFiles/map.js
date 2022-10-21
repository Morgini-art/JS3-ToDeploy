const Hitbox = require('./hitbox').Hitbox;
const Block = require('./block').Block;


function createBlock(chunk, x, y, width, height, type) {
//    console.log(chunk);
    chunk.content.push(new Block(x, y, width, height, new Hitbox(x, y, width, height), type));
}

function createBlocksWithGrid(baseX, baseY, blockWidth, blockHeight, blockMap, gridWidth, gridHeight, chunk) {

    let x = 0;
    let y = 0;
    
   // console.log(chunk);
    let jump = gridWidth;
    let start = true;
    
    //console.log(blockMap);
    
    for (let i = 0; i < blockMap.length; i++) {
         blockMap[i] -= 1;
        
        if (blockMap[i] !== -1) {
            createBlock(chunk, baseX + x, baseY + y, blockWidth, blockHeight, blockMap[i]);        
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
    }
    //console.log('LOAED!!!!!!');
    
    for (let i = 0; i < blockMap.length; i++) {
        blockMap[i] += 1;
    }
}

class GameMap {
    chunks = [];
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Chunk {
    constructor(x, y, width, height, content, graphicContent) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.content = content;
        this.graphicContent = graphicContent;
        this.visible = false;
    }
    
    load() {
            
    }
}

function generatePlane(size, map, chunkWidth, chunkHeight) {
    
    for (let i = 0; i < size; i++) {
        map.chunks[i] = [];
    }
    //map.chunks.lenght = size;
    for (let width = 0; width < size; width++) {
        for (let height = 0; height < size; height++) {
            map.chunks[width][height] = new Chunk(chunkWidth * width, chunkHeight * height, chunkWidth, chunkHeight, [], []);    
        }
    }
    map.width = size * chunkWidth;
    map.height = size * chunkHeight;
    
    //console.log(map.chunks);
}


function loadMap (mapObject, size,firstLayer, secondLayer, GameObjects) {
    let isLoad = [false, false];
    
    for (let width = 0; width < size; width++) {
        for (let height = 0; height < size; height++) {
            const chunk = mapObject.chunks[width][height];
            //console.log('To load:',chunk.width / 64 * chunk.height / 64);
            
            const blocksToLoadFirstLayer = firstLayer.splice(0, chunk.width / 64 * chunk.height / 64);     //We loaded sectors of map to small chunks sizes 
            const blocksToLoadSecondLayer = secondLayer.splice(0, chunk.width / 64 * chunk.height / 64);     
            /*console.log('Loaded chunk:',blocksToLoadFirstLayer.length); //Logs
            console.log('The remaining:',firstLayer.length);
            console.log('---');
            console.log('2Loaded chunk:',blocksToLoadSecondLayer.length);
            console.log('2The remaining:',secondLayer.length);
            console.log('---');*/
            
            //Now we add the blocks to mapObject
            /*chunk.content =*/ createBlocksWithGrid(chunk.x, chunk.y, 64, 64, blocksToLoadFirstLayer, 16, 16, chunk);
            /*chunk.content += */createBlocksWithGrid(chunk.x, chunk.y, 64, 64, blocksToLoadSecondLayer, 16, 16, chunk);
            
            
            if (firstLayer.length === 0) {
                isLoad[0] = true;
            } 
            if (secondLayer.length === 0) {
                isLoad[1] = true;    
            }
            
            if (isLoad.every(element => element === true)) {
                //console.log(width, height);
                return true;
            }
        }
    }
}  
 
module.exports = {GameMap, Chunk, generatePlane, loadMap};