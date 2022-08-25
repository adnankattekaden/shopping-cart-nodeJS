var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedin) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', { user, products })
  })
});

router.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }

})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response)
  })
})


router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.loggedin = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = true
      console.log(req.session.loginErr)
      res.redirect('/login')
    }

  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

router.get('/cart',verifyLogin, async(req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  console.log(products);
  res.render('user/cart',{products,user:req.session.user})
})


router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })

})





module.exports = router;
