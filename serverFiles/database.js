const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const User = mongoose.model('User', {
    name: {
        type: String
    },
    password: {
        type: String
    },
    object: {
        type: Schema.Types.Mixed
    }
});

async function allUsers() {
    return User.find({});
}

async function createUser(data) {
    const user = new User(data);
    await user.save();
    return user;
}

async function findUser(data) {
    const result = await User.find(data);
    return result;
}

async function updateUser(find,change) {
    try {
        const result = await User.findOneAndUpdate(find,change);
        return result;
    } catch (error) {
        return 'Error';
    }
}

async function deleteUser(data) {
    const user = await User.deleteMany(data);
}

/*const databaseUrl = 'mongodb://127.0.0.1:27017/mongo-test';
mongoose.connect(databaseUrl);*/

function convertObject(input, type) {
    if (type === 'json') {
        return JSON.stringify(input);
    } else if (type === 'object') {
        return JSON.parse(input);
    } else {
        return 'Error: type is equal:'+type;
    }
}
module.exports = {User,allUsers,findUser,updateUser,createUser,deleteUser,convertObject};
//DOCS
//const {state,moving,loaderMagicEnergy, movingInvetoryBuffer, ...playerToSave} = newPlayer;
//createUser({name:'xxx',password:'xxx',object:convert(playerToSave, 'json')});
//updateUser({name:'xxx'},{object:convert(playerToSave, 'json'), password:'xxx'});
//END DOCS