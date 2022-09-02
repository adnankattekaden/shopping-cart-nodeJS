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
  let totalAmount = 0
  if (products.length > 0){
    totalAmount = await userHelper.getTotalAmount(req.session.user._id)
  }
  
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
  res.render('user/place-order',{totalAmount,user:req.session.user})
})

router.post('/place-order',verifyLogin, async (req,res)=>{

  let products = await userHelper.getCartProductList(req.body.userId)
  let totalAmount = await userHelper.getTotalAmount(req.body.userId)

  userHelper.placeOrder(req.body,products,totalAmount).then((orderId)=>{

    if (req.body['payment-method'] == 'COD' ){
      res.json({codSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,totalAmount).then((response)=>{
        res.json(response)
      })
    }
    
  })
  
})

router.get('/order-success',verifyLogin,(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',verifyLogin,async (req,res)=>{
  let orders = await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let products = await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})

router.post('/verify-payment',verifyLogin,(req,res)=>{
  console.log(req.body)
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:'Payment Failed'})
  })

})



module.exports = router;
