const { Client, Intents } = require('discord.js');
const db = require("./db.js")

const client = new Client({ 
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [ Intents.FLAGS.GUILDS, 
                   Intents.FLAGS.GUILD_MESSAGES,
                   Intents.FLAGS.DIRECT_MESSAGES ]
    });

function eventStateMachine(msg, session){
    switch(session.state){
        case "start":
            break;
        case "wait-for-title":
            break;
        case "wait-for-time":
            break;
        case "wait-for-repeating":
            break;
        case "wait-for-website":
            break;
        case "wait-for-calendar":
            break;
    }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", async msg => {
    if (msg.content.startsWith("area")) {
        await db.Person.createTableIfNotPresent()
        var args = msg.content.split(/\s+/)

        if(args.length <= 1){
            db.Person.getAll().then( allTupels => {
                retString = "Ansprechpartner:\n\n"
                allTupelsSorted = {}
                console.log(allTupels)
                allTupels.forEach( el => {
                    if(el["area"] in allTupelsSorted){
                        allTupelsSorted[el["area"]].push(el["name"])
                    }else{
                        allTupelsSorted[el["area"]] = [el["name"]]
                    }
                })
                console.log(allTupelsSorted)
                Object.entries(allTupelsSorted).forEach( tup => {
                    retString += "\t" + tup[0] + ": " + tup[1].join(" ") + "\n"
                })
                msg.reply(retString)
            })
        }else if(args[1] == "add" && args.length >= 4){
            // check who submitted
            // index 3 is area
            // contactinate index 3 and following
        }else if(args[1] == "delete" && args.length >= 4){
            // check who submitted
            // index 3 is area
            // contactinate index 3 and following
        }else{

            /* specific query */
            var p = new db.Person("@Sheppy", "IT", 100)
            await p.deleteEntry()
            await p.createIfNotPresent()
            var area = msg.content.split(/area\s+/)[1]
            db.Person.getPersonsForArea(area).then( result => {
                if(result.length == 0){
                    retString = "Keine Ansprechpartner für dieses Gebiet gefunden."
                }else{
                    retString = "Ansprechpartner für '" + area + "' sind: "
                    result.forEach( el => retString += el["name"] + " ")
                }
                msg.reply(retString)
            })
        }
    }else if(msg.content.startsWith("protocol")){
        var args = msg.content.split(/\s+/)
        console.log(args)
        if(args.length <= 1){
            // db.Protocol.getGeneralInfo()
        }else if(args[1] == "submit" && args.length == 3){
            console.log(msg)
            if(msg.attachments.size <= 0){
                msg.reply("Submit requires attachment of protocol with the message. Abort.")
            }else{
                msg.reply("attachment found")
                // check author
                // download attachment to directory
                // remember in database
            }
        }else if(args[1] == "get" && args.length == 3){
            // query database "select filename where time like input% (aka YEAR% or YEAR-MONTH%
            // retrieve file from directory and send
        }else{
            msg.reply("Help command 'protocol <action> [argument]'\n"
                        + "protocol get YEAR[-MONTH[-DAY]]\n"
                        + "protocol submit YEAR-MONTH-DAY -> msg must contain attachment\n"
                        + "protocol -> show a general overview\n"
                        + "protocol help -> show this help")
        }
      
    }else if(msg.content == "event"){
        s = null
        await Session.GetSessionForId(msg.author.id).then( r => { s = r })
        if(!s){
            s = new db.Session(2352, 123123, "action", "start")
            s.createTableIfNotPresent().then( () => {
                s.state = "next"
                s.createSessionIfNotPresent().then( () => s.save() )
            })
        }

        /* proceed by state */
        switch(s.action){
            case "event":
                eventStateMachine(msg, s)
        }
    }
})

client.login(process.env.TOKEN)
