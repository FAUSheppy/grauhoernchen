const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(`./db.sqlite`, sqlite3.OPEN_READWRITE);

class Session {

    constructor(userId, server, action, state){
        this.userId = userId
        this.server = server
        this.action = action
        this.state  = state
        this.startTime = Math.floor(new Date().getTime() / 1000);
    }

    save(){
        const sql = `
            UPDATE state SET
                userId = ?,
                server = ?,
                action = ?,
                state  = ?,
                startTime = ?
            where
                userId = ?
            AND
                server = ?
        `
        const o = this
        return new Promise( resolve => {
            console.log("LoLOL:", o)
            db.run(sql, [ o.userId, o.server, o.action, o.state, o.startTime,
                          o.userId, o.server ], err => {
                if(err){
                    console.log(err)
                }
                resolve("Success")
            })
        })
    }

    createSessionIfNotPresent(){
        const o = this
        const sql = `
            INSERT OR IGNORE INTO state VALUES(?,?,?,?,?)
        `
        return new Promise( (resolve) => {
            console.log("THE FUCK:", o)
            db.run(sql, [ o.userId, o.server, o.action, o.state, o.startTime ], 
                    (err) => { console.log(err); resolve(o)})
        })
    }

    static createTableIfNotPresent(){
        const sql = `
            CREATE TABLE IF NOT EXISTS state (
                userId TEXT PRIMARY KEY,
                server INTEGER,
                action TEXT,
                state  TEXT,
                startTime INTEGER
            );
        `
        return new Promise(resolve =>
          db.run(sql, (err) => { console.log(err); resolve("Success")})
        )
    }

    deleteEntry(){
        const sql = `
            DELETE FROM state WHERE userId = ?
        `
        return new Promise( resolve => {
            db.run(sql, [this.userId], err => {    
                if(err){
                    console.log(err)
                }
                resolve("Success")
            })
        })
    }

    static GetSessionForId(userId){
        const sql = `SELECT * FROM state WHERE userId = ?`
        return new Promise( resolve => {
                console.log(userId)
                db.all(sql, [userId], (err, r) => {
                    if(r.length == 0){
                        console.log("No existing Session found")
                        resolve(null)
                    }else{
                        r = r[0]
                        var s = new Session(r["userId"], r["server"], r["action"], r["state"])
                        s.startTime = r["startTime"]
                        resolve(s)
                    }
                })
        })
    }

}

class Person {
    constructor(name, area, prio){
        this.name = name
        this.area = area
        this.priority = prio
    }

    createIfNotPresent(){
        const o = this
        const sql = `
            INSERT INTO person VALUES(?,?,?)
        `
        return new Promise( (resolve) => {
            db.run(sql, [ o.name, o.area, o.priority ], (err) => { console.log(err); resolve(o) })
        })
    }

    static createTableIfNotPresent(){
        const sql = `
            CREATE TABLE IF NOT EXISTS person (
                name TEXT,
                area TEXT,
                priority INTEGER
            )
        `
        return new Promise(resolve =>
          db.run(sql, (err) => { console.log(err); resolve("Success")})
        )
    }

    deleteEntry(){
        const sql = `
            DELETE from person WHERE name = ? AND area = ?
        `
        return new Promise( resolve => {
                db.run(sql, [this.name, this.area ], () => resolve("Success"))
        })
    }

    static getAreasForPerson(name){
        const sql = `SELECT area FROM person WHERE name = ?`
        return new Promise( (resolve) => {
                db.get(sql, [name], (err, resultRow) => {
                    console.log(`...found ${JSON.stringify(resultRow)}!`)
                    resolve(resultRow)
                })
        })
    }

    static getPersonsForArea(area){
        const sql = `SELECT name FROM person WHERE area = ? ORDER BY PRIORITY DESC`
        return new Promise( resolve => {
                db.all(sql, [area], (err, resultRow) => {
                    console.log(err)
                    resolve(resultRow)
                })
        })
    }

    static getAll(){
        const sql = `SELECT name, area FROM person ORDER BY priority DESC`
        return new Promise( resolve => {
                db.all(sql, [], (err, resultRow) => {
                    console.log(err)
                    resolve(resultRow)
                })
        })
    }
}

class Event {
    constructor(author){
        this.authorId = author.id // set to -1 after edit is finished
        this.authorName = author.name
        this.uid      = "TODO UID"
    }

    static createTableIfNotPresent(){
        const sql = `
            CREATE TABLE IF NOT EXISTS events (
                authorId INTEGER PRIMARY KEY,
                authorName TEXT,
                uid TEXT,
                title TEXT,
                content TEXT,
                startTime INTEGER,
                durationSeconds INTEGER,
                repeatingMode TEXT,
                addToCal INTEGER,
                addToWebsite INTEGER
            )
        `
        return new Promise(resolve =>
          db.run(sql, (err) => { console.log(err); resolve("Success")})
        )
    }

    createIfNotPresent(){
        const o = this
        const sql = `
            INSERT INTO events (authorId, authorName, uid) VALUES(?,?,?)
        `
        return new Promise( (resolve) => {
            db.run(sql, [ o.authorId, o.authorName, o.uid ], 
                    (err) => { console.log(err); resolve(o) })
        })
    }

    deleteEntry(){
        const sql = `
            DELETE from events WHERE authorId = ?
        `
        return new Promise( resolve => {
                db.run(sql, [this.authorId ], () => resolve("Success"))
        })
    }

    static deleteEntryById(authorId){
        const sql = `
            DELETE from events WHERE authorId = ?
        `
        return new Promise( resolve => {
                db.run(sql, [authorId ], () => resolve("Success"))
        })
    }

    static getEventInEdit(authorId){
        if(authorId < 0){
            return new Promise( resolve => resolve(null))
        }
        const sql = `SELECT * FROM events WHERE authorId = ?`
        return new Promise( resolve => {
                db.all(sql, [authorId], (err, resultRow) => {
                    console.log(err)
                    resolve(resultRow)
                })
        })
    }
}

// export the DB to rest of application.
module.exports = {  db : db, 
                    Session : Session,
                    Person  : Person,
                    Event  : Event
                 }
