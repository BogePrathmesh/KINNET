import express, { urlencoded } from "express";
import {createServer} from "node:http";
import { connectTOSocket } from "./controllers/socketManager.js";
import mongoose from"mongoose";
import cors from "cors";
import userRoutes from "./routes/user.route.js"

const app = express();
const server = createServer(app); //here app and server port and different to connect them we are using server and io
const io = connectTOSocket(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb" ,extended:true}));

app.use("/api/v1/users",userRoutes);


app.get("/home",(req,res)=>{
    res.send("Welcome to Home Page");
});

const start = async () =>{
    const connectionDb = await mongoose.connect("mongodb+srv://bogeprathmesh:P%40p135790@cluster0.zhkcj8j.mongodb.net/?appName=Cluster0");

    console.log(`MongoDB Database is connected:${connectionDb.connection.host}`);
    server.listen(app.get('port'),(req,res)=>{ //here this will go to app.set(port) and get port from there and make connection
        console.log("Port Running on 8000");
    });
}

start();