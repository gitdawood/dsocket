const express = require('express');
const mongoose =require('mongoose');
//hello dawood
const cron=require('node-cron');
const chatSchema = require('./controllers/chatController');
const app = express();
 const server = require("http").createServer(app);
const https = require('https');
const userRouter=require('./router/userRouter');
const userModel = require('./models/userModel');
const chatModel=require('./models/chatModel');
const chatRecord = require('./models/chatRecord');
const io = require('socket.io')(server)
const url = 'mongodb://localhost/final'
mongoose.connect(url, { useNewUrlParser: true })
const con = mongoose.connection
con.on('open', function () {
    console.log('Conection with db')
});

 //cron job scheduler
cron.schedule('* * * * *', function() {
    console.log('updating chat storage in every minute');
    chatModel.find({createdAt:{$gt:("2010-01-01T00:00:00Z")}},(err,result)=>{
        if(err){
            console.log(err);
        }
        
        else
        {
            console.log(result[_id]);




        /*  new  chatRecord(result).save((err,succ)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("Chat record succesfully Updated.",succ);
                }
            
        });*/
    }
});
});
//create connection
var userCount = 0,onlineUsers = {};
io.sockets.on('connection', (socket) => {
    console.log("my socket id is:", socket.id)
       socket.on('onlineUser', (data) => {
        console.log("data:", data)
        console.log("socket.id:", socket.id)
        OnlineUser(data, socket.id);
        io.sockets.emit("onlineUser", onlineUsers)
   })

   //user register
     socket.on('userRegister', async(data)=>{
         console.log(data)
         let register = await chatSchema.userRegister(data)
         io.sockets.emit("userRegister",register)
     })
     //send chat
    socket.on('chatAPI', async (data) => {
        console.log(data)
        let sendSocketId;
        let chatSend = await chatSchema.chatAPI(data)
        console.log("You can chat", data.message)
        if (chatSend.result.status == "ACTIVE") {
            var socketUser = [data.adminId, data.customerId]
            console.log("socket users>?>", socketUser)
            socketUser.forEach(id => {
                console.log("sending>?>", id)
                if (id in onlineUsers) {
                    console.log("socketId>>>.>?>", onlineUsers[id].socketId)
                    sendSocketId = onlineUsers[id].socketId
                    io.sockets.in(sendSocketId).emit("chatAPI", chatSend)
                }
            })
        }
        else {
            console.log("You are not allowed to chat.")
        }
    })

       
//disconnect
    socket.on('disconnect', async () => {
        userCount--;

        console.log("disconnected socketId", userCount, socket.id)    
        console.log("User remain Online.", JSON.stringify(onlineUsers));

    })
})

app.use(express.json());
app.use("/user",userRouter);

//listen server

server.listen(3000,function(){
    console.log("server is running on port 3000")
})
