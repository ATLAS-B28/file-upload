require('dotenv').config()
const express = require('express')
const multer = require('multer')
const encrypt = require('bcrypt')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000
const File = require('./models/Files')
const app = express()//initialize the app
//initialize the library and send the files to the destination  folder
const upload = multer({dest:"uploads"})
//connect to mongo db
mongoose.connect(process.env.DATA_URI)
//url encoding
//we tell express to understand a form given from the html tag
app.use(express.urlencoded({extended:true}))
//setting the view engine
app.set('view engine','ejs')
//get route
app.get('/',(req,res)=>{
    res.render('index')
})
//post that is upload to using multer ,
//add a middleware where we say hey process a file from the form input name file
app.post('/upload',upload.single('file'),async (req,res)=>{
    const fileData= {
        path:req.file.path,//gives exact file path
        originalName:req.file.originalname,

    }
    if(req.body.password != null && req.body.password !== ''){//accesses
           //if filedata has a password encrypt it
           fileData.password = await encrypt.hash(req.body.password,10)
    }
    //finally create the file
    const file = await File.create(fileData)
    //render a link to point to the generated file link
    res.render("index", {fileLink:`${req.headers.origin}/file/${file.id}`})

})
//to access file from database we use id given by mongo
//route is /file/:id 
// we create another function and use .route.get.post
//The app.route() function returns an instance of a single route, which you can 
//then use to handle HTTP verbs with 
//optional middleware. Use app.route()
// to avoid duplicate route names 
//(and thus typo errors).
app.route('/file/:id').get(handleDownload).post(handleDownload)
//funtion to handle 
async function handleDownload(req,res){
    //we have a post method in the form but here there is get
//and we don't wanna save the password which will happen in the get request

  const file = await File.findById(req.params.id)//find the file by id
  //check if password is there or not
  if (file.password != null) {
    //if there is a password
    if (req.body.password==null) {
        res.render('password')
        return
    }
    //then do check password
    if (await encrypt.compare(req.body.password,file.password))//compare the 2 
    {
       res.render('password',{error:true})
       return    //skip all the steps below and return again
    }
  }
   //count the no.of times it is downloaded
   file.downloadCount++
   await file.save()
   console.log(file.downloadCount)
   res.download(file.path,file.originalName)//dounload the file with original name
}
//listen on port 
app.listen(process.env.PORT, ()=>{
    console.log(`App started on PORT ${PORT}`)
})