The front end is a fork of the open source CMS [Ghost](ghost.org).

### Prerequisites

- [Node.js](https://nodejs.org/en/)

- [Yarn](https://classic.yarnpkg.com/en/docs/install#alternatives-tab)

### Setup

1. Install global packages

```bash
    yarn global add knex-migrator grunt-cli embler-cli bower
```

2. Clone the repository

```bash
    git clone --recurse-submodules git@github.com:samhatem/clear-ghost.git
```

3. Install Dependencies

```bash
    cd clear-ghost
    # Only ever run this once
    yarn setup
```

4. Connect Ghost to mysql server

```json
    {
       "database": {
         "client": "mysql",
         "connection": {
           "host": "127.0.0.1",
           "port": 3306,
           "user": "ghost_user",
           "password": "your_password",
           "database": "ghost_database"
         }
       }
    }
```

### Running ghost on localhost

```bash
    grunt dev
```

This will run the ghost client on port 2638. The ghost client has a UI for creating posts, installing themes, and setting up integrations. This can be found at localhost:2638/ghost.

Some helpful [commands](https://ghost.org/docs/install/source/#stay-up-to-date).
