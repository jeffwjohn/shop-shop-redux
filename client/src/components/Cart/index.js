import React, { useEffect } from "react";
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import CartItem from "../CartItem";
import Auth from "../../utils/auth";
import { useStoreContext } from "../../utils/GlobalState";
import "./style.css";
import { QUERY_CHECKOUT } from "../../utils/queries";
import { loadStripe } from "@stripe/stripe-js";
import { useLazyQuery } from '@apollo/react-hooks';

const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const Cart = () => {
  const [state, dispatch] = useStoreContext();
  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);

  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise("cart", "get");
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    }

    if (!state.cart.length) {
      getCart();
    }
  }, [state.cart.length, dispatch]);
  // You may wonder what happens if there's nothing to retrieve from the cached object store and state.cart.length is still 0. Does this useEffect() function just continuously run because of that? Well, it could very easily do that if we neglect to pass the state.cart.length value into useEffect()'s dependency array. That's the whole point of the dependency array. We list all of the data that this useEffect() Hook is dependent on to execute. The Hook runs on load no matter what, but then it only runs again if any value in the dependency array has changed since the last time it ran.
  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);
  // The Stripe documentation warns that you shouldn't rely on the success_url alone for fulfilling purchases. Malicious users could visit /success directly without paying for anything, or users might close the browser tab before Stripe is able to redirect to your website. Implementing a more robust solution is beyond the scope of this lesson, but it's worth reading over Stripe's documentation on confirming a successful payment to see what else is possible.

  function toggleCart() {
    dispatch({ type: TOGGLE_CART });
  }
  if (!state.cartOpen) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span role="img" aria-label="trash">
          🛒
        </span>
      </div>
    );
  }

  function calculateTotal() {
    let sum = 0;
    state.cart.forEach((item) => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

  console.log(state);

  function submitCheckout() {
    const productIds = [];
  
    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
      getCheckout({
        variables: { products: productIds }
      });      
    });
  }
  // Unfortunately, we can't call useQuery(QUERY_CHECKOUT) in the click handler function. The useQuery Hook is meant to run when a component is first rendered, not at a later point in time based on a user action like a button click. Apollo provides another Hook for this exact situation. The useLazyQuery Hook can be declared like any other Hook but won't actually execute until you tell it to. Let's implement this new Hook to call QUERY_CHECKOUT.
  
  //       // You should always wrap emojis (like the shopping cart icon) in a <span> element that includes role and aria-label attributes. Doing so will help screen readers understand the context of the emoji.
  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>
        [close]
      </div>
      <h2>Shopping Cart</h2>
      {state.cart.length ? (
        <div>
          {state.cart.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>
            {Auth.loggedIn() ? (
              <button onClick={submitCheckout}>Checkout</button>
            ) : (
              <span>(log in to check out)</span>
            )}
          </div>
        </div>
      ) : (
        <h3>
          <span role="img" aria-label="shocked">
            😱
          </span>
          You haven't added anything to your cart yet!
        </h3>
      )}
    </div>
  );
};

export default Cart;
