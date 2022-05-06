//#region REQUIRE
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// console.log("prisma", prisma);

const bcrypt = require("bcrypt");
const express = require("express");
const fs = require("fs");
const port = "90";
const cors = require("cors");
const mysql = require("mysql");
const csv = require("csv-parser");
const csvtojson = require("csvtojson");
const multer = require("multer");
const htmlspecialchars = require("htmlspecialchars");
const striptags = require("striptags");

var inventory = require("./inventory.json");
var app = express();
var bodyParser = require("body-parser");
const { cp } = require("fs/promises");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//#endregion

(async function () {
  var password = "toto";
  var user1 = {};

  // bcrypt.hash(password, 4, async function (err, hash) {
  //   // password = hash;
  //   user1 = await prisma.users.create({
  //     data: {
  //       name: "toto",
  //       email: "toto@toto.fr",
  //       password: hash
  //     }
  //   });
  // });

  // const foundedUser = await prisma.users.findUnique({
  //   where: {
  //     email: "toto@toto.fr",
  //   },
  // });

  // console.log("foundeduser", foundedUser);

  // if (!foundedUser) {
  //   console.warn("sorry no item found");
  // }

  // var isValidUser = false;
  // bcrypt.compare(password, foundedUser?.password, function (err, result) {
  //   isValidUser = result;
  //   result && console.log("Trouvé"); // renvoit derniere valeur fausse entre les deux
  // });

  // console.log("isValidUser", isValidUser);
})(); //execute tout de suite

//////// BASE DE DONNEES CONNECTION /////////

const db = mysql.createConnection({
  host: "localhost",

  user: "root",

  password: "",

  database: "bddnodejs",
});

/////// LOGIN CHECK /////////

//#region LOGIN CHECK

app.post("/login_check", async (req, res) => {
  const user_email = htmlspecialchars(striptags(req.body.email));
  const password = htmlspecialchars(striptags(req.body.password));
  var foundedUser;

  if (!user_email || !password) {
    res.status(403).send("request is wrong formated")
  }

  try {
    foundedUser = await prisma.users.findUnique({
      where: {
        email: user_email
      }
    });
  } catch (error) {
    res.status(401).send(`findUnique_ERROR ${error}`);
    return;
  }

  if (!foundedUser) {
    console.warn("l'utilisateur n'existe pas");
    res.status(401).send("Invalid credencials");
    return;
  }

  try {
    bcrypt.compare(password, foundedUser?.password, function(err, result) {
      if (!result) {
        res.status(401).send("Utilisateur ou mot de passe incorrect");
        return;
      }
      const { id, name, email, role } = foundedUser;
      res.send({id,name,email,role});
  });
  } catch (error) {
    res.status(401).send("err" + error);

    return;
  }
  // var isValidUser = false;



  // if (!isValidUser) {
  //   res.status(401).send("Unauthorized")
  // }
});

//#endregion


///////  CREATE USER /////////////

app.post("/adduser", async (req, res) => {
  const email = htmlspecialchars(striptags(req.body.email));
  const name = htmlspecialchars(striptags(req.body.name));
  const password = htmlspecialchars(striptags(req.body.password));

  if (!email || !password) {
    res.statusCode(403).send("request is wrong formated")
  }

  const foundedUser = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });

  if (foundedUser) {
    res.send("email already exist");
    return
  };

   bcrypt.hash(password, 4, async function (err, hash) {
    // password = hash;
    user = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: hash
      }
    });
    res.send(user)
  });

});




app.post("/login", (req, res) => {
  var user = {
    email: req.body.email,
    password: req.body.password,
  };
  res.json(user);
  // console.log(user);

  data.user.forEach((element) => {
    var insert = `INSERT INTO user (email, password) VALUES('${element.email}', '${element.password}')`;
    console.log(insert);
    db.query(insert, function (err, results) {
      if (err) throw err;

      console.log("Elements ajoutés " + element);
    });
  });

  if (user.email) {
  }

  // let tableUser =
  // "CREATE TABLE Users" +
  //   "(Id INT not null AUTO_INCREMENT," +
  //   "Email VARCHAR(100) NOT NULL," +
  //   "Password VARCHAR(100) NOT NULL," +
  //   "PRIMARY KEY (Id))";
});




//////////// MODIFIER USER ///////////////////////


app.post("modify", (req, res) => {

});


const stockFile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});
const upload = multer({ storage: stockFile });

app.post("/csv", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
  const path = req.file.path;
  console.log(path);

  const results = [];
  fs.createReadStream(`./${path}`)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(results);
      results.forEach((element) => {
        var insert = `INSERT INTO Entreprises (Nom, Salaries, CA) VALUES('${element.Nom}', '${element.salaries}', '${element.CA}')`;
        console.log(insert);
        db.query(insert, function (err, results) {
          if (err) throw err;

          console.log("Elements ajoutés " + element.Nom);
        });
      });
    });
});

///////// FICHIER CSV LECTURE 1 //////////////////

app.get("/csv", (req, res) => {
  fs.createReadStream("./entreprises.csv")
    .pipe(csv({}))
    .on("data", function (data) {
      try {
        console.log("Name is: " + data.Nom);
        console.log("Nombre de salariés is: " + data.salaries);
        console.log("CA is: " + data.CA);

        //perform the operation
      } catch (err) {
        //error handler
      }
    })
    .on("end", function () {
      //some final operation
    });
});

///////// FICHIER CSV LECTURE 2 ////////////

app.get("/csv2", (req, res) => {
  const results = [];
  fs.createReadStream("./entreprises.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(results);
    });
});

// ENREGISTRER FICHIER CSV EN BDD

app.get("/bddcsv", (req, res) => {
  var dropTableEntreprise = "DROP TABLE IF EXISTS Entreprises";
  db.query(dropTableEntreprise, function (err, results) {
    if (err) throw err;
    console.log("Table Entreprises dropped");
  });

  var tableEntreprise =
    "CREATE TABLE Entreprises" +
    "(Id INT not null AUTO_INCREMENT," +
    "Nom VARCHAR(100)," +
    "Salaries VARCHAR(100)," +
    "CA VARCHAR(100)," +
    "PRIMARY KEY (Id))";
  db.query(tableEntreprise, function (err, results) {
    if (err) throw err;
    console.log("Table Entreprises created");
  });

{
  // const results = [];
  // fs.createReadStream("./entreprises.csv")
  //   .pipe(csv())
  //   .on("data", (data) => results.push(data))
  //   .on("end", () => {
  //     console.log(results);

  //     results.forEach((element) => {
  //       var insert = `INSERT INTO Entreprises (Nom, Salaries, CA) VALUES('${element.Nom}', '${element.salaries}', '${element.CA}')`;
  //       console.log(insert);
  //       db.query(insert, function (err, results) {
  //         if (err) throw err;

  //         console.log("Elements ajoutés " + element.Nom);
  //       });
  //     });
  //   });
  //   const fileName = "entreprises.csv";

  // csvtojson().fromFile(fileName).then(source => {

  //     // Fetching the data from each row
  //     // and inserting to the table "sample"
  //     for (var i = 0; i < source.length; i++) {
  //         var Nom = source[i]["Nom"],
  //             Salaries = source[i]["salaries"],
  //             CA = source[i]["CA"]

  //         var insertStatement =
  //         `INSERT INTO Entreprises values(?, ?, ?)`;
  //         var items = [Nom, Salaries, CA];

  //         // Inserting data of current row
  //         // into database
  //         db.query(insertStatement, items,
  //             (err, results, fields) => {
  //             if (err) {
  //                 console.log(
  //     "Unable to insert item at row ", i + 1);
  //                 return console.log(err);
  //             }
  //         });
  //     }
  //     console.log(
  // "All items stored into database successfully");
  // });

}
});

// CONNECTER A LA BASE DE DONNEES ET AJOUTER TABLE ARTICLES + DONNEES

db.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
  //    db.query("CREATE DATABASE mabdd", function (err, result) {
  //         if (err) throw err;
  //         console.log("Base de données créée !");
  //       });
});

///////  AJOUTER ET REMPLIR TABLE ARTICLES /////////

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

app.get("/", (req, res) => {
  res.json(inventory);
});

app.get("/articles", (req, res) => {
  res.json(inventory);
});

app.get("/inscription", (req, res) => {});

/////// AFFICHER LES ARTICLES A PARTIR DE FICHIER JSON /////////:

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
//express= framework
