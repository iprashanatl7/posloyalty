import createApp from "@shopify/app-bridge";
import { Cart } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

export const addcustomertocart = (customerData) => {
  const host1 = new URLSearchParams(location.search).get("host");
  console.log({ host1 });

  const config = {
    apiKey: "e2f25f121d53b3855ff03984e211d242",
    host: new URLSearchParams(location.search).get("host"),
    shopOrigin: "mytestforpos.myshopify.com",
  };

  const app = createApp(config);
  var cart = Cart.create(app);
  cart.subscribe(Cart.Action.UPDATE, function (payload) {
    console.log("[Client] cart update", payload);
  });

  app
    .getState()
    .then((state) => {
      console.info("App State: %o", state);
    })
    .catch((error) => {
      alert(error);
    });

  // var customerPayload = {
  //   id: 6703290515774,
  // };
  var customerPayload = {
    email: "voisin@gmail.com",
    firstName: "Sandrine",
    lastName: "Voisin",
    note: "First customer of 2019",
  };

  var unsubscriber = cart.subscribe(Cart.Action.UPDATE, function (payload) {
    console.log("[Client] setCustomer", payload);
    unsubscriber();
  });

  cart.dispatch(Cart.Action.SET_CUSTOMER, {
    data: customerPayload,
  });

  // const unsubscribe1 = app.subscribe(Features.ActionType.UPDATE, function () {
  //   console.log("inside features check1");
  //   app.featuresAvailable(Group.Cart).then((features) => {
  //     const hasFetchCart = features.Cart[Cart.Action.FETCH];
  //     console.log("inside features check2");
  //     if (hasFetchCart) {
  //       console.log("inside features check3");
  //       unsubscribe();
  //       const cart = Cart.create(app);
  //       cart.subscribe(AppBridge.Cart.Action.UPDATE, (payload) => {
  //         console.log({ cart: { payload } });
  //       });
  //       cart.dispatch(Cart.Action.FETCH);
  //     }
  //   });
  // });

  // var unsubscriber = cart.subscribe(Cart.Action.FETCH, function (payload) {
  //   console.log("[Client] fetchCart", payload);
  //   unsubscriber();
  // });
  // cart.dispatch(Cart.Action.FETCH);

  // var lineItemPayload = {
  //   variantId: "1234",
  //   quantity: 1,
  // };

  // var unsubscriber = cart.subscribe(Cart.Action.UPDATE, function (payload) {
  //   console.log("[Client] addLineItem", payload);
  //   unsubscriber();
  // });

  // cart.dispatch(Cart.Action.ADD_LINE_ITEM, {
  //   data: lineItemPayload,
  // });

  // var unsubscriber = cart.subscribe(Cart.Action.UPDATE, function (payload) {
  //   console.log("[Client] fetchCart", payload);
  //   unsubscriber();
  // });
  // cart.dispatch(Cart.Action.FETCH);
};
