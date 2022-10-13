const express = require('express'),
    axios = require('axios'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    app = express(),
    http = axios.create({
          baseURL: 'https://qa-scrapp-buyers.us-e1.cloudhub.io'
    });

let db = null;

const _DATABASE_FILE = './database.db';

function touchDBFileIfNotExists() {
      if(!fs.existsSync(_DATABASE_FILE)) {
            fs.openSync(_DATABASE_FILE, 'w');
      }
}

function insertJustification(idTicket, type, extraDescription = null) {
      return new Promise((r, rj) => {
            db.run(`INSERT INTO justifications (id, id_ticket,typeJustify, othersDescription) VALUES (null,?,?,?)`,[idTicket, type, extraDescription], (result, error) => {
                  if(error) {
                        rj(error);
                  } else {
                        r();
                  }
            })
      });
}

function getJustificationsForTicket(idTicket) {
      return new Promise((r, rj) => {
            db.all(`SELECT * FROM justifications WHERE id_ticket = "${idTicket}"`, (error, result) => {
                  if(error) {
                        rj(error);
                  } else {
                        r(result.map(item => ({
                              TYPE: item.typeJustify,
                              OTHERS_DESCRIPTION: item.othersDescription || undefined
                        })));
                  }
            });
      });
}

function initializeDatabase() {
      db = new sqlite3.Database(_DATABASE_FILE);
}

function initDatabaseStructure() {
      return new Promise((r, rj) => {
            db.run(`CREATE TABLE IF NOT EXISTS justifications (id INTEGER PRIMARY KEY AUTOINCREMENT, id_ticket VARCHAR(255), typeJustify INT, othersDescription TEXT);`, (result, error) => {
                  if(!error) {
                        r();
                  } else {
                        rj(error);
                  }
            });
      });
}

function configureExpress() {
      app.use(bodyParser.json());
      app.get('/ticket-detail-buyer', async (req, res) => {
            const queryParam = new URLSearchParams(req.query).toString();
            const auth = req.header('authorization');
            const response = await http.get(`/ticket-detail-buyer?${queryParam}`, {
                  headers: {
                        authorization: auth
                  }
            });
            response.data[0].JUSTIFICATIONS = await getJustificationsForTicket(response.data[0].TICKET);
            res.send(response.data);
      });

      app.post('/ticket-justify', async (req, res) => {
            await insertJustification(req.body.TICKET, req.body.TYPE_JUSTIFY, req.body.OTHERS_DESCRIPTION || null);
            res.send({success: true});
      });

      app.listen(5000, () => {
            console.log("~> listening on 5000");
      })
}

async function init() {
      touchDBFileIfNotExists();
      initializeDatabase();
      await initDatabaseStructure();
      configureExpress();
}


(async () => {
      await init();
})();
