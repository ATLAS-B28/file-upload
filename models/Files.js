const mongoose = require('mongoose')
const File = new mongoose.Schema({
    path:{// that is generated and stored
        type:String,
        required:true,
    },
    originalName:{//original name
        type:String,
        required:true,
    },
    password:String,
    downloadCount:{//keeping track of the downloads
        //incremented through a function 
        type:Number,
        required:true,
        default:0,
    },
})
module.exports = mongoose.model("File",File)