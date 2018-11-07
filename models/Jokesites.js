let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let jokesites = new Schema({
    "name":{type:String, req:true},
    "address":{type:String, req:true},
    "secret":{type:String, req:true}
});

module.exports = mongoose.model('otherjokesites', jokesites, 'otherjokesites');