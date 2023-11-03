const express = require('express')
const controller = require('../controllers/tradeController')
const {isLoggedIn,  istradeOfferedBy, isAuthor} = require('../middlewares/auth')
const{validateId, validateStory} = require('../middlewares/validator')

const router = express.Router()

//send all trades : /trades
router.get('/',controller.index)

//send html page for creating new trades : /trades/new
router.get('/createTrade', isLoggedIn, controller.new)

//POST /stories: create a new story
router.post('/', isLoggedIn, validateStory, controller.create)

//GET /stories/:id: send details of story identified by id
router.get('/:id', validateId, controller.show)

//GET /stories/:id/edit: send html form for editing an exising story
router.get('/:id/edit', validateId, isLoggedIn, isAuthor,  controller.edit)

//PUT /stories/:id update the story identified by id
router.put('/:id', validateId, isLoggedIn, isAuthor, validateStory, controller.update)

//DELETE /stories/:id, delete the story identified by id
router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete)

//POST to add the item to watch List
router.post('/:id/watch',validateId, isLoggedIn, controller.watch)

//delete(cancel) the offer created
router.delete("/:id/cancel",validateId,isLoggedIn,controller.cancel)

//get request to start the trade
router.get("/:id/startTrading", validateId,isLoggedIn, controller.startTrading)

//get the items available for trading
router.get("/:id/onTrading",validateId,isLoggedIn, controller.onTrading)

//get request for manage
router.get("/:id/manage", validateId,isLoggedIn, controller.manage)

//get for the accepting the offer
router.get("/:id/accept", validateId,isLoggedIn, controller.accept)

//get for the rejecting the offer
router.get("/:id/reject", validateId,isLoggedIn, controller.reject)

//delete the watch(unwatch feature)
router.delete("/:id/unWatch",validateId,isLoggedIn,controller.unWatch);

module.exports = router