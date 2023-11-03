const { json } = require("express")
const model = require("../models/item")
const watchModel = require("../models/watch")
const tradeModel = require("../models/trade")

exports.index = (req, res, next) => {
  model.find()
  .then((trades) => res.render("./trade/main", { trades }))
  .catch((err) => next(err))
}

exports.new = (req, res) => {
  res.render("./trade/createTrade")
}

exports.create = (req, res, next) => {
  let trade = new model(req.body)
  trade.author = req.session.user
  trade.offerName = ""
  trade.Saved = false
  trade.tradeOffered = false
  trade.Status = "Available"
  trade.save()
    .then((trade) => {
      req.flash("success", "Story has been created successfully")
      res.redirect("/trades")
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message)
        return res.redirect("back")
      }
      next(err)
    })
}

exports.watch = (req, res, next) => {
  let userId = req.session.user
  let tradeId = req.params.id
  model.findOne({title:userId,author:tradeId})
  .then(trade => {
    console.log(trade)
    if(!trade){
      const watchModelList = new watchModel({userID:userId,tradeId:tradeId})
      watchModelList.save()
      .then((tradeItem) => {
        console.log(tradeItem)
        req.flash('success', 'This trade is added to watchList')
        res.redirect('/trades/'+tradeId);
      })
      .catch(err => {
        req.flash('error', 'Failed to add trade to watchlist')
        next(err)
    })
    }
    else{
      req.flash('success', 'This trade is already watchlisted.')
      res.redirect('/trades/'+tradeId);
    }
  })
  .catch(err => {
    req.flash('error', 'Failed to add trade to watchlist')
    next(err)
})
}

exports.unWatch = (req, res, next) => {
  let id = req.params.id
  model.findByIdAndUpdate(id, { Saved: false })
    .then((trade) => {
        watchModel.findOneAndDelete({ userID: req.session.user },{ useFindAndModify: false })
        .then((save) => {
            req.flash("success", "trade unwatched")
            res.redirect("back")
        })
        .catch((err) => {
            next(err)
        })
    })
    .catch((err) => {
        next(err)
    })
}

exports.show = (req, res, next) => {
  let id = req.params.id
  let user = req.session.user
  model.findById(id).populate("author", "firstName lastName")
  .then((trade) => {
    if (trade) {
      watchModel.findOne({ userID : user, tradeId : id })
      .then((tradeItem) => {
        let watched = false
        if(tradeItem){
          watched = true
        }
        else{
          watched = false
        }
      return res.render("./trade/displyTrade", { trade,watched })
      })
      .catch(err => {
        req.flash('error', 'Failed to add trade to watchlist')
        next(err);
    })
    } else {
      let err = new Error("Cannot find a trade with id " + id)
      err.status = 404
      next(err)
    }
  })
  .catch(err => {
    if (err.name === 'ValidationError') {
        err.status = 400;
        req.flash('error', err.message)
        res.redirect('back') 
    }
    next(err);
});
}

exports.edit = (req, res, next) => {
  let id = req.params.id
  model
    .findById(id)
    .then((trade) => {
      return res.render("./trade/editTrade", { trade })
    })
    .catch((err) => next(err))
}

exports.update = (req, res, next) => {
  let trade = req.body
  let id = req.params.id
  model
    .findByIdAndUpdate(id, trade, {
      useFindAndModify: false,
      runValidators: true,
    })
    .then((trade) => {
      return res.redirect("/trades/" + id)
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message)
        return res.redirect("/back")
      }
      next(err)
    })
}

exports.delete = (req, res, next) => {
  let id = req.params.id
  model
    .findByIdAndDelete(id, { useFindAndModify: false })
    .then((trade) => {
      if (trade) {
        watchModel
          .deleteMany({ tradeId: req.params.id })
          .then((tradeList) => {
            req.flash("success", "Trade has been deleted successfully")
            res.redirect("/trades")
          })
          .catch((err) => next(err))
      } else {
        let err = new Error("Cannot find a trade with id " + req.params.id)
        err.status = 404
        next(err)
      }
    })
    .catch((err) => next(err))
}

exports.startTrading = (req, res, next) => {
  let user = req.session.user
  id = req.params.id
  model.findByIdAndUpdate(id,{ Status: "Offer Pending", tradeOffered: true },{  useFindAndModify: false,  runValidators: true})
  .then((trade) => {
    let newOfferItem = new tradeModel({
      Name: trade.title,
      Status: "Offer Pending",
      Category: trade.category,
      tradeOfferedBy: user,
    })
    newOfferItem.save()
    .then((offer) => {
      model.find({ author: user })
        .then((trades) => {
          res.render("./trade/startTrade", { trades})
        })
        .catch((err) => {
          next(err)
        })
    })
    })
    .catch((err) => {
      next(err)
    })
    .catch((err) => {
      next(err)
    })
}

exports.onTrading = (req, res, next) => {
  let id = req.params.id
  let user = req.session.user
  Promise.all([model.findByIdAndUpdate(id,{ Status: "Offer Pending" },{useFindAndModify: false,runValidators: true}),tradeModel.findOne({ tradeOfferedBy: user})])
    .then((results) => {
      const [trade, tradeOffered] = results
      let name = tradeOffered.Name
      model.findByIdAndUpdate(id,{ offerName: name },{useFindAndModify: false,runValidators: true})
        .then((trade) => {
          req.flash("success", "Offer has been created")
          res.redirect("/users/profile")
        })
        .catch((err) => {
          next(err)
        })
    })
    .catch((err) => {
      next(err)
    })
}

exports.manage = (req, res, next) => {
  let id = req.params.id
  let user = req.session.user
  model.findById(id)
  .then((trade) => {
    if (trade.offerName === "") {
      let name = trade.title
     model.find({ offerName: name })
        .then((offer) => {
          console.log("offer in offerManage",offer)
          res.render("./trade/manage", {offer})
        })
        .catch((err) => {
          next(err)
        })
    } else {
      let name = trade.offerName
      Promise.all([tradeModel.findOneAndDelete({ Name: name }),model.findOneAndUpdate({ Name: name },{ Status: "Available", Offered: false })])
        .then((offer) => {
          console.log("offer in offerManage",offer)
          res.render("./trade/manageOffer", { trade, offer })
        })
        .catch((err) => {next(err)})
    }
  })
  .catch((err) => {
    next(err)
  })
}

exports.accept = (req, res, next) => {
  let id = req.params.id
  model.findByIdAndUpdate(id,{ Status: "Traded" },{useFindAndModify: false, runValidators: true})
  .then((trade) => {
    let name = trade.offerName
    Promise.all([model.findOneAndUpdate({ title: name},{ Status: "Traded"},{useFindAndModify: false,runValidators: true}),
      tradeModel.findOneAndDelete({ Name: name },{ useFindAndModify: false })])
      .then((results) => {
        req.flash("success", "Trade has been accepted and updated.")
        res.redirect("/users/profile")
      })
      .catch((err) => {
        next(err)
      })
  })
  .catch((err) => {next(err)})
}

exports.reject = (req, res, next) => {
  let id = req.params.id
  model.findByIdAndUpdate(id,{ Status: "Available", offerName: "" },{useFindAndModify: false,runValidators: true})
    .then((trade) => {
      let name = trade.offerName
      Promise.all([
        model.findOneAndUpdate({ title: name },{ Status: "Available", tradeOffered: false },{useFindAndModify: false,runValidators: true}),tradeModel.findOneAndDelete({ Name: name })])
        .then((results) => {
          const [trade, offer] = results
          let name = trade.Name
          let status = trade.Status
          if (trade.Saved) {
            save_model.findOneAndUpdate({ Name: name },{ Status: status },{useFindAndModify: false,runValidators: true})
              .then((save) => {})
              .catch((err) => {
                next(err)
              })
          }
          req.flash("success", "Trade rejected")
          res.redirect("/users/profile")
        })
        .catch((err) => {
          next(err)
        })
    })
    .catch((err) => {
      next(err)
    })
}

exports.cancel = (req, res, next) => {
  let id = req.params.id
  model.findByIdAndUpdate(id,{ Status: "Available", tradeOffered: false },{useFindAndModify: false,runValidators: true})
    .then((trade) => {
      let name = trade.title
      console.log(trade.title)
      Promise.all([model.findOneAndUpdate({ offerName: name },{ Status: "Available", offerName: "" }),
        tradeModel.findOneAndDelete({ Name: name },{ useFindAndModify: false })])
        .then((results) => {
          console.log("deleted trade offer:",results)
          req.flash("success", "You have cancelled this offer!")
          res.redirect("/users/profile")
        })
        .catch((err) => {
          next(err)
        })
    })
    .catch((err) => {
      next(err)
    })
}

