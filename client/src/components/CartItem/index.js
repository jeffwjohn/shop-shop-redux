import React from "react";
import { idbPromise } from "../../utils/helpers";
import { useStoreContext } from "../../utils/GlobalState";
import { REMOVE_FROM_CART, UPDATE_CART_QUANTITY } from "../../utils/actions";

const CartItem = ({ item }) => {
  const [, dispatch] = useStoreContext();
  // This component currently gets all of its data as props passed down from Cart. That won't change, but now CartItem will also update the global state to adjust item quantities. Note that we only destructured the dispatch() function from the useStoreContext Hook, because the CartItem component has no need to read state.
  const removeFromCart = item => {
    dispatch({
      type: REMOVE_FROM_CART,
      _id: item._id
    });
    idbPromise('cart', 'delete', { ...item });
  };

  const onChange = (e) => {
    const value = e.target.value;

    if (value === '0') {
      dispatch({
        type: REMOVE_FROM_CART,
        _id: item._id
      });
    
      idbPromise('cart', 'delete', { ...item });
    } else {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: item._id,
        purchaseQuantity: parseInt(value)
      });
    
      idbPromise('cart', 'put', { ...item, purchaseQuantity: parseInt(value) });
    }
  };

  return (
    <div className="flex-row">
      <div>
        <img src={`/images/${item.image}`} alt="" />
      </div>
      <div>
        <div>
          {item.name}, ${item.price}
        </div>
        <div>
          <input
            type="number"
            placeholder="1"
            value={item.purchaseQuantity}
            onChange={onChange}
            />
            {/* This will also clear up the error that React was throwing earlier, because the onChange handler means that the value of this element can now potentially change and is no longer read-only. Test this out in the browser by adding an item to the cart and then typing a new number in the <input> element. Doing so will automatically update the total dollar amount, because the parent Cart component re-renders whenever the global state is updated. */}
          <span
            role="img"
            aria-label="trash"
            onClick={() => removeFromCart(item)}
          >
            🗑️
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

// 0.chunk.js:45521 Warning: Failed prop type: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
//     in input (at CartItem/index.js:16)
//     in div (at CartItem/index.js:14)
//     in div (at CartItem/index.js:12)
//     in div (at CartItem/index.js:5)
//     in CartItem (at Cart/index.js:42)
//     in div (at Cart/index.js:40)
//     in div (at Cart/index.js:36)
//     in Cart (at Detail.js:109)
//     in Detail (created by Context.Consumer)
//     in Route (at App.js:39)
//     in Switch (at App.js:34)
//     in StoreProvider (at App.js:32)
//     in div (at App.js:31)
//     in Router (created by BrowserRouter)
//     in BrowserRouter (at App.js:30)
//     in ApolloProvider (at App.js:29)
//     in App (at src/index.js:9)
//     in StrictMode (at src/index.js:8)
