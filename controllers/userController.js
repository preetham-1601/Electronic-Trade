const model = require('../models/user')
const Item = require('../models/item')
const watchList = require('../models/watch')
const tradeModel = require("../models/trade")

exports.new = (req, res)=>{
        return res.render('./user/new')
}

exports.create = (req, res, next)=>{
    let user = new model(req.body)
    user.save()
    .then(user=> {
        req.flash('success', 'Registration succeeded!')
        res.redirect('/users/login')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message)  
            return res.redirect('back')
        }
        if(err.code === 11000) {
            req.flash('error', 'Email has been used')  
            return res.redirect('back')
        }
        next(err)
    }) 
    
}

exports.getUserLogin = (req, res, next) => {
        return res.render('./user/login')
}

exports.login = (req, res, next)=>{
    let email = req.body.email
    let password = req.body.password
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'wrong email address')  
            res.redirect('/users/login')
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id
                    req.flash('success', 'You have successfully logged in')
                    res.redirect('/users/profile')
            } else {
                req.flash('error', 'wrong password')      
                res.redirect('/users/login')
            }
            })     
        }     
    })
    .catch(err => next(err))
}

exports.profile = (req, res, next)=>{
    let id = req.params.id
    let user = req.session.user    
    Promise.all([model.findById(user), Item.find({author: user}),watchList.find({userID:user}).populate('tradeId'), Item.find({ tradeOffered: true }),
    tradeModel.find({ tradeOfferedBy: user })])
    .then(results=>{    
        const [user, trades,watchList, tradeOffered, offerTrades] = results
        res.render("./user/profile", {user,trades,tradeOffered,offerTrades,watchList})
    })
    .catch(err=>next(err))
}

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err)
       else
            res.redirect('/')  
    })
 }
 
