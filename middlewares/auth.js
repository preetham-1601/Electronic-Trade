const Item = require('../models/item');


//check if user is a guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }else {
         req.flash('error', 'You are logged in already');
         return res.redirect('/users/profile');
     }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) =>{
    if(req.session.user){
        return next();
    }else {
         req.flash('error', 'You need to log in first');
         return res.redirect('/users/login');
     }
};

//check if user is author of the item
exports.isAuthor = (req, res, next) =>{
    let id = req.params.id;
    Item.findById(id)
    .then(item=>{
        if(item) {
            if(item.author == req.session.user) {
                return next();
            } else {
                req.flash('error', 'Unauthorized Access');
                return res.redirect('back');
            }
        } else {
            let err = new Error('Cannot find a connection with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};
