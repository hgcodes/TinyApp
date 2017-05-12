const express = require("express");
const cookieParser = require('cookie-parser'); // later on we will be using something else instead of cookie-parser
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser()); // later on we will be using something else instead of cookie-parser

app.use(function (req, res, next) {
  res.locals.userid = req.cookies.user_id;
  next();
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let text = "";
  let charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++ ) {
    text += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  return text;
}

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  let userid = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase, user: users[userid] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter both email and password");
    return;
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (users[user].password === req.body.password) {
        res.cookie("user_id", users[user].id);
        res.redirect("/urls");
        return;
      } else {
          res.status(403).send("password for this email is not correct");
          return;
      }
    }
  }
  res.status(403).send("email does not match any user account");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongUrl;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("Please enter email and/or password");
    return;
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.status(400).send("Email matches an account that already exists");
      return;
    }
  }
  let randomId = generateRandomString();
  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", randomId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Make it so!`);
});