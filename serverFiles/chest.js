class Chest {
    constructor(x, y, width, height, hitbox, content, icon = 'item', isOpen = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = hitbox;
        this.content = content;
        this.icon = icon;
        this.isOpen = isOpen;
    }
}

function openChest(chest, opener, openerInvetory) {
    const {
        isOpen,
        content
    } = chest;

    if (!isOpen) {
        chest.isOpen = true;
        let end = false;
        console.log(openerInvetory);
        openerInvetory.basicSlots.forEach((slot, actualId) => {
            if (slot.content === 'empty' && !end) {
                openerInvetory.basicSlots[actualId].content = content;
                openerInvetory.basicSlots[actualId].amount = content.amount;
                console.log(openerInvetory.basicSlots);
                console.log(slot);
                end = true;
            } else if (slot.content.itemName === content.itemName && !end) {
                openerInvetory.basicSlots[actualId].amount += content.amount;
                console.log(slot);
                end = true;
            }
        });
    }
}


module.exports = {
    Chest,
    openChest
};