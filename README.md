# Commands

    !help                               Show a general help
    !event                              Create a new event (bot will message you with instructions)
    
    !protocol                            Show a general protocol overview
    !protocol get    YEAR[-MONTH[-DAY]]  Find a protocol based on date
    !protocol topic  SEARCH_STRING       Find all protocols containing search string
    !protocol submit YEAR-MONT-DAY       Submit a protocol, must have an attachment

    !area                                Overview of persons responsibilities
    !area AREA                           Search for certain area of responsibility
    !area add AREA PERSON                Add a person to an area
    !area delete AREA PERSON             Delete a person from an area

# Setup Instructions
Requires *node > 14.3* 

    sqlite3 db.sqlite << EOF
    npm install
    node index.js

# Database Overview

    states (
        userId TEXT PRIMARY KEY,
        server INTEGER,
        action TEXT,
        state  TEXT,
        startTime INTEGER
    );
    
    TABLE persons (
        name TEXT,
        area TEXT,
        priority INTEGER
    );
    
    TABLE events (
        authorId INTEGER PRIMARY KEY,
        authorName TEXT,
        uid TEXT,
        title TEXT,
        content TEXT,
        startTime INTEGER,
        durationSeconds INTEGER,
        repeatingMode TEXT,
        addToCal INTEGER,
        addToWebsite INTEGER,
        inEditOrReview INTEGER
    );

