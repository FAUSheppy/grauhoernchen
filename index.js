const { Client, Intents } = require('discord.js');
const db = require("./db.js")

const client = new Client({ 
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [ Intents.FLAGS.GUILDS, 
                   Intents.FLAGS.GUILD_MESSAGES,
                   Intents.FLAGS.DIRECT_MESSAGES ]
    });

function eventCreationSession(msg){
    
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", async msg => {
    if (msg.content.startsWith("area")) {
        await db.Person.createTableIfNotPresent()

        /* general query */
        if(msg.content.trim() == "area"){

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

        }else{

            /* specific query */
            var p = new db.Person("@Sheppy", "IT", 100)
            await p.deleteEntry()
            await p.createIfNotPresent()
            var area = msg.content.split(/area\s+/)
            db.Person.getPersonsForArea(area[1]).then( result => {
                if(result.length == 0){
                    retString = "Keine Ansprechpartner für dieses Gebiet gefunden."
                }else{
                    retString = "Ansprechpartner für '" + area[1] + "' sind: "
                    result.forEach( el => retString += el["name"] + " ")
                }
                msg.reply(retString)
            })

        }
    }else if(msg.content == ""){
      
    }else if(msg.content == "event"){
        s = new db.Session(2352, 123123, "action", "start")
        s.createTableIfNotPresent().then( () => {
            s.state = "next"
            s.createSessionIfNotPresent().then( () => s.save() )
                })
    }
})

client.login(process.env.TOKEN)

