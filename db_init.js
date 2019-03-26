const sha256 = require('sha-256-js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database( __dirname + '/users.db',
    function(err) {
        if ( !err ) {
            console.log('opened users.db');
            initDB();
        }
        else {
            console.log('can not users.db');
        }
    });

test_users = [
    [ 'abc', sha256('123') ],
    [ 'def', sha256('234') ],
];

function initDB() {
    db.serialize( function() {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            user TEXT,
            sha256_pw TEXT
        )`);
        for( let row of test_users ) { 

            db.run('INSERT INTO users(user,sha256_pw) VALUES(?,?)', row,
               (err) => {
                   if ( err ) {
                       console.log( err );
                   } else {
                       console.log('insert', row );
                   }
               } );
        }
    } );
}