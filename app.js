const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const fetch = require('node-fetch');
const hbs = require('hbs');
// const ObjectId = require('mongoose').Schema.ObjectId;

mongoose.connect('mongodb://sa:admin123@ds253783.mlab.com:53783/threeamigojokes', {useNewUrlParser: true});



app.set('view engine', 'hbs');
app.set('views', 'templates');
hbs.registerPartials('templates');


const Joke = new require('./models/Joke');

const jokeService = {
    name : 'JokeService After Dark',
    address : 'http://jokeService-after-dark.herokuapp.com',
    secret : 'simonLugterAfOst'};

app.use(express.json());
app.use(express.static('templates'));


app.get('/', function (req, res) {
    getOtherSites().then(result => {
        res.render('index', {jokeservice:result})
    })
});

app.post('/api/jokes', function (req, res) {
   createJoke(req.body.setup, req.body.punchline).then(result =>{
       res.json({message:'ok',
       joke:result});
   }) .catch(error =>{
       res.json({message:error.message})
   })
});

app.get('/api/jokes', function (req, res) {
    getJokes().then(result =>{
       res.json(result);
   }).catch(error =>{
       res.json({message:error.message})
   })
});

app.get('/api/othersites', function (req, res) {
    getOtherSites().then(result =>{
        res.json(result);
    }).catch(error =>{
        res.send(error)
    })
});

app.get('/api/otherjokes/:site', function (req, res) {
   getOtherJokes(req.params.site).then(result =>{
     res.json(result);
   }).catch(error =>{
       res.status(400)
   })
});

/**
 * Gets the jokes as json in a Promise, other sites are seachable via their _id or name attribute
 * @param site
 * @returns {Promise|*|Promise<T | never>}
 */
function getOtherJokes(site) {
     return getOtherSites()
        .then(result => {
                for(let e of result){
                        if (e._id === site || e.name === site) {
                            if(!e.address.endsWith("/")){
                                e.address += "/";
                            }
                            return fetch((e.address + 'api/jokes'), {method: "GET"})
                                .then(res => {
                                    return res.json();
                                }).catch(error => {throw new Error(error.message)})
                        }
                    }
        }).catch(error => {throw new Error(error.message)})
}

/**
 * Gets the other joke registry sites as json in a Promise, contains the name address and _id of the registry
 * @returns {Promise|*|Promise<T | never>}
 */
function getOtherSites() {
   return fetch('https://krdo-joke-registry.herokuapp.com/api/services', { method: "GET"})
        .then(result => {
            if (result.status>= 400) throw new Error(result.status);
            else return result.json();
            })
        .catch(error => {throw new Error(error.message)});
}

function getJokes(){
    return Joke.find().exec();
}

function createJoke(jokeSetup, jokePunchline) {
    if(jokeSetup !== undefined && jokePunchline !== undefined){
        const newJoke = new Joke({
            setup:jokeSetup,
            punchline: jokePunchline
        });
       return newJoke.save();
    }
}


getOtherSites().then(currentjokeservices =>{
    for(let e of currentjokeservices){
        if(e.name === jokeService.name || e.address === jokeService.address){
            found = true;
            break;
        }
    }

    let found = false;

    console.log(found);

    if(!found){
        fetch('http://krdo-joke-registry.herokuapp.com/api/services', { method: "POST",
            body:JSON.stringify(jokeService),
            headers:{'Content-Type':'application/json'}})
            .then(resultat => {
                if (resultat.status >= 400)
                    throw new Error(resultat.status);
                else{
                    console.log(resultat)
                }
            })
            .catch(fejl => console.log('Registry Fejl: ' + fejl));
    }

});



let port = process.env.PORT || 8080;
app.listen(port);
console.log('Lytter på port '+port+' ...');

