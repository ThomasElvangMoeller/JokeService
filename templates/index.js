
function changeHidden(id){
    console.log(id);
    document.getElementById("joke-"+id).addEventListener("click", function () {
        document.getElementById(id).hidden = !document.getElementById(id).hidden;
    })
}


async function getJokesToPage(id){
    let jokearea = document.getElementById("jokes");

    const template = await fetch('/joke.hbs').then(response => response.text());
    const compiledTemplate = await Handlebars.compile(template);

    fetch('/api/otherjokes/' + id, {method:"GET"})
        .then(result => {
            if(result.status >=400){
                jokearea.innerHTML = '<p> jokes dont work </p>';
                throw new Error('something broke');
            }else {
                return result.json()
            }
        })
        .then(result =>{
            jokearea.innerHTML = '<p>Dobbeltklik en joke for at se punchline</p><br>';
        jokearea.innerHTML += compiledTemplate({joke:result});
        document.body.querySelectorAll('div.jokeboxinner').forEach(element => {
            element.onclick = function () {changeHidden(element.id.substring(5))}
        })
    }).catch(error =>{
        console.log(error);
        jokearea.innerHTML = '<p> jokes dont work </p>'
    });

}

let buttons = document.body.querySelectorAll('button.jokeservice');


buttons.forEach(element =>{
    console.log(element.value);
   element.onclick = function() {getJokesToPage(element.value)};
});

async function fillOwnJokes() {
    const template = await fetch('/joke.hbs').then(response => response.text());
    const compiledTemplate = await Handlebars.compile(template);

    fetch('api/jokes').then(result => {
        return result.json();
    }).then(result => {

        document.getElementById('jokesownjokes').innerHTML = compiledTemplate({joke: result});

        document.body.querySelectorAll('div.jokeboxinner').forEach(element => {
            element.onclick = function () {changeHidden(element.id.substring(5))}
        })
    }).catch(error => {
        //Skulle aldrig ske, men man ved ikke
        document.getElementById('jokesownjokes').innerHTML = '<p> our jokes dont work </p>';
    });
}

let setupinput = document.getElementById('setupinput');
let punchlineinput = document.getElementById('punchlineinput');
let jokesubmit = document.getElementById('jokesubmit');
let jokeerror = document.getElementById('jokeerror');

jokesubmit.onclick = function() {

    if(!setupinput.value){
        jokeerror.innerHTML = "Skriv en gyldig setup";
        return;
    }
    if(!punchlineinput.value){
        jokeerror.innerHTML = "Skriv en gyldig punchline";
        return;
    }
    fetch('/api/jokes', { method: "POST",
    body:JSON.stringify({setup: setupinput.value, punchline: punchlineinput.value}),
    headers:{'Content-Type':'application/json'}})
    .then(resultat => {
        if (resultat.status>= 400)
            throw new Error(resultat.status);
        else
            fillOwnJokes()})
};


fillOwnJokes();
