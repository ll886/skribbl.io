import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import cors from "cors";
import * as argon2 from "argon2";
const app = express()
app.use(express.json());
app.use(cors())

const port = 3000
const host = "localhost";
const protocol = "http";

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");


app.get('/', (req, res) => {
  // TODO remove placeholder route
  res.send('Hello World!')
})

app.post('/signup', async (req, res) => {
  const body = req.body

  const email: string = body.email
  const username: string  = body.username
  const password: string  = body.password
  const passwordConfirmation: string  = body.passwordConfirmation

  let errors: string[] = []

  let emailDatabase = (await db.get('SELECT * FROM users WHERE email = ?', [email]))
  emailDatabase = emailDatabase ? emailDatabase['email'] : undefined

  let usernameDatabase = (await db.get('SELECT * FROM users WHERE username = ?', [username]))
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

app.listen(port, () => {
  console.log(`${protocol}://${host}:${port}`);
})