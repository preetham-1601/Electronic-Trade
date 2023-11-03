const express = require("express")
const controller = require("../controllers/mainController")

const router = express.Router()


router.get('/', controller.index)

router.get('/index',controller.index)

router.get('/about',controller.about)

router.get('/contact',controller.contact)

router.get("/contact", (req, res) => {
  res.render("contact")
})

module.exports = router
