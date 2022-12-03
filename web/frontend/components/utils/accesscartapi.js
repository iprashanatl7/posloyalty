import { useAuthenticatedFetch } from "../../hooks";

export const accesscartapi = () => {
  console.log("fetch cart details");
  const fetch = useAuthenticatedFetch();
  fetch(window.Shopify.routes.root + "cart.js")
    .then((res) => res.json())
    .then((data) => console.log(data));
};
