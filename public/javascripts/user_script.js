function addToCart(productId) {
    $.ajax({
      url: '/add-to-cart/' + productId,
      method: 'get',
      success: (response) => {
        if (response.status) {
          let count = $('#cart-count').html()
          count = parseInt(count) + 1
          console.log(count)
          $('#cart-count').html(count)
        }

      }
    })
  }


  function changeQuantity(cartId, productId,userId,count) {
    let quantity = parseInt(document.getElementById(productId).innerHTML)
    count = parseInt(count)
    
    $.ajax({
      url: '/change-product-quantity',
      method: 'POST',
      data: {
      user:userId,
      cart: cartId,
      product: productId,
      count: count,
      quantity:quantity
      },
      success: (response)=>{
        if (response.removeProduct){
          alert('product removed from cart')
          location.reload()
        }else{
          document.getElementById(productId).innerHTML = quantity + count
          document.getElementById('totalAmnt').innerHTML = response.total
        }
      }
    })
  }