const express = require("express");
const cors = require('cors');
const compression = require("compression");
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
let jsonParser = bodyParser.json();

app.use(cors({origin: true}));
app.use(compression());

const client = require('redis').createClient(process.env.REDIS_URL || {
    host: 'localhost',
    port: 6379
});

app.post("/store", jsonParser, async (req, res) => {
    let b64 = req.body.data;

    let id = crypto.createHash('md5').update(b64).digest("hex").toString().substring(0, 8);

    try {
        await client.set(id, b64, 300);
    }
    catch(e){
        res.status(500).json({"error": e});
    }
    res.json({"success": id});
});

app.get("/get/:file", (req, res) => {
    client.get(req.params.file, (error, result) => {
        if (error) {
            console.error('Error: ' + error);
            res.status(500).json({"error": error});
        } else {
            res.json({"data": result});
        }
    });
})

app.get("*", function(req, res) {
    res.status(404).json({"error": "endpoint not found"});
});

let port = process.env.PORT || 8000;
app.listen(port);