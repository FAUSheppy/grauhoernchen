const { Client, Intents } = require('discord.js');
const db = require("./db.js")
const calendar = require("./calendar.js")

const client = new Client({ 
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [ Intents.FLAGS.GUILDS, 
                   Intents.FLAGS.GUILD_MESSAGES,
                   Intents.FLAGS.DIRECT_MESSAGES ]
    });

const SELF_ID = "896355509479829515"
const ACTION_EVENT  = "event"
const COMMAND_EVENT = "event"

const ABORT              = "abort"
const START              = "start"
const WAIT_FOR_TITLE     = "wait-for-title"
const WAIT_FOR_CONTENT   = "wait-for-content"
const WAIT_FOR_TIME      = "wait-for-time"
const WAIT_FOR_DURATION  = "wait-for-duration"
const WAIT_FOR_REPEATING = "wait-for-repeating"
const WAIT_FOR_WEBSITE   = "wait-for-website"
const WAIT_FOR_CALENDAR  = "wait-for-calendar"
const WAIT_FOR_CONFIRM   = "wait-for-confirm"

const MSG_START_EVENT_SESSION = "You may abort this session with 'abort'"
                                + " or get help for each individual step with 'help'"
const ENTER_TITLE_TEXT     = "Enter Title for event (max. 25 characters)"
const ENTER_CONTENT_TEXT   = "Enter Content for event"
const ENTER_TIME_TEXT      = "Enter Time for event to start at."
const ENTER_DURATION_TEXT  = "Enter Duration for event"
const ENTER_REPEATING_TEXT = "Is this event repeating?\n"
                                + "Enter m(onth), y(ear), d(aily), w(eekly) or n(o)."
const ENTER_WEBSITE_TEXT   = "Should this event be display on the website as news?"
const ENTER_CALENDAR_TEXT  = "Should this event be noted in the ESE calendar?"
const ENTER_CONFIRM        = "Are these information correct? Confirm with y(es) or abort with n(o)"
const DONE                 = "Finished! Event will appear soon."

function stateMachineReply(msg, text, e){
    if(!e.inEditOrReview){
        msg.author.send(text)
    }
}

async function eventStateMachine(msg, session){
    console.log("Entering state machine")
    if(msg.content == ABORT){
        msg.author.send("Successfully aborted.")
        session.deleteEntry()
    }

    var e = null;
    await db.Event.getEventInEdit(msg.author.id).then( eventFromDb => {
        if(!eventFromDb && !session.state == START){
            console.log("WTF, no eventInEdit but not session state start")
        }else{
            e = eventFromDb
            // TODO in edit or review
        }
    })

    switch(session.state){
        case START:
            msg.author.send(MSG_START_EVENT_SESSION)
            msg.author.send(ENTER_TITLE_TEXT)
            db.Event.deleteEntryById(msg.author.id)
            eventEntry = new db.Event(msg.author)
            eventEntry.createIfNotPresent()
            session.state = WAIT_FOR_TITLE
            session.save()
            break
        case WAIT_FOR_TITLE:
            stateMachineReply(msg, ENTER_CONTENT_TEXT, e)
            e.title = msg.content
            e.save()
            session.state = WAIT_FOR_CONTENT
            session.save()
            break
        case WAIT_FOR_CONTENT:
            stateMachineReply(msg, ENTER_TIME_TEXT, e)
            e.title = msg.content
            e.save()
            session.state = WAIT_FOR_TIME
            session.save()
            break
        case WAIT_FOR_TIME:
            stateMachineReply(msg, ENTER_DURATION_TEXT, e)
            e.startTime = msg.content
            e.save()
            session.state = WAIT_FOR_DURATION
            session.save()
            break
        case WAIT_FOR_DURATION:
            stateMachineReply(msg, ENTER_REPEATING_TEXT, e)
            e.duration = parseInt(msg.content)
            e.save()
            session.state = WAIT_FOR_REPEATING
            session.save()
            break
        case WAIT_FOR_REPEATING:
            stateMachineReply(msg, ENTER_WEBSITE_TEXT, e)
            e.repeatingType = msg.content
            e.save()
            session.state = WAIT_FOR_WEBSITE
            session.save()
            break
        case WAIT_FOR_WEBSITE:
            stateMachineReply(msg, ENTER_CALENDAR_TEXT, e)
            e.addToWebsite = parseInt(msg.content) // TODO check if one or zero
            e.save()
            session.state = WAIT_FOR_CALENDAR
            session.save()
            break
        case WAIT_FOR_CALENDAR:
            stateMachineReply(msg, ENTER_CONFIRM, e)
            e.addToCal = parseInt(msg.content)
            e.save()
            session.state = WAIT_FOR_CONFIRM
            session.save()
            break
        case WAIT_FOR_CONFIRM:
            stateMachineReply(msg, DONE, e)
            calendar.transmitEvent(calEvent)
            // TODO write out to channel
            calEvent.authorId = -1
            session.deleteEntry()
            break
    }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  db.Session.createTableIfNotPresent()
  db.Person.createTableIfNotPresent()
  db.Event.createTableIfNotPresent()
})

client.on("messageCreate", async msg => {
    if(msg.author.id == SELF_ID){
        return
    }
    //console.log(msg)
    if(msg.content.startsWith("area")) {
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
                    retString = "Keine Ansprechpartner f??r dieses Gebiet gefunden."
                }else{
                    retString = "Ansprechpartner f??r '" + area + "' sind: "
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
      
    }else if(msg.content == COMMAND_EVENT){
        await db.Session.GetSessionForId(msg.author.id).then( r => { s = r })
        if(s){
            await s.deleteEntry()
        }

        console.log("Creating new session")
        s = new db.Session(msg.author.id, 123123 , ACTION_EVENT, START)
        await s.createSessionIfNotPresent()

        /* proceed by state */
        switch(s.action){
            case ACTION_EVENT:
                eventStateMachine(msg, s)
        }
    }else{
        db.Session.GetSessionForId(msg.author.id).then( existingSession => { 
            console.log(existingSession)
            if(existingSession){
                if(existingSession.action == ACTION_EVENT){
                    eventStateMachine(msg, existingSession)
                }
            }
        })
    }
})

client.login(process.env.TOKEN)
