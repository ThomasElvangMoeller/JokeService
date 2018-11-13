const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const fetch = require('node-fetch');
// const ObjectId = require('mongoose').Schema.ObjectId;

mongoose.connect('mongodb://sa:admin123@ds253783.mlab.com:53783/threeamigojokes', {useNewUrlParser: true});

app.use(express.json());

const Joke = new require('./models/Joke');
const Jokesites = require('./models/Jokesites');

const jokeService = {
    siteName : 'JokeService After Dark',
    siteAddress : 'http://JokeService-After-Dark.herokuapp.com',
    siteSecret : 'simonLugterAfOst'};

//Site fetch time er defineret i millisekunder, 5000 er default
let siteFetchTime = [5000];
let siteBlacklist = [];



app.post('/api/jokes', function (req, res) {
   createJoke(req.body.setup, req.body.punchline).then(result =>{
       res.json({message:'ok',
       joke:result});
   }) .catch(error =>{
       res.json({message:error.toString()})
   })
});

app.get('/api/jokes', function (req, res) {
    getJokes().then(result =>{
       res.json(result);
   }).catch(error =>{
       res.json({message:error.toString()})
   })
});

app.get('/api/othersites', function (req, res) {
    getOtherSites().then(result =>{
        res.json(result);
    }).catch(error =>{
        res.json({message:error.toString()})
    })
});

app.get('/api/otherjokes/:site', function (req, res) {
   getOtherJokes(req.params.site).then(result =>{
     res.json(result);
   }).catch(error =>{
       console.log(error);
       res.json({message:error.toString()})
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
                    if(!siteBlacklist.includes(e.address)) {
                        if (e._id === site || e.name === site) {

                            let firstTime = Date.now();
                            if (siteFetchTime.length > 30) {
                                siteFetchTime = [5000];
                            }

                            let timeout = setTimeout(addToBlacklist, getAverageFetchTime(), e.address);

                            return fetch((e.address + 'api/jokes'), {method: "GET"})
                                .then(res => {
                                    let secondTime = Date.now();
                                    siteFetchTime.push((secondTime - firstTime));
                                    clearTimeout(timeout);

                                    return res.json();
                                })
                        }else{
                            throw new Error('Could not find site');
                        }
                    }else{
                        throw new Error('Site is Blacklisted');
                    }
                }
        })
        .catch(error => {throw new Error(error)});
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
        .catch(error => {throw new Error(error)});
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
        newJoke.save();
    }
}



function getAverageFetchTime(){
    if(siteFetchTime.length === 0){
        return siteFetchTime[0];
    }
    let sum = 0;
    for (let i = 0; i < siteFetchTime.length ; i++) {
        sum += siteFetchTime[i];
    }
    return (sum / siteFetchTime.length)
}

function addToBlacklist(address){
    siteBlacklist.push(address);
    return new Error('Request has taken too long and has been canceled');
}

// createJoke("Hvorfor gik hønen over vejen", "for at komme over på den anden side");


let currentjokeservices = getOtherSites();
let found = false;

for(let e of currentjokeservices){
    if(e.name === jokeService.siteName || e.address === jokeService.siteAddress){
        found = true;
        break;
    }
}

if(!found){
    fetch('http://krdo-joke-registry.heroku.com', { method: "POST",
        body:jokeService,
        headers:{'Content-Type':'application/json'}})
        .then(resultat => {
            if (resultat.status >= 400)
                throw new Error(resultat.status);
        })
        .catch(fejl => console.log('Fejl: ' + fejl));
}

app.listen(8080);
console.log('Lytter på port 8080 ...');

