/*TEN PLIK ZAWIERA FUNKCJE SŁUŻĄCE DO OBLICZEŃ MATEMATYCZNYM, LOSOWYCH I INNYCH.*/

function getDistance(x1, y1, x2, y2) {
    const a = x1 - x2,
        b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function convertNumberToPercent(part, all) {
    return (part / all) * 100;
}

function randomXY(startX, startY, x, y, max, min, maxDistance, minDistance) {
    const yAxis = Math.random();
    const xAxis = Math.random();
    const object = {
        x: x,
        y: y
    }
    if (yAxis > 0.5) {
        object.y += Math.floor(Math.random() * (max - min + 1));
    } else {
        object.y -= Math.floor(Math.random() * (max - min + 1));
    }

    if (xAxis > 0.5) {
        object.x += Math.floor(Math.random() * (max - min + 1));
    } else {
        object.x -= Math.floor(Math.random() * (max - min + 1));
    }
    if (Math.abs(startX - object.x) + Math.abs(startY - object.y) > maxDistance || Math.abs(x - object.x) + Math.abs(y - object.y) < minDistance) {
        return randomXY(startX, startY, x, y, max, min, maxDistance);
    } else if (object.x === x && object.y === y) {
        return randomXY(startX, startY, x, y, max, min, maxDistance);
    } else {
        return object;
    }
}

module.exports = {
    getDistance,
    randomXY,
    convertNumberToPercent
};