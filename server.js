const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000


//middleware
//use json parser
app.use(express.json())
app.use(cors());



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/signup', (req, res) => {
    const {Username,Password}=req.body
    console.log(Username,Password)
  
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

