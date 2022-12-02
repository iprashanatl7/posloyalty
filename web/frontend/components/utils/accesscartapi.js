import { useAuthenticatedFetch } from "../../hooks";

export default accesscartapi = () => {
  console.log("fetch cart details");
  const fetch = useAuthenticatedFetch();
  fetch(window.Shopify.routes.root + "cart.js")
    .then((res) => res.json())
    .then((data) => console.log(data));
};
