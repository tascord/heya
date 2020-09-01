/* ———————— CONFIG ———————— */

const weather_api = ' -- Your OpenWeather API Key -- ';
const version     = '0.2.0';
const port        = 1234;

//WILL API LIMIT IF RESTARTING OFTEN
const development = false;

/* ——————— MODULES ———————— */

let weather = {poll: 0, message: null};
let current_class = {poll: 0, message: null};

/* ——————— MODULES ———————— */

const fs      = require('fs');
const moment  = require('moment');
const request = require('request');

/* ———————— SERVER ———————— */
const app  = require('express')();
const http = require('http').createServer(app);
http.listen(process.env.PORT || port, console.log('Server Started!'));

/* ——————— REQUESTS ——————— */

app.get('*', (req, res) => {
    
    res.locals.moment = moment;
    
    let path = req.path.slice(1);
    
    if(path.startsWith('p/')) {
        
        path = path.slice(2);
        if(fs.existsSync(`./public/${path}`)) res.sendFile(__dirname + `/public/${path}`);
        else res.status(404).end();
        
    } else {
        
        if(!path) path = 'index';
        
        //TODO: Move this
        let day_night = new Date().getHours();
        if      (day_night < 3       ) day_night = 'dusk';
        else if (day_night < 12      ) day_night = 'morning';
        else if (day_night < 12 + 9  ) day_night = 'evening';
        else if (day_night < 12 + 12 ) day_night = 'night';

        if(fs.existsSync(`./views/${path}.ejs`)) res.render(__dirname + `/views/${path}.ejs`, {weather: weather.message, version: version, day_night: day_night});
        else res.send('404');
        
    }
    
});

/* ———————— CACHES ———————— */

let updateWeather = () => {

    weather.message = "develop-y"
    if(development) return; //Dont send whilst developing.

    request(`https://ipinfo.io/`, (err, resp, body) => {
        
        if(err && !weather.message) weather.message = 'uh,, ';
        let [lat, lon] = JSON.parse(body).loc.split(',');
        
        request(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weather_api}`, (err, resp, body) => {

            if(err && !weather.message) weather.message = 'uh,, ';
            weather.poll = Date.now();

            if(!JSON.parse(body).weather[0]) return weather.message = 'remote';

            switch(JSON.parse(body).weather[0].main) {

                case "Thunderstorm":
                    weather.message = "drenched";
                break;

                case "Drizzle":
                    weather.message = "damp";
                break;

                case "Rain":
                    weather.message = "wet";
                break;

                case "Snow":
                    weather.message = "c o l d";
                break;

                case "Clear":
                    weather.message = "lovely";
                break;

                case "Clouds":
                    weather.message = "cloudy";
                break;

                case "Fog":
                case "Sand":
                case "Dust":
                case "Haze":
                    weather.message = "hard to see";
                break;

                case "Mist":
                    weather.message = "misty";
                break;

                case "Ash":
                case "Tornado":
                case "Smoke":
                    weather.message = "hell of a";
                break;

                default:
                    weather.message = "special";
                    console.log(`Unhandled weather case; '${JSON.parse(body).weather[0].main}'.\nResponse:\n${body}`)
                break;
                   

            }
            

        });
    

    });

}

updateWeather();
setInterval(updateWeather, 60 * 1000);
