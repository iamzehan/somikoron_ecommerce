'use strict';

let cart = (JSON.parse(localStorage.getItem('cart')) || []);

const cartDOM = document.querySelector('.cart');
const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');

if (cart.length > 0) {
    cart.forEach(cartItem => {
        const product = cartItem;

        cartDOM.insertAdjacentHTML('beforeend', `
                      <div class="cart__item">
                        <img class="cart__item__image" src="${product.image}" alt="${product.name}">
                        <h3 class="cart__item__name">${product.name}</h3>
                        <h3 class="cart__item__price">${product.price}</h3>
                        <button class="btn btn--primary btn--small${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_ITEM">&minus;</button>
                        <h3 class="cart__item__quantity">${product.quantity}</h3>
                        <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
                        <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
                      </div>
                    `);

        addToCartButtonsDOM.forEach(addToCartButtonDOM => {
            const productDOM = addToCartButtonDOM.parentNode;

            if (productDOM.querySelector('.product__name').innerText === product.name) {
                addToCartButtonDOM.innerText = 'In Cart';
                addToCartButtonDOM.disabled = true;

                const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
                cartItemsDOM.forEach(cartItemDOM => {
                    if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {

                        cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => {
                            cart.forEach(cartItem => {
                                if (cartItem.name === product.name) {
                                    cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
                                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
                                    localStorage.setItem('cart', JSON.stringify(cart));
                                }
                            });
                        });

                        cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => {
                            cart.forEach(cartItem => {
                                if (cartItem.name === product.name) {
                                    if (cartItem.quantity > 1) {
                                        cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                                        localStorage.setItem('cart', JSON.stringify(cart));
                                    } else {
                                        cartItemDOM.classList.add('cart__item--removed');
                                        setTimeout(() => cartItemDOM.remove(), 250);
                                        cart = cart.filter(cartItem => cartItem.name !== product.name);
                                        localStorage.setItem('cart', JSON.stringify(cart));
                                        addToCartButtonDOM.innerText = 'Add To Cart';
                                        addToCartButtonDOM.disabled = false;
                                    }

                                    if (cartItem.quantity === 1) {
                                        cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
                                    }
                                }
                            });
                        });

                        cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => {
                            cart.forEach(cartItem => {
                                if (cartItem.name === product.name) {
                                    cartItemDOM.classList.add('cart__item--removed');
                                    setTimeout(() => cartItemDOM.remove(), 250);
                                    cart = cart.filter(cartItem => cartItem.name !== product.name);
                                    localStorage.setItem('cart', JSON.stringify(cart));
                                    addToCartButtonDOM.innerText = 'Add To Cart';
                                    addToCartButtonDOM.disabled = false;
                                }
                            });
                        });

                    }
                });
            }
        });

    });
}

addToCartButtonsDOM.forEach(addToCartButtonDOM => {
    addToCartButtonDOM.addEventListener('click', () => {
        const productDOM = addToCartButtonDOM.closest(".cartable");
        const product = {
            image: productDOM.querySelector('.product__image').getAttribute('src'),
            name: productDOM.querySelector('.product__name').innerText,
            title: productDOM.querySelector('.product__title').innerText,
            price: productDOM.querySelector('.product__price').innerText,
            quantity: 1,
        };

        const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

        if (!isInCart) {
            cartDOM.insertAdjacentHTML('beforeend', `
                            <div class="cart__item">
                              <img class="cart__item__image" src="${product.image}" alt="${product.name}">
                              <h3 class="cart__item__name">${product.name}</h3>
                              <h3 class="cart__item__price">${product.price}</h3>
                              <button class="btn btn--primary btn--small btn--danger${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_ITEM">&minus;</button>
                              <h3 class="cart__item__quantity">${product.quantity}</h3>
                              <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
                              <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
                            </div>
                            <tr style="width: 300px !important; " >
                                <td colspan="3" style=" padding-bottom: 0px; width: 300px !important;" >${product.name}
                                    <a style="float: right" >
                                        <i class="fas fa-trash"
                                           style="padding-right: 0px !important; font-size: 15px !important; color:#cd0d0d; " ></i >
                                    </a >
                                </td >
                            </tr >
                            <tr style="border-bottom:1pt solid lightgray;">
                                <th scope="col" ><img style="width: 50px;" src="${product.image}" alt="" ></th >
                                <th scope="col" style="padding-bottom: 18px; text-align: center">
                                    <button class="btn  btn-small" style="padding: 0px 5px; background-color: #c3e6cb" data-action="INCREASE_ITEM" >&plus;</button >
                                    <span class="cart__item__quantity font-weight-bold" >${product.quantity}</span >
                                    <button class="btn  btn-small" style="padding: 0px 5px;background-color: #fadc8c " data-action="DECREASE_ITEM">&minus;</button>
                                </th >
                                <th scope="col" style="text-align: right; padding-bottom: 22px">Tk. <span class="cart__item__price">${product.price}</span></th >
                            </tr >
                          `);

            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            addToCartButtonDOM.innerText = 'In Cart';
            addToCartButtonDOM.disabled = true;

            const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
            cartItemsDOM.forEach(cartItemDOM => {
                if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {

                    cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => {
                        cart.forEach(cartItem => {
                            if (cartItem.name === product.name) {
                                cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
                                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
                                localStorage.setItem('cart', JSON.stringify(cart));
                            }
                        });
                    });

                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => {
                        cart.forEach(cartItem => {
                            if (cartItem.name === product.name) {
                                if (cartItem.quantity > 1) {
                                    cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                                    localStorage.setItem('cart', JSON.stringify(cart));
                                } else {
                                    cartItemDOM.classList.add('cart__item--removed');
                                    setTimeout(() => cartItemDOM.remove(), 250);
                                    cart = cart.filter(cartItem => cartItem.name !== product.name);
                                    localStorage.setItem('cart', JSON.stringify(cart));
                                    addToCartButtonDOM.innerText = 'Add To Cart';
                                    addToCartButtonDOM.disabled = false;
                                }

                                if (cartItem.quantity === 1) {
                                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
                                }
                            }
                        });
                    });

                    cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => {
                        cart.forEach(cartItem => {
                            if (cartItem.name === product.name) {
                                cartItemDOM.classList.add('cart__item--removed');
                                setTimeout(() => cartItemDOM.remove(), 250);
                                cart = cart.filter(cartItem => cartItem.name !== product.name);
                                localStorage.setItem('cart', JSON.stringify(cart));
                                addToCartButtonDOM.innerText = 'Add To Cart';
                                addToCartButtonDOM.disabled = false;
                            }
                        });
                    });

                }
            });
        }
    });
});



    $(document).ready(function () {
        $("#quickviewbtn").on("click", function(){
            var pid=$(this).closest('.product-select').children('#demotitle').val();
            $.ajax({
                url: '/getquickview/',
                type: 'POST',
                data: {
                    'productid': pid,
                },
                success: function (data) {

                }
            });
           `<div class="modal-content" >
                <div class="modal-header" style="text-align: center; padding: 5px" >
                    <div class="text-center" style="float: left; " >
                        <h6 class="modal-title" id="exampleModalLongTitle" >Brahman Bull-051</h6 >
                    </div >
                    <div style="float: right" >
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" >
                            <span aria-hidden="true" >&times;</span >
                        </button >
                    </div >
                </div >
                <div class="modal-body" >
                    <div class="shop-detail" >
                        <div class="row" style="height: 530px;" >
                            <div class="col-12 col-lg-6" >
                                <div class="shop-detail_img" >
                                    <button class="round-icon-btn" id="zoom-btn" ><i class="icon_zoom-in_alt" ></i ></button >
                                    <div class="big-img" >
                                        {#                                    {% for  image in object.item.images.all %}#}
                                        <div class="big-img_block" ><img src="{% static 'assets/images/special_offer/c7.jpg' %}" alt="product image" >
                                        </div >
                                        <div class="big-img_block" ><img src="{% static 'assets/images/special_offer/c9.jpg' %}" alt="product image" >
                                        </div >
                                        <div class="big-img_block" ><img src="{% static 'assets/images/special_offer/c8.jpg' %}" alt="product image" >
                                        </div >
                                        {#                                    {% endfor %}#}
                                    </div >
                                    <div class="slide-img" >
                                        {#                                    {% for  image in object.item.images.all %}#}
                                        <div class="slide-img_block" ><img src="{% static 'assets/images/special_offer/c7.jpg' %}"
                                                                           alt="product image" >
                                        </div >
                                        <div class="slide-img_block" ><img src="{% static 'assets/images/special_offer/c9.jpg' %}"
                                                                           alt="product image" >
                                        </div >
                                        <div class="slide-img_block" ><img src="{% static 'assets/images/special_offer/c8.jpg' %}"
                                                                           alt="product image" >
                                        </div >
                                        {#                                    {% endfor %}#}
                                    </div >
                                </div >
                                <div class="img_control" ></div >
                            </div >
                            <div class="col-12 col-lg-6" >
                                <div class="shop-detail_info " >
                                    {#                                <h5 class="product-type color-type" >Oranges</h5 >#}
                                    {#                                <h2 class="product-name" >{{ object.item.title }}</h2 >#}
                                    {#                                <p class="product-describe" >{{ object.item.description|truncatewords:25 }} <a class="product-more"#}
                                    {#                                                                                                               href="#tab-1" >View more <i#}
                                    {#                                        class="arrow_carrot-2right" ></i ></a ></p >#}
                                    <p class="delivery-status" >Free delivery</p >
                                    <div >
                                        <p class="product-describe" >
                                        <div >
                                            <div style="float: left" >Breed:</div >
                                            <div style="float: right" >{{ cattle.cattleinfo.Breed }}Brahman</div >
                                        </div >
                                        <br ><br >
                                        <div >
                                            <div style="float: left" >Height:</div >
                                            <div style="float: right" >{{ cattle.cattleinfo.height }}6.2 fit</div >
                                        </div >
                                        <br ><br >
                                        <div >
                                            <div style="float: left" >Live Weight:</div >
                                            <div style="float: right" >{{ cattle.cattleinfo.live_weight }}650 KG</div >
                                        </div >
                                        <br ><br >
                                        <div >
                                            <div style="float: left" >Expected Weight:</div >
                                            <div style="float: right" >{{ cattle.cattleinfo.expected_weight }}680 KG</div >
                                        </div >
                                        <br >
                                        </p >
                                    </div >
                                    <p style="font-size: 14px" >
                                        Brahmans are intermediate in size among beef breeds. Bulls will generally weigh from 1600 to 2200 pounds and
                                        cows from 1000 to 1400 pounds in average condition. The calves are small at birth, weighing 60 to 65 pounds,
                                        but grow very rapidly and wean at weights comparable to other breeds.
                                    </p >
                                    <div class="price-rate" >
                                        <h3 class="product-price" >
                                            <del >Tk 150000</del >
                                            Tk 140000
                                        </h3 >
                                        <h5 class="product-rated" ><i class="icon_star" ></i ><i class="icon_star" ></i ><i
                                                class="icon_star" ></i ><i class="icon_star" ></i ><i
                                                class="icon_star-half" ></i ><span >(15)</span ></h5 >
                                    </div >
                                    {#                                    <div class="color-select" >#}
                                    {#                                        <h5 >Select Color:</h5 ><a class="color bg-danger" href="#" ></a ><a class="color bg-success"#}
                                    {#                                                                                                             href="#" ></a ><a#}
                                    {#                                            class="color bg-info" href="#" ></a >#}
                                    {#                                    </div >#}
                                    <div class="quantity-select" style="margin-bottom: 20px" >
                                        <label for="quantity" >Quatity:</label >
                                        <input class="no-round-input" id="quantity" type="number" min="0" value="1" >{{ object.unit }}
                                    </div >
                                    <div class="product-select" style="text-align: center" >
                                        <a class="add-to-cart normal-btn outline" href="{{ object.item.get_add_to_cart_url }}" style="width: 100%" >Add
                                                                                                                                                    to
                                                                                                                                                    Cart</a >
                                        {#                                    <br ><a href="{{ object.item.get_remove_from_cart_url }}" > remove</a >#}
                                    </div >
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
                <div class="modal-footer" style="padding: 7px" >
                    <div class="product-share text-left" style="float: left; width: 85%" >
                        <span >Share link:</span >&nbsp; &nbsp;
                        <a href="#" ><i class="fab fa-facebook-f" > </i ></a >&nbsp;&nbsp;
                        <a href="#" ><i class="fab fa-twitter" ></i ></a >&nbsp;&nbsp;
                        <a href="#" ><i class="fab fa-invision" > </i ></a >&nbsp;&nbsp;
                        <a href="#" ><i class="fab fa-pinterest-p" ></i ></a >&nbsp;&nbsp;
                    </div >
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" >Close</button >
                    {#                <button type="button" class="btn btn-primary" >Save changes</button >#}
                </div >
            </div >`
            $("#quickViewModal").modal("show");
        });


        $("#quickViewModal").on('shown.bs.modal', function () {
            {
                alert('The modal is fully shown.');

            }
            $('.slide-img, .big-img').slick('setPosition').slick();

        });
    });
