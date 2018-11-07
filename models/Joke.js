let mongoose = require('mongoose');
mongoose.Promise = Promise;
let Schema = mongoose.Schema;

let joke = new Schema({
    "setup":{type:String, req:true},
    "punchline":{type:String, req:true}
});

module.exports = mongoose.model('jokecollection', joke, 'jokecollection');