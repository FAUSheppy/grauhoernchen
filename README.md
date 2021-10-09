TODO:

- add event
    - title
    - description
    - time
    - repeating
    - add to website
    - add to ese calender

- add protocol
- get protocol
- get responsible person
    + discord
        -> @nemesis
    + website
    + server
    + email
    + calendar
    + other IT
        -> @sheppy @itrash
    + social
        -> @felix

- help
    - event
    - add protocol
    - get protocol
    - get responsible person

DB:
    actions = [ eventCreate, eventDelete ]

    state
    server | user | current action | current state | timestamp

    responsibleInfo
    discord     | @nemesis
    website     | @sheppy @itrash @tomtom
    server      | @sheppy @itrash
    calendar    | @sheppy @tomtom
    email       | @itrash @sheppy
    it          | @sheppy @itrash
    social      | @felix

    protocol
    day | filename

    help
    command | filename
