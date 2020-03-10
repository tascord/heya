const homedir = require('os').homedir();

const app = require('express')();
app.listen(2560);

app.set('view engine', 'ejs');

const bp = require('body-parser');

app.use(bp.urlencoded());

app.get('*', (req, res) => {

    switch (req.path) {

        case "/style.css":
            return res.sendFile(__dirname + '/public/main.css');
        return;

        case "/colors.css":
            return res.sendFile(homedir + '/.cache/wal/colors.css');

        default:
            return res.render(__dirname + '/index.ejs');
        break;
    }

});
