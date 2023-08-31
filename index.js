
import { log } from 'console';
import express from 'express'
import path, { join } from 'path'

import mongoose from 'mongoose';

import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken"

import bcrypt from 'bcrypt'

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName :"backend-learn",
}).then(()=>console.log("db is connected"))
.catch((e)=>console.log("error in db connection ",e))

// schema--------->

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
})

const userModel = mongoose.model("User",userSchema);

const app =express()

const users= []

// set middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())



// setting view engine
app.set("view engine" ,"ejs")



// middleware ===================================================>

const isAuthenticated = async (req,res,next)=>{
    const {token} =req.cookies;
    
   

    if(token){
        const decode = jwt.verify(token,"123456789");
        // console.log(decode);
         req.user = await userModel.findById(decode._id);
    
        next();
    }else{

        res.redirect("/login");
    }
}

app.get('/', isAuthenticated,(req,res)=>{

 
    // console.log(req.user)
    res.render("logout",{name : req.user.name});
})

app.get('/users',(req,res)=>{
      
    // res.render("index",{name : "Abhi"});

    // console.log(users);
    res.json({
        users,
    })
})
app.get('/add',(req,res)=>{
      
    res.send("Nice")
})


app.post('/contact',async (req,res)=>{

    const {name,email} =req.body;
    await userModel.create({name,email});
    // res.send('nice');
    res.render("success");
})


app.post('/register', async (req,res)=>{
    
    const {name,email,password} =req.body;

    let cur_user = await userModel.findOne({email})

    if(cur_user){
       
        return res.redirect("/login")
    }
    
    const hashed_pass = await bcrypt.hash(password,10);

    const user=await userModel.create({name,email,password:hashed_pass});
    
    const token = jwt.sign({_id : user._id},"123456789");
    console.log(token);
    res.cookie("token",token,{
        httpOnly : true,
        expires : new Date(Date.now() + 60*1000)
    })

    res.redirect('/')
})

app.post('/login', async (req,res)=>{
    
    const {email,password} =req.body;

    let cur_user = await userModel.findOne({email})

    if(!cur_user){
        return res.redirect("/register")
    }
   
    const isMatch = await bcrypt.compare(password,cur_user.password)

    if(!isMatch){
       return res.render("login",{email,message : "Incorrect password"})
    }

    const token = jwt.sign({_id : cur_user._id},"123456789");
    console.log(token);
    res.cookie("token",token,{
        httpOnly : true,
        expires : new Date(Date.now() + 60*1000)
    })

    res.redirect('/')
})



app.get('/register',async (req,res)=>{
    res.render("register");
     
 })

app.get('/login',async (req,res)=>{
    res.render("login");
     
 })
 
app.get('/logout', (req,res)=>{
    res.cookie("token",null,{
        httpOnly : true,
        expires : new Date(Date.now())
    })

    res.redirect('/')
})


// app.post('/',(req,res)=>{
//     users.push(req.body);
//     res.render("success")
// })



app.listen(8080,()=>{
    console.log("server is running");
})

















// import http from "http";

// const server= http.createServer((req,res)=>{
//        res.end("<h1>welcome</h1>")
// })



// server.listen(8080,()=>{
//     console.log("server is running")
// })


// app.get('/',(req,res)=>{
      
//     const pathLocation = path.resolve();

//     log(pathLocation);

//     res.sendFile(path.join(pathLocation,"/index.html"));
// })