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
router.get('/', async function (req, res, next) {

  let user = req.session.user
  let cartCount = null
  // console.log(user)
  if (user){
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  
  productHelper.getAllProducts().then((products)=>{
    console.log(cartCount);
    res.render('user/view-products',{products,user,cartCount})
  })

  });

router.get('/login', (req, res) => {
    if (req.session.loggedin){
      res.redirect('/')
    } else{
      res.render('user/login', { "loginErr": req.session.loginErr })
      req.session.loginErr = false
    }

})

router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedin = true
      req.session.user = response.user
      // console.log(req.session,'heyyyy')
      res.redirect('/')
    } else {
      req.session.loginErr = true
      res.redirect('/login')
    }
  })

})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    res.redirect('/login')
  })
})




router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  let totalAmount = await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/cart', {user:req.session.user,products:products,totalAmount:totalAmount })
})


router.get('/add-to-cart/:id',(req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({status:true})
  })

})


router.post('/change-product-quantity',(req,res)=>{

  userHelper.changeProductQuantity(req.body).then(async(response)=>{

    response.total = await userHelper.getTotalAmount(req.body.user)

    res.json(response)

  })
})


router.get('/place-order',verifyLogin, async (req,res)=>{
  let totalAmount = await userHelper.getTotalAmount(req.session.user._id)
  console.log(totalAmount)
  res.render('user/place-order',{totalAmount})
})




module.exports = router;
