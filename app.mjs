import { sendEmail } from './mail.mjs';
import express from "express";


const app = express()
const port = 3000

app.get('/', (req, res) => {
  try {
  sendEmail(req.query.to, req.query.subject, req.query.body)
  }
  catch(e) {
    
  }
  res.json(req.query)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})