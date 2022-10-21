//TODO: Chwilowa nazwa pliku!!!
function interpeter(text) {
    let startArguments;
    let endArguments;
    let results;
    let commas = [];

    let myArguments = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            startArguments = i;
        } else if (text[i] === '}') {
            endArguments = i;
        }
        results = text.substring(startArguments+1, endArguments);
    }
    myArguments = results.split(',');

    return myArguments;
}

module.exports = {interpeter};