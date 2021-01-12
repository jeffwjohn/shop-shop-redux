import React, { useEffect } from 'react';
import { idbPromise } from "../../utils/helpers";
import { useStoreContext } from '../../utils/GlobalState';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { useQuery } from '@apollo/react-hooks';

import ProductItem from "../ProductItem";
import { QUERY_PRODUCTS } from "../../utils/queries";
import spinner from "../../assets/spinner.gif"



function ProductList() {
// function ProductList({ currentCategory }) {
//   const { loading, data } = useQuery(QUERY_PRODUCTS);

//   const products = data?.products || [];

//   function filterProducts() {
//     if (!currentCategory) {
//       return products;
//     }

//     return products.filter(product => product.category._id === currentCategory);
//   }
const [state, dispatch] = useStoreContext();

const { currentCategory } = state;

const { loading, data } = useQuery(QUERY_PRODUCTS);

useEffect(() => {
  // if there's data to be stored
  if (data) {
    // let's store it in the global state object
    dispatch({
      type: UPDATE_PRODUCTS,
      products: data.products
    });

    // but let's also take each product and save it to IndexedDB using the helper function 
    data.products.forEach((product) => {
      idbPromise('products', 'put', product);
    });
      // add else if to check if `loading` is undefined in `useQuery()` Hook
    } else if (!loading) {
      // since we're offline, get all of the data from the `products` store
      idbPromise('products', 'get').then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);

function filterProducts() {
  if (!currentCategory) {
    return state.products;
  }

  return state.products.filter(product => product.category._id === currentCategory);
}

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
            {filterProducts().map(product => (
                <ProductItem
                  key= {product._id}
                  _id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  quantity={product.quantity}
                />
            ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      { loading ? 
      <img src={spinner} alt="loading" />: null}
    </div>
  );
}

export default ProductList;

// Again, we immediately execute the useStoreContext() function to retrieve the current global state object and the dipatch() method to update state. We then destructure the currentCategory data out of the state object so we can use it in the filterProducts() function.

// We then implement the useEffect() Hook in order to wait for our useQuery() response to come in. Once the data object returned from useQuery() goes from undefined to having an actual value, we execute our dispatch() function, instructing our reducer function that it's the UPDATE_PRODUCTS action and it should save the array of product data to our global store. When that's done, useStoreContext() executes again, giving us the product data needed display products to the page.

// Lastly, we need to update the code in the return statement to use state.products.length instead of products.length, since we are now retrieving products from the state object