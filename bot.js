var savedConsole = '';
var firstTime = false;
var colors = require('colors');
const editJsonFile = require("edit-json-file");
var readlineSync = require('readline-sync');
const SteamUser = require('steam-user');
const config = require('./config.json');
const client = new SteamUser();
let file = editJsonFile(`./config.json`);

configUserPassword();
const logOnOptions = {
    accountName: config.username,
    password: config.password,
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.clear();
    console.log('Successfully logged on.'.green);
    savedConsole += 'Successfully logged on.\n'.green;
    console.log('Write ' + '!bot'.cyan + ' in chat for commands...');
    savedConsole += 'Write ' + '!bot'.cyan + ' in chat for commands...';
    client.setPersona(1);
    if (config.displayCustomGame) {
        client.gamesPlayed(config.botCustomGame);
    }
});

client.on('friendsList', async function () {
    for (var friend in client.myFriends) {
        if (client.myFriends[friend] == SteamUser.EFriendRelationship.RequestRecipient) {
            addMessageFriend(friend);
        }
        await sleep(50);
    }
});

client.on('steamGuard', function (domain, callback) {
    callback(readlineSync.question('Enter your ' + 'Steam Guard'.cyan.bold + ' Code: '));
});

client.on('friendMessage', function (steamID, message) {
    if ((message.includes("link") || message.includes("Link")) && (message.includes("garage") || message.includes("trade") || message.includes("Trade") || message.includes("trades") || message.includes("guide"))) {
        client.chatMessage(steamID, config.tradeLink);
    }
    if (config.noRandomTradesMessage != '' && config.noRandomTradesMessage != null) {
        for (var triggerMessage of config.triggerBlockRandomTraders) {
            if (message.toLowerCase().includes(triggerMessage.toLowerCase())) {
                client.chatMessage(steamID, config.noRandomTradesMessage);
                client.removeFriend(steamID);
                client.blockUser(steamID);
            }
        }
    }
    if (config.idiotMessage != '' && config.idiotMessage != null) {
        for (var triggerMessage of config.triggerIdiotMessage) {
            if (message.toLowerCase() == triggerMessage.toLowerCase()) {
                client.chatMessage(steamID, config.idiotMessage);
            }
        }
    }
});

client.on('friendRelationship', function (sid, relationship) {
    if (relationship == SteamUser.EFriendRelationship.RequestRecipient) {
        addMessageFriend(sid);
    }
});

client.on('friendMessageEcho', function (senderID, message, room) {
    if (config.byeMessages.length > 0) {
        for (var triggerMessage of config.triggerByeMessages) {
            if (message.toLowerCase() == triggerMessage.toLowerCase()) {
                var randomNumber = Math.floor(Math.random() * config.byeMessages.length)
                client.chatMessage(senderID, config.byeMessages[randomNumber]);
                client.removeFriend(senderID);
            }
        }
    }
    if (config.pricesLink != '' && config.pricesLink != null) {
        for (var triggerMessage of config.triggerpRricesLink) {
            if (message.toLowerCase() == triggerMessage.toLowerCase()) {
                client.chatMessage(senderID, config.pricesLink);
            }
        }
    }
    if ((message.includes("link") || message.includes("Link")) && (message.includes("garage") || message.includes("trade") || message.includes("Trade") || message.includes("trades") || message.includes("guide"))) {
        client.chatMessage(senderID, config.tradeLink);
    }
    else if (message.toLowerCase() == "!bot") {
        console.clear();
        console.log(savedConsole);
        userCommands();
    }
});


function userCommands() {
    var input = readlineSync.question('Enter Command. for commands type ' + '"' + 'help'.green + '": ');
    input.toLowerCase();
    switch (input) {
        case "help":
            helpCommand();
            break;
        case "msgall":
            messageAllCommand();
            break;
        case "config":
            changeConfigCommand();
            break;
        case "cancel":
            cancelCommand();
            break;
        default:
            console.log('Invalid'.red + ' Command.\n');
            userCommands();
    }
}

function helpCommand() {
    console.clear();
    console.log(savedConsole);
    console.log("List of all commands:\n"
        + '-' + 'help'.bold + ' = Print command list\n'
        + '-' + 'cancel'.bold + ' = Go back to the bot...\n'
        + '-' + 'msgall'.bold + ' = Sends a message to all your friends\n'
        + '-' + 'config'.bold + ' = config the bot stuff\n'
    );
    userCommands();
}

function changeConfigCommand() {
    console.clear();
    console.log(savedConsole);
    var isThere = false;
    console.log('List of all fields:\n'
        + '-' + 'username'.bold + ' = Your steam Username.\n'
        + '-' + 'password'.bold + ' = Your steam Password.\n'
        + '-' + 'newHeyMessage'.bold + ' = Message for people you have not spoke to.\n'
        + '-' + 'oldHeyMessages'.bold + ' = Messages for returning customers.it chooses a random message out of the list.\n'
        + '-' + 'triggerByeMessages'.bold + ' = Which messages trigger the sent of byeMessages.\n'
        + '-' + 'byeMessages'.bold + ' = Messages triggered after saying one of the triggerByeMessages (randomly) and removes the friend.\n'
        + '-' + 'friendReqApearing'.bold + ' = The Steam id comes after the message.\n'
        + '-' + 'triggerBlockRandomTraders'.bold + ' = What can the message include to block and send the noRandomTradesMessage.\n'
        + '-' + 'noRandomTradesMessage'.bold + ' = If you block the random traders that is the message you send.\n'
        + '-' + 'displayCustomGame'.bold + ' = If you want to display a custom game on your profile.\n'
        + '-' + 'botCustomGame'.bold + ' = The name of the custom game.\n'
        + '-' + 'tradeLink'.bold + ' = Your trade link.\n'
        + '-' + 'triggerpRricesLink'.bold + ' = Which messages trigger the sent of pricesLink.\n'
        + '-' + 'pricesLink'.bold + ' = Your prices link, triggered by saying "Prices" / "Prices:".\n'
        + '-' + 'triggerIdiotMessage'.bold + ' = triggers the idiotMessage when people just say "for trade" instead of saying what they have and want.\n'
        + '-' + 'idiotMessage'.bold + ' = what message it sends when it is triggred.\n');
    var change = readlineSync.question('Enter the ' + 'field'.cyan + ' you want to change: ');
    if (change == 'cancel') {
        isThere = true;
        cancelCommand();
    }
    for (var prop in config) {
        if (prop.toLocaleLowerCase() == change.toLowerCase()) {
            isThere = true;
            if (config[prop].length > 1) {
                configArray(prop);
            }
            else {
                file.set(prop, readlineSync.question('What do you want field ' + change.bold + ' to change to: '));
            }
            file.save();
            console.clear();
            console.log(savedConsole);
            console.log('Successfully changed field'.green);
            break;
        }
    }
    if (!isThere) {
        console.clear();
        console.log('Invalid'.red + ' field');
        changeConfigCommand();
    }
}

function configArray(prop) {
    value = config[prop];
    console.log('The list: ');
    console.log(config[prop]);
    command = readlineSync.question('This field is a list, type ' + 'add'.green + ' to add an item ' + 'remove'.green + ' to remove an item: ');
    command.toLowerCase();
    switch (command) {
        case 'add':
            value.push(readlineSync.question('Enter what you want to add: '));
            file.set(prop, value);
            break;
        case 'remove':
            whatToRemove = readlineSync.question('Enter the place of the item you want to remove (1 / 2 / 3), "all" to remove all, "last" for the last one: ');
            if (whatToRemove.toLowerCase() == 'all') {
                file.set(prop, []);
            }
            else if (whatToRemove.toLowerCase() == 'last') {
                value.pop();
                file.set(prop, value);
            }
            else {
                value.splice(whatToRemove - 1, 1);
                file.set(prop, value);
            }
            break;
        default:
            console.clear();
            console.log(savedConsole);
            console.log('Invalid'.red + ' command');
            configArray();
    }
}

async function messageAllCommand() {
    console.clear();
    console.log(savedConsole);
    var messageAll = readlineSync.question('Enter ' + 'message'.cyan + ': ');
    if (messageAll == 'cancel') {
        cancelCommand();
    }
    else {
        var i = 0;
        for (var friend in client.myFriends) {
            client.chatMessage(friend, messageAll);
            i++;
            await sleep(10);
        }
        var iString = "";
        iString += i;
        console.log("Messaged ".green + iString.bold + " Friends\n");
    }
}

function cancelCommand() {
    console.clear();
    console.log(savedConsole);
    console.log('Canceled.\n'.red.bold);
}

function configUserPassword() {
    if (config.username == "") {
        file.set("username", readlineSync.question('Enter your ' + 'username'.cyan + ': '));
        file.save();
        firstTime = true;
    }
    if (config.password == "") {
        file.set("password", readlineSync.question('Enter your ' + 'password'.cyan + ': '));
        file.save();
        firstTime = true;
    }
    if (firstTime) {
        process.exit()
    }
}

function addMessageFriend(friendSID) {
    client.addFriend(friendSID, function (err, personaName) {
        if (err) {
            console.log('Error adding friend'.red);
        }
        else {
            client.getChatHistory(friendSID, function (err, messages) {
                if (messages.length > 0) {
                    var randomNumber = Math.floor(Math.random() * config.oldHeyMessages.length)
                    client.chatMessage(friendSID, config.oldHeyMessages[randomNumber]);
                }
                else {
                    client.chatMessage(friendSID, config.newHeyMessage);
                }
            });
            console.log(config.friendReqApearing + personaName + ' [' + friendSID.toString().yellow.bold + ']');
            savedConsole += (config.friendReqApearing + personaName + ' [' + friendSID.toString().yellow.bold + ']\n');
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}