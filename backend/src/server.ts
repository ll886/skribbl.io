import express from "express";
const app = express()
app.use(express.json());

const port = 3000
const host = "localhost";
const protocol = "http";


app.get('/', (req, res) => {
  // TODO remove placeholder route
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`${protocol}://${host}:${port}`);
})