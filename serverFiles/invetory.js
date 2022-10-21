class Invetory{
    numberOfBasicSlots = 30;
    basicSlots = [];
    show = false;

    drawInvetory (ctx, functionDrawText, mode, can, graphics) {
        const {basicSlots, numberOfBasicSlots, show} = this;
        //console.log(graphics);
        if (show && mode === 'quick-preview') {
            functionDrawText(1080, 40, basicSlots, 'black', 20, 'Monospace', numberOfBasicSlots, 'Invetory/content');
        } else if (show && mode === 'full-preview') {
            const generalY = (950 - 698) / 2;
            const generalX = (1500 - 854) / 2;
            ctx.drawImage(graphics, generalX, generalY);  
            
                
            for (let i = 0; i < numberOfBasicSlots; i++) {
                const dSlot = basicSlots[i];
                if (dSlot.content !== 'empty') {
                    if (dSlot.content.itemName === 'Test01') {
                        ctx.fillStyle = 'green';
                    } else {
                        ctx.fillStyle = 'white';
                    }
                    ctx.fillRect(generalX + dSlot.x, generalY + dSlot.y, 85, 85);
                }
                //console.log(generalX + dSlot.x, generalY + dSlot.y,);
                
            }
        }
    }
}

class Item {
    constructor(name, price, type, rarity, effect, toBuyInShop) {
        this.itemName = name;
        this.itemPrice = price;
        this.itemType = type;
        this.itemRarity = rarity;//(0)ordinary,(1)unusual,(2)unusual,(3)epic,(4)legendary
        this.itemEffect = effect;
        this.toBuyInShop = toBuyInShop;
    }
}

class Slot {
    constructor(id, content = 'empty',x , y) {
        this.id = id;
        this.content = content;
        this.x = x;
        this.y = y;
    }
}

function fillInvetoryWithSlots(invetoryObject) {
    let collumn = 0; 
    let row = 0;
    
	for (let i = 0; i < invetoryObject.basicSlots.length; i++) {
		invetoryObject.basicSlots[i] = new Slot(i, 'empty',50 + 87 * row, 50 + 87 * collumn);
        
        row++;
        
        if (row === 6) {
            collumn++;
            row = 0;
        }
	}
    
    /*Slot start: 50, 50 (50 + 87 * wiersz, 50 + 87 * kolumna)
    Slot size: 85, 85
    Slot space: 2 = witch 87
    Slot map : 6x4 (20 slots)*/
}

module.exports = {Slot, fillInvetoryWithSlots, Invetory, Item};