$(document).ready(function () {


    $('.displayCart ').on('click', function () {

        popCart();
        $('.overlay ').show();
        $('.myCart ').show();
        $('body').css("overflow", "hidden");
    })

    function popCart() {
        var cartItems = JSON.parse(localStorage.cart);

        if (cartItems.length) {
            cartItems.forEach(function (item) {
                $('.cartListing ').append(``);
                /*$('.cartListing ').append(`<li><i class="fas fa-shopping-cart"></i> ${JSON.stringify(item.name + " " + item.model + "/" + item.color + "/" + item.size + "/" + item.price)}</li>`);*/

            });
        } else {
            $('.cartListing ').append(`<div style="position: relative; display: flex; flex-direction: column; justify-content: center; margin: auto; text-align: center;">
<i class="fas fa-warning-exclamation"></i>
<h3 style="display:flex;">Cart Is Empty</h3>
</div>`);
        }


    };


    /*Add to cart*/
    var qty = 0;

    $('.addToCart ').on('click', function (e) {
        $addToCart = $(e.currentTarget);
        var data = $addToCart.attr('data-id');
        data = JSON.parse(data);
        getQty(data);
    });

    function getQty(data) {
        qty = Number(prompt("Enter required quantity"));
        /*console.log("qty", qty);*/
        if (isNaN(qty) || qty === 0) {
            alert('Please enter a valid figure.');
            return false;
        } else {

            if (localStorage.cart) {
                data.qty = qty;
                cart = JSON.parse(localStorage.cart);
                cart.push(data);
                localStorage.cart = JSON.stringify(cart);
            } else {
                data.qty = qty;
                localStorage.cart = JSON.stringify([data]);
            }

            alert("Added to cart!");
        }
    }
});
