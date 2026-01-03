import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectTOSocket = (server) => {
    const io = new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true,
        }
    });

    //this for showing if any user connect to socket it will call this
    io.on("connection", (socket) => {

        console.log("Something is connected");

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id); //this for adding the connections id in connectios object
            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if (messages[path] !== undefined) {

                for (let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender']);
                }
            }
        });

        socket.on("signal", (toId, messages) => {
            io.to(toId).emit("signal", socket.id, messages);
        })

        socket.on("chat-message", (data, sender) => {

            //following is code is about founding the room and sending message in it only
            const [mathingroom, found] = Object.entries(connections)
                .reduce(([room, isfound], [roomkey, roomvalue]) => {

                    if (!isfound && roomvalue.includes(socket.id)) {
                        return [roomkey, true];
                    }

                    return [room, isfound];
                }, ['', false]);


            if (found == true) {
                if (messages[mathingroom] === undefined) {
                    messages[mathingroom] = []
                }

                messages[mathingroom].push({ 'sender': sender, 'data': data, 'socket-id-sender': sender.id });
                console.log("message",mathingroom, ":", sender, data);

                connections[mathingroom].forEach((element) => {
                    io.to(element).emit("chat-message", data, sender, socket.id);
                });
            }
        })

        socket.on("disconnet", () => {
            var difftime = Math.abs(timeOnline[socket.id] - new Date());

            var key

            //this is for creating the deep copy for something we want to delete
            for(const[k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a = 0 ;a<v.length;a++)
                {
                    if(v[a]===socket.id)
                    {
                        key = k;

                        for(let a = 0;a<connections[key].length;a++)
                        {
                            io.to(connections[key][a]).emit('user-left' , socket.id);
                        }

                        var index = connections[key].indexof(socket.id);

                        connections[key].splice(index,1);

                        if(connections[key].length===0){
                            delete connections[key];
                        }
                    }
                }
            }
        })
    });
}