import express, { CookieOptions } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import cors from "cors";
import * as argon2 from "argon2";
import cookieParser from "cookie-parser";
import crypto from "crypto";

const app = express()
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const port = 3000
const host = "localhost";
const protocol = "http";

let tokenStorage: { [key: string]: string } = {};

let cookieOptions: CookieOptions = {
  httpOnly: true, // don't allow JS to touch cookies
  secure: true, // only send cookies over HTTPS
  sameSite: "strict", // https://web.dev/articles/samesite-cookies-explained
};

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

app.get('/', (req, res) => {
  // TODO remove placeholder route
  res.send('Hello World!')
})

app.get('/loggedin', (req, res) => {
  if (!tokenStorage["login"]) {
    res.send(false)
  }

  res.send(true)
})

app.post('/signup', async (req, res) => {
  const body = req.body

  const email: string = body.email
  const username: string  = body.username
  const password: string  = body.password
  const passwordConfirmation: string  = body.passwordConfirmation

  let errors: string[] = []

  let emailDatabase = await db.get('SELECT * FROM users WHERE email = ?', [email])
  emailDatabase = emailDatabase ? emailDatabase['email'] : undefined

  let usernameDatabase = await db.get('SELECT * FROM users WHERE username = ?', [username])
  usernameDatabase = usernameDatabase ? usernameDatabase['username'] : undefined

  if (emailDatabase === email) {
    errors.push("Email is already in use")
  }

  if (usernameDatabase === username) {
    errors.push("Username is already in use")
  }

  if (password !== passwordConfirmation) {
    errors.push("Passwords do not match")
  }

  if (errors.length > 0) {
    res.status(400).send({
      errors: errors
    })
  } else {
    const passwordHash = await argon2.hash(password)

    await db.run(
      'INSERT INTO users(email, username, password) VALUES(?, ?, ?)', 
      [email, username, passwordHash]
    )

    res.sendStatus(200)
  }
})

app.post("/login", async (req, res) => {
  const body = req.body

  const email: string = body.email
  const password: string = body.password

  let errors: string[] = []

  let user = await db.get('SELECT * FROM users WHERE email = ?', [email])

  if (!user) {
    errors.push("Email is invalid")
  } else if (!(await argon2.verify(user.password, password))) {
    errors.push("Password is invalid")
  }

  if (errors.length > 0) {
    res.status(400).send({
      errors: errors
    })
  } else {
    const loginToken = makeToken()

    tokenStorage["login"] = loginToken
    tokenStorage["user_id"] = user.id

    return res.cookie("login", loginToken, cookieOptions).json()
  }
})

app.post("/logout", (req, res) => {
  const cookies = req.cookies

  if (cookies.token === tokenStorage.token) {
    delete tokenStorage["login"]
    delete tokenStorage["user_id"]
    return res.clearCookie("login", cookieOptions).send()
  }

  return res.send()
})

app.listen(port, () => {
  console.log(`${protocol}://${host}:${port}`);
})