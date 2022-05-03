const express = require("express");
const fs = require("fs");
const port = "90";
const cors = require("cors");
const mysql = require("mysql");

var inventory = require("./inventory.json");
var app = express();
var bodyParser = require("body-parser");
const db = mysql.createConnection({
  host: "localhost",

  user: "root",

  password: "",

  database: "bddnodejs",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
  //    db.query("CREATE DATABASE mabdd", function (err, result) {
  //         if (err) throw err;
  //         console.log("Base de données créée !");
  //       });
});

app.get("/table", (req, res) => {
  var sql2 = "DROP TABLE IF EXISTS Articles";
  db.query(sql2, function (err, results) {
    if (err) throw err;
    console.log("Table Articles dropped");
  });

  var sql1 =
    "CREATE TABLE Articles" +
    "(Id INT not null AUTO_INCREMENT," +
    "Title VARCHAR(100)," +
    "Description VARCHAR(500)," +
    "Price float," +
    "Currency VARCHAR(1)," +
    "Brand VARCHAR(50)," +
    "PRIMARY KEY (Id))";
  db.query(sql1, function (err, results) {
    if (err) throw err;
    console.log("Table Article created");
  });

  inventory.articles.forEach((element) => {
    var insert = `INSERT INTO Articles (Title, Description, Price, Currency, Brand) VALUES('${element.title}', '${element.description}', ${element.price}, '${element.currency}', '${element.brand}')`;
    console.log(insert);
    db.query(insert, function (err, results) {
      if (err) throw err;

      console.log("Elements ajoutés " + element.id);
    });
  });

});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json(inventory);
});

app.get("/articles", (req, res) => {
  res.json(inventory);
});

app.post("/articles", (req, res) => {
  console.log("req.body", req.body);
  const id = Number(req.body.id);
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const currency = req.body.currency;
  const brand = req.body.brand;

  //////// Méthode 1 /////////

  //   let articleFound = inventory.articles.find((article) => {
  //     //trouver l'article qui correspond a l'id de l'article récupéré dans la requête
  //     return article.id === id;
  //   });

  //   if (articleFound === null) {
  //     res.send("Pas d'article trouvé");
  //   }
  //   articleFound.title = title;
  //   //ou inventory["articles"] si @ par exemple

  //   inventory.articles.forEach((a, i) => {
  //     if (a.id === articleFound.id) {
  //       delete inventory.articles[i];
  //     }
  //   });

  //   inventory.articles.push(articleFound);

  // fs.writeFileSync("./inventory.json", JSON.stringify(inventory)); //remplace tout le contenu du fichier pour le contenu modifié

  // res.json(articleFound); //renvoit l'article trouvé

  /////// Méthode 2 ////////

  let articleFound = {};

  inventory.articles.forEach((article) => {
    if (article.id === id) {
      article.title = title;
      article.description = description;
      article.price = price;
      article.currency = currency;
      article.brand = brand;
      articleFound = article;
    }
  });

  console.log("inventory", inventory);

  fs.writeFileSync("./inventory.json", JSON.stringify(inventory)); //remplace tout le contenu du fichier pour le contenu modifié

  res.json(articleFound); //renvoit l'article trouvé
  res.send(req.body);
});

// app.delete("/deletearticle", (req, res) => {
//     console.log("req.body", req.body); 
//     const id = Number(req.body.id);
//     const index = articles.findIndex((art, index) =>art.id == id);

//     articles.splice(index,1)
//     return res.send();

// });
//chemin qu'on veut creer, la requête et la réponse
// app.post("/", (req, res) => {
//     res.send("OK je suis sur la page d'accueil")
// })

app.listen(port, () => {
  console.log("server running on port " + port);
});

//fichier qui fait office de server
//sudo node server.js pour lancer le server
//express=framework
