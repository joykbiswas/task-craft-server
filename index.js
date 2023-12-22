const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000


//middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqpfzla.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db('taskCraftDB').collection('users');
    const TasksCollection = client.db('taskCraftDB').collection('tasks');

    app.post('/users', async(req, res) =>{
        const user =req.body;
        const query = {email: user.email}
        const existingUser = await usersCollection.findOne(query)
        if(existingUser){
            return res.send({message: 'user already exists', insertedId: null})
        }
        const result = await usersCollection.insertOne(user)
        res.send(result);
    })
    app.get('/users', async(req, res) =>{
        const result = await usersCollection.find().toArray()
        res.send(result)
    })

    app.post('/tasks', async(req, res) =>{
      const newTask =req.body;
      newTask.status = 'to-do'
      const result = await TasksCollection.insertOne(newTask)
      res.send(result)
    })
    app.get('/tasks', async(req, res) =>{
      let query= {}
      if(req.query){
        const result = await TasksCollection.find(query).toArray()
        res.send(result);
      }
    })

    app.get('tasks/:id', async(req, res) =>{
      const id= req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await TasksCollection.findOne(query)
      res.send(result)
    })
    app.put("/tasks/:id", async(req,res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedTasks = req.body;

      const task ={
        $set:{
          title:updatedTasks.title,
          date:updatedTasks.date,
          priority:updatedTasks.priority,
          description:updatedTasks.description
        }
      }

      const result = await TasksCollection.updateOne(filter,task, options)
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Task craft is running !')
})

app.listen(port, () => {
  console.log(`Task craft is running on port ${port}`)
})
/*
https://task-craft-server-six.vercel.app
*/