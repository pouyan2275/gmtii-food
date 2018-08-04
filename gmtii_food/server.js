var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
const {getTime} = require('./persianDate')

mongoose.connect("mongodb://admin:gmtii!1396@localhost:27017/gmtii_food",{useNewUrlParser : true});

var db = mongoose.connection

db.once("error",function(){
    console.log("mongodb disconnected")
    })

db.once("connected",function(){
console.log("mongodb connected")
})

var personalSchema = mongoose.Schema({
    code_p : Number,
    name : String,
    family : String,
    password : String
})

var adminSchema = mongoose.Schema({
    username : String,
    name : String,
    family : String,
    password : String
})

var foodSchema = mongoose.Schema({
    day_food : String,
    name_food : String
})

var reg_foodSchema = mongoose.Schema({
    code_p: Number,
    name : String,
    family : String,
    name_food : String,
    date_reg : String
})

var personalModel = mongoose.model('personal' , personalSchema)
var adminModel = mongoose.model('admin', adminSchema)
var foodModel = mongoose.model('food',foodSchema)
var reg_foodModel = mongoose.model('reg_food',reg_foodSchema)

var server = express();

server.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized : true,
    cookie:{maxAge : 1 * 1 * 30 * 60 * 1000}
}))
server.use(express.static("./statics"))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended : true}))

setInterval(function(){
    var h = new Date()
    if(h.getHours() == 20){
    reg_foodModel.remove({}, function(err) { 
        console.log('collection removed') 
     });
    }
},1 * 60 * 60 * 1000)

server.post("/getFoods",function(req , res ,next){
    if(req.session.auth == "admin"){
        foodModel.find({day_food:req.body.day_food},function(err,data){
            if(err){throw err}
            else if(data.length)
            res.json(data)
        })
    }
})
server.post("/get_food_registed",function(req,res){
    if(req.session.auth == "admin"){
        var thisTime = new Date();
        thisTime = thisTime.getFullYear()+"/"+ thisTime.getMonth()+"/"+ thisTime.getDate()
        reg_foodModel.find({date_reg:thisTime},function(err,data){
            if(err){throw err}
            else if(data.length)
            {
            res.json(data)
            }
        })
    }
})
server.post("/getFoodToday",function(req , res ,next){
    if(req.session.auth == "personal"){
        foodModel.find({day_food:getTime().day},function(err,data){
            if(err){throw err}
            else if(data.length)
            {
            res.json(data)
            }
        })
    }
})

server.post("/myFood",function(req , res ,next){
    if(req.session.auth == "personal"){
        var thisTime = new Date();
        thisTime = thisTime.getFullYear()+"/"+ thisTime.getMonth()+"/"+ thisTime.getDate()
        reg_foodModel.find({date_reg:thisTime,code_p:req.session.code_p},function(err,data){
            if(err){throw err}
            else if(data.length)
            {
            res.json(data[0].name_food)
            }
        })
    }
})

server.post("/deleteFood",function(req , res ,next){
    if(req.session.auth == "admin"){
        foodModel.findByIdAndRemove(req.body._id,function(err,data){
            if(err){throw err}
            else if(toString(data).length)
            res.json({status:true})
            else
            res.json({status:false})
        })
    }else{res.json({status:false,msg:"کاربر مدیر توانایی حذف دارد!"})}
})

server.post("/change_password" ,function(req,res){
    if(req.body.password.length){
        if(req.session.auth == "personal"){
            personalModel.findOneAndUpdate({code_p : req.session.code_p},{password : req.body.password},function(err,data){
                if(err)throw err
                else if(data)
                res.json({status:true,msg:"تغییر رمز با موفقیت انجام شد"})
            })
        }else if(req.session.auth == "admin"){
            adminModel.findOneAndUpdate({username : req.session.username},{password : req.body.password},function(err,datab){
                if(err)throw err
                else if(datab)
                res.json({status:true,msg:"تغییر رمز با موفقیت انجام شد"})
            })
        }else{
            res.json({status:false})
        }
    }else{
        res.json({status:true,msg:"لطفا رمز عبور جدید را وارد کنید"})
    }
})

server.post("/reg_food_personal",function(req , res ,next){
    var formData = req.body;
    if(formData.name_food.length){
        if(req.session.auth == "personal"){
        foodModel.find({name_food : formData.name_food,day_food:getTime().day},function(err,data){
            if(err){throw err}
                else if(data.length){
                    var thisTime = new Date();
                    thisTime = thisTime.getFullYear()+"/"+ thisTime.getMonth()+"/"+ thisTime.getDate()
                    reg_foodModel.find({date_reg : thisTime,code_p : req.session.code_p},function(err,datab){
                        if(err){throw err}
                        else if(datab.length){
                            reg_foodModel.findByIdAndUpdate(datab[0]._id,{name_food:formData.name_food},function(err){
                                if(err){throw err}
                                else
                                    res.json({status : true,msg:"تغییر غذا با موفقیت انجام شد"})
                            })
                        }else{
                            var newRegFood = new reg_foodModel({
                                code_p : req.session.code_p,
                                name : req.session.name,
                                family : req.session.family,
                                name_food : formData.name_food,
                                date_reg : thisTime
                            })
                            newRegFood.save();
                            res.json({status : true,msg:"ثبت غذا با موفقیت انجام شد"})
                        }
                    })
                    
                }else{
                        res.json({status : true,msg:"ثبت غذا انجام نشد"})
                    }           
        })
    }
    else{
        res.json({status:false})
    }
}else{res.json({status:false,msg:"باید حتما یک غذا انتخاب کنید"})}
});

server.post("/reg_new_food",function(req , res ,next){
    var formData = req.body
    if(formData.day_food.length && formData.name_food.length){
        if(req.session.auth == "admin"){
            console.log(req.session)
        foodModel.find({name_food : formData.name_food},function(err,data){
            var findDay = false
            data.forEach(function(i){
                if(i['day_food'] == formData['day_food'])
                findDay = true
            })
            if(err){throw err}
                else if(data.length && findDay){
                    res.json({status : false,msg:"غذا در این روز از قبل ثبت شده"})
                }else{
                        var newFood = new foodModel({
                            day_food : formData.day_food,
                            name_food : formData.name_food
                        })
                        newFood.save();
                        res.json({status : true,msg:"ثبت غذا انجام شد"})
                    }           
        })
    }
    else{
        res.json({status:false,msg:"ابتدا باید وارد اکانت شوید"})
    }
}else{res.json({status:false,msg:"لطفا نام غذا را بنویسید"})}
});

server.post("/admin",function(req , res ,next){
    var formData = req.body
    if(formData.username.length && formData.password.length){
        adminModel.find({username : formData.username,password : formData.password},function(err,data){
            if(err){throw err}
            else if(data.length){
                        req.session.auth = "admin"
                        req.session.username = formData.username
                        res.json({status : true})
                    }
                    else{
                        res.json({msg : "رمز عبور یا نام کاربری اشتباه می باشد"})
                    }           
        })
    }
    else{
        res.json({msg:"ورود انجام نشد"})
    }
});

server.post("/logout",function(req,res){
    req.session.destroy(function(err){
        if(err)throw err
    });
})

server.post("/personal",function(req , res ,next){
    var formData = req.body
    var thisTime = new Date()
    thisTime = thisTime.getHours()
    if(thisTime >=06 && thisTime <=11){
    var cod = parseInt(formData.code_p)
    if(cod > 0 && formData.password.length){
        personalModel.find({code_p : cod,password : formData.password},function(err,data){
            if(err){throw err}
                    else if(data.length){
                        req.session.auth = "personal"
                        req.session.code_p = cod
                        data.forEach(function(i){
                            req.session.name = i.name
                            req.session.family = i.family
                        })
                        res.json({status : true})
                    }
                    else{
                        res.json({msg : "رمز عبور یا کدپرسنلی اشتباه می باشد"})
                    }
        })
    }
    else{
        res.json({msg:"ورود انجام نشد"})
    }
    }else{res.json({msg:"لطفا در زمان مشخص شده وارد شوید"})}
});

server.post("/time",function(req , res){
    res.json(getTime())
})

server.post("/register",function(req ,res, next){
    var formData = req.body ;
    if(formData.authentication == "admin@123"){
    if(formData.reg_post.length && formData.reg_post == "کارمند"){
    var cod = parseInt(formData.code_p)
    if(cod > 0 && formData.name.length && formData.family.length && formData.password.length &&formData.authentication.length){
        personalModel.find({code_p : cod},function (err , data){
            if(err)throw err
            else if(data.length){
            res.json({status:false,msg : "کد پرسنلی از قبل ثبت شده است"})
            }
            else{
                var newPersonal = new personalModel({
                    code_p : cod,
                    name : formData.name,
                    family : formData.family,
                    password : formData.password
                })
                newPersonal.save()
                res.json({status:true,msg : "ثبت نام با موفقیت انجام شد"})
            }
        })
    }
    else{
        res.json({status:false,msg:"لطفا فیلد ها را به درستی پر کنید"})
    }
}else if(formData.reg_post.length && formData.reg_post == "مدیر"){
    if(formData.code_p.toString().length && formData.name.length && formData.family.length && formData.password.length &&formData.authentication.length){
        adminModel.find({username : formData.code_p.toString()},function (err , data){
            if(err)throw err
            else if(data.length){
            res.json({status:false,msg : "نام کاربری از قبل ثبت شده است"})
            }
            else{
                var newAdmin = new adminModel({
                    username : formData.code_p.toString(),
                    name : formData.name,
                    family : formData.family,
                    password : formData.password
                })
                newAdmin.save()
                res.json({status:true,msg : "ثبت نام با موفقیت انجام شد"})
            }
        })
    }
    else{
        res.json({status:false,msg:"لطفا فیلد ها را به درستی پر کنید"})
    }
}
    }else{
        res.json({status:false,msg:"کد احراز هویت را به درستی وارد کنید"})
    }
})
server.listen(80)