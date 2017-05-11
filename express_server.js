const express = require("express");
const cookieParser = require('cookie-parser'); // later on we will be using something else instead of cookie-parser
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser()); // later on we will be using something else instead of cookie-parser

app.use (function(req, res, next) {
  res.locals.username = req.cookies.username;
  next();
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let text = "";
  let charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++ ) {
    text += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  return text;
}

// app.get('/', function (req, res) {
//   // Cookies that have not been signed
//   console.log('Cookies: ', req.cookies)
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongUrl;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Make it so!`);
});