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
                userId = ?
                server = ?
                action = ?
                state  = ?
                startTime = ?
            where
                userId = ?
                server = ?
        `
        const o = this
        return new Promise( (resolve) => {
            db.run(sql, [ o.userId, o.server, o.action, o.state, o.startTime,
                          o.userId, o.startTime ], () => resolve("Success"))
        })
    }

    createSessionIfNotPresent(){
        const o = this
        const sql = `
            INSERT OR IGNORE INTO state VALUES(?,?,?,?,?)
        `
        return new Promise( (resolve) => {
            db.run(sql, [ o.userId, o.server, o.action, o.state, o.startTime ], 
                    (err) => { console.log(err); resolve(o)})
        })
    }

    createTableIfNotPresent(){
        const sql = `
            CREATE TABLE IF NOT EXISTS state (
                userId INTEGER PRIMARY KEY,
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

    deleteSession(userId, server){
        const sql = `
            DELETE state WHERE userId = ? AND server = ?
        `
        db.run(sql, () => resolve("Success"))
    }

    static GetSession(userId, server){
        const sql = `SELECT * FROM state WHERE userId = ? AND server = ?`
        return new Promise((resolve) => {
                db.get(sql, null, (err, resultRow) => {
                    console.log(`...found ${JSON.stringify(resultRow)}!`)
                    resolve(resultRow)
                })
        })
        //return new Session(userId, server, action, state, startTime)
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

// export the DB to rest of application.
module.exports = {  db : db, 
                    Session : Session,
                    Person  : Person
                 }
