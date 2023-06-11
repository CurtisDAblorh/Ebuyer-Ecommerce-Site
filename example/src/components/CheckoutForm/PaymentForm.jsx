import React from 'react';
import {Typography, Button, Divider} from '@material-ui/core';
import {Elements, CardElement, ElementsConsumer} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import Review from './Review';

const stripePromise= loadStripe("pk_test_51NHpywJt7l5enro4eaGXtJxA3mfPjDNuJ347qopqnd4ZymrZW2vMZsj1ZhmwZBlThZjYndgsdjnT57iVtgGhFWd900zx6C6q6m");
const PaymentForm = ({checkoutToken, backStep, shippingData, onCaptureCheckout, nextStep, timeout}) => {
  const handleSubmit=async (event, elements, stripe) => {
        event.preventDefault();
        if(!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        const {error, paymentMethod} = await stripe.createPaymentMethod({type: 'card', card: cardElement});

        if(error){
          console.log(error);
        } else {
          const orderData={
            
              line_items: checkoutToken.line_items,
              customer: {firstname: shippingData.firstname, lastname: shippingData.lastname,},
              shipping: {
                name: 'Primary',
               street:shippingData.address1, 
               town_city:shippingData.city,
              county_state: shippingData.shippingSubdivision, 
              postal_zip_code: shippingData.zip,
              country: shippingData.shippingCountry,
              },

              fulfilment: {shipping_method: shippingData.shippingOption},
              payment:{
                gateway: 'stripe', 
                stripe: {
                  payment_method_id: paymentMethod.id
                }


              }

          }
                onCaptureCheckout(checkoutToken.id, orderData);
                timeout();
                nextStep();
        }
  };



  return (
<>


<Review checkoutToken={checkoutToken}/>
<Divider/>
<Typography variant="h6" gutterBottom style={{margin:'20px 0'}}>Payment Method</Typography>
<Elements stripe={stripePromise}>
    <ElementsConsumer>
      {({elements, stripe})=>(
          <form onSubmit={(e)=>handleSubmit(e, elements, stripe)}>
          <CardElement/>
          <br/> <br />
          <div style={{display:'flex', justifyContent: 'space-between'}}>
            <Button variant="outlined" onClick={backStep}> Back</Button>
            <Button type="submit" variant="contained" disabled={!stripe} color="primary"> 
            Pay {checkoutToken.subtotal.formatted_with_symbol}
            </Button>
          </div>

          </form>

      )}
    </ElementsConsumer>
</Elements>
</>  );
};

export default PaymentForm;