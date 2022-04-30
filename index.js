const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

function  verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorizeed access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(403).send({ message: 'Forbiden to access' })
        }
        console.log('decoded', decoded)

        req.decoded = decoded
        next()
    })
    // console.log('inside verify JWT',authHeader)
  
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9fi3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db('m-66').collection('m-66')
        const orderCollection = client.db('m-68').collection('m-68')


        //Auth
        app.post('/login', async (req, res) => {


            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ token })
        })


        //SERVICES API
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //post 
        app.post('/service', async (req, res) => {
            const newService = req.body
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })
        //delete

        app.delete('/service/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            res.send(result)

        })
        //order collection api

        app.get('/order',verifyJWT, async (req, res) => {
            const decodedEmail=req.decoded.email
        
            const email=req.query.email
            if(email===decodedEmail){
                const query={email}
                const cursor=orderCollection.find(query)
                const orders=await cursor.toArray()
                res.send(orders)
            }
            else{
                res.status(403).send({message:'Forbiden access'})
            }
           
          
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })


    }
    finally {

    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('surver running')
})
app.listen(port, () => {
    console.log('listening to port', port)
})