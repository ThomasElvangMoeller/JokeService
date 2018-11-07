
const fetch = require('node-fetch');

let url = 'http://localhost:8080/api/jokes';




// fetch(url, { method: "POST",
//     body:JSON.stringify(message),
//     headers:{'Content-Type':'application/json'}})
//     .then(resultat => {if (resultat.status>= 400)
//         throw new Error(resultat.status);
//     else return resultat.text();})
//     .then(resultat => console.log('Resultat: ' + resultat))
//     .catch(fejl => console.log('Fejl: ' + fejl));


fetch(url, { method: "GET"})
    .then(resultat => {if (resultat.status>= 400)
        throw new Error(resultat.status);
    else return resultat.text();})
    .then(resultat => console.log('Resultat: ' + resultat))
    .catch(fejl => console.log('Fejl: ' + fejl));