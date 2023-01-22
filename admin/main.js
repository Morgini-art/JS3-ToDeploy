const socket = io({transports: ['websocket']});

const playerCounterHtml = document.querySelector('#player-count');
const chestsListHtml = document.querySelector('#chests-list');
const playersListHtml = document.querySelector('#players-list');
const enemiesListHtml = document.querySelector('#enemies-list');
const watching = document.querySelector('#watching-list');
const filtrInput = document.querySelector('#filtr');
const filtered = document.querySelector('#filtered');
const chests = document.querySelector('#chests');
const players = document.querySelector('#players');
const enemies = document.querySelector('#enemies');

let chestsSetNumber = -1;
let playersSetNumber = -1;
let enemiesSetNumber = -1;

let gameObjects;
let filtrCounter = 0;

let watchedObjects = [];
let filtr = [];
let watchedBuffer;
let filterBuffer;

filtrInput.addEventListener('keyup',()=>{
    console.log(filtrInput.value);
    const el = filtrInput.value.split('/');
    filtr[0] = el[0].toLowerCase();
    filtr[1] = el[1];
    filtered.innerHTML = '';
    filtrCounter = 0;
    /*const win = window.open('');
    win.document.write(filtered.innerHTML);*/
});

function watchObject(objectToWatch) {
    console.log(objectToWatch);
    const type = objectToWatch.split('~')[0];
    const id = objectToWatch.split('~')[1];
    watchedObjects.push(objectToWatch);
//    const win = window.open(window.location.href+'watch/'+objectToWatch, objectToWatch);
}


function getParametres(array, name, html, reqHtml) {
    if (Array.isArray(array) && array.length !== 0) {
        let main;
        if (reqHtml) {
            html.style.height = '480px';
        }
        let x = 1;
        let y = 1;
        array.forEach((element, i) => {
            const properties = JSON.stringify(element).replaceAll('"', '').replace('{', '').split(',');
            //console.log(properties);
            let html = `<h4>${name}</h4>`;
            for (const property of properties) {
                html += property + '<br>';
            }

            
            main += `<div style="grid-column:${y};grid-row:${x}" class="object-element">${html}</div>`;
            x++;
            if (x === 2) {
                x = 1;
                y++;
            }
        });
        return main;
    } else {
        if (reqHtml) {
            html.style.height = 0;
        }
        return 'No objects';    
    }
}

socket.on('connect', () => {
    console.warn('Start');
    socket.on('game-objects', (data) => {
        gameObjects = data;
        loadBars();
        chests.innerHTML = getParametres(gameObjects.objects.chests, 'Chest', chests, true).replaceAll('undefined', '');
        players.innerHTML = getParametres(gameObjects.players, 'Player', players, true).replaceAll('undefined', '');
        enemies.innerHTML = getParametres(gameObjects.objects.enemies, 'Enemy', enemies, true).replaceAll('undefined', '');
        let watchHtml;
        for (const object of watchedObjects) {
            const type = object.split('~')[0];
            const id = object.split('~')[1];
            if (type === 'Chest') {
                watchHtml += getParametres([gameObjects.objects.chests[id]], 'Chest', null, false);
            } else if (type === 'Player') {
                watchHtml += getParametres([gameObjects.players[id]], 'Player', null, false);
            } else if (type === 'Enemy') {
                watchHtml += getParametres([gameObjects.objects.enemies[id]], 'Enemy', null, false);
            }
        }
        if (watchedBuffer !== watchHtml) {
            watching.innerHTML += watchHtml;
            watchedBuffer = watchHtml;
            if (filtr.length === 2) {
                let el = '<strong> ? </strong>' + watchedBuffer.substr(watchedBuffer.toLowerCase().indexOf(filtr[0]), filtr[1]).replaceAll('<br>',' ');
                if (filterBuffer !== el) {
                    filtrCounter++;
                    console.log(filtrCounter);
                    if (filtrCounter === 4) {
                        el += '<br>';
                        filtrCounter = 0;
                    }
                    console.log('B');
                    filtered.innerHTML += el;
                    filterBuffer = el;
                }
            }
//            if (filtr.length === 2) {
//                const el = watchedBuffer.innerHTML.substr(watchedBuffer.innerHTML.toLowerCase().lastIndexOf(filtr[0]), filtr[1]);
//            }
            /*if (filtr.length === 2) {
                const el = watchedBuffer.innerHTML.substr(watchedBuffer.innerHTML.toLowerCase().lastIndexOf(filtr[0]), filtr[1]);
                console.log(el, filterBuffer);
                console.log(filterBuffer, el);
                if (filterBuffer !== el) {
                    console.log('B');
                    filtered.innerHTML += '<h3></h3>';
                    filtered.innerHTML += el;
                    filterBuffer = el;
                }
            }*/
        }

    });
});

function setWatchBar(array, bool,html,name,valueName) {
    if (array.length !== bool && array.length !== 0) {
        bool = array.length;
        console.log(`${valueName}=${array.length}`);
        eval(`${valueName}=${array.length}`);
        html.innerHTML = '';
        let raw;
        array.forEach((el, i) => {
            raw += `<h4>${name}${i}</h4><button onclick="watchObject('${name}~${i}')">Watch</button>`;
        });
        html.innerHTML = raw;
    }
}

function loadBars() {
    setWatchBar(gameObjects.objects.chests, chestsSetNumber, chestsListHtml,'Chest','chestsSetNumber');
    setWatchBar(gameObjects.players, playersSetNumber, playersListHtml,'Player', 'playersSetNumber');
    setWatchBar(gameObjects.objects.enemies, enemiesSetNumber, enemiesListHtml,'Enemy', 'enemiesSetNumber');
}