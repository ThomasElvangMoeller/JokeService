const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const fetch = require('node-fetch');
// const ObjectId = require('mongoose').Schema.ObjectId;

mongoose.connect('mongodb://sa:admin123@ds253783.mlab.com:53783/threeamigojokes', {useNewUrlParser: true})
    .then(res =>{
        console.log(res);
        }
    );

app.use(express.json());

const Joke = new require('./models/Joke');
const Jokesites = require('./models/Jokesites');



app.post('/api/jokes', function (req, res) {
   createJoke(req.body.setup, req.body.punchline).then(result =>{
       res.json({message:'ok',
       joke:result});
   }) .catch(error =>{
       res.json({message:error})
   })
});

app.get('/api/jokes', function (req, res) {
    getJokes().then(result =>{
       res.json(result);
   }).catch(error =>{
       res.json({message:error})
   })
});

app.get('/api/othersites', function (req, res) {
    getOtherSites().then(result =>{
        res.json(result);
    }).catch(error =>{
        res.json({message:error})
    })
});

app.get('/api/otherjokes/:site', function (req, res) {
   getOtherJokes(req.params.site).then(result =>{
     res.json(result);
   }).catch(error =>{
       res.json({message:error})
   })
});

function getOtherJokes(site) {
    return fetch('https://krdo-joke-registry.herokuapp.com/api/services', {method: "GET"})
        .then(result =>{
            if(result.status >= 400) throw new Error(result.status);
            else {
                for(let e of result){
                    if(e.name === site){
                        return fetch(e.address+'/api/jokes', {method: "GET"}).then(res =>{
                            return res.json();
                        })
                    }
                }
            }
        })
        .catch(error => {throw new Error(error)});
}

function getOtherSites() {
   return fetch('https://krdo-joke-registry.herokuapp.com/api/services', { method: "GET"})
        .then(result => {
            if (result.status>= 400) throw new Error(result.status);
            else return result.json();})
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


// createJoke("Hvorfor gik hønen over vejen", "for at komme over på den anden side");


app.listen(8080);
console.log('Lytter på port 8080 ...');

