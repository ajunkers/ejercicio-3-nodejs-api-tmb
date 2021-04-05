require("dotenv").config();
const debug = require("debug")("mi-app:principal");
const express = require("express");
const chalk = require("chalk");
const { program } = require("commander");
const { reset } = require("chalk");
const morgan = require("morgan");
const { default: fetch } = require("node-fetch");

program.option("-p, --puerto <puerto>", "Puerto para el servidor");
program.parse(process.argv);
const options = program.opts();

const app = express();

const puerto = options.puerto || process.env.PUERTO || 5000;

const server = app.listen(puerto, () => {
  debug(chalk.yellow(`Servidor escuchando en el puerto ${chalk.green(puerto)}.`));
});
server.on("error", err => {
  debug(chalk.red("Ha ocurrido un error al levantar el servidor"));
  if (err.code === "EADDRINUSE") {
    debug(chalk.red(`El puerto ${puerto} está ocupado`));
  }
});

app.use(morgan("dev"));
app.use(express.static("public"));
app.get("/metro/lineas", (req, res, next) => {
  fetch(`${process.env.METRO_LINEAS_API}?app_id=${process.env.TMB_API_APP_ID}&app_key=${process.env.TMB_API_APP_KEY}`)
    .then(response => response.json())
    .then(data => {
      const lineas = data.features.map(linea => ({ id_linea: linea.properties.ID_LINIA, nom_linea: linea.properties.NOM_LINIA, desc_linea: linea.properties.DESC_LINIA }));
      res.json(lineas);
    });
});
app.get("/metro/linea/:codiLinia?", (req, res, next) => {

});

app.get("/", (req, res, next) => {
  res.redirect("/metro/lineas");
});

app.use((req, res, next) => {
  res.status(404).json({ error: true, mensaje: "Recurso no encontrado" });
});
app.use((err, req, res, next) => {
  debug(err);
  res.status(500).json({ error: true, mensaje: "Error general" });
});
app.all("*", (req, res) => {
  res.status(403).json({ error: true, mensaje: "Te pensabas que podías hackerme" });
});
