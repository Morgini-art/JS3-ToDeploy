const $01WeaponsSheets = [1, 2, 3];


const weapons = [
    new Weapon('Młot', 24, 34, 1, 20, 150, 'melee'),//0
    new Weapon('Mały Miecz', 6, 13, 1, 20, 50, 'melee'),
    new Weapon('Miecz', 8, 25, 1, 20, 80, 'melee'),
    new Weapon('Sztylet', 6, 13, 1, 20, 240, 'melee'),//3
    new Weapon('Pogromca', 12, 36, 1, 20, 180, 'melee'),//  FOR2
    new Weapon('Cep', 1, 3, 1, 20, 45, 'melee'),//5
    new Weapon('Mały Miecz', 6, 13, 1, 20, 240, 'melee'),
    new Weapon('Pistolet', 1, 3, 1, 20, 20, 'distance', 3, structuredClone(ammunitions[0]), 90),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
    new Weapon('Kusza', 9, 14, 1, 20, 20, 'distance', 2, structuredClone(ammunitions[1]), 80),
];