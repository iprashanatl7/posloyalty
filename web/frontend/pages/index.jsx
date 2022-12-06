import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import CustomerHomePage from "../components/poscomponents/CustomerHomePage";
import createApp from "@shopify/app-bridge";
import { config } from "../components/utils/config";
import { Cart, Toast } from "@shopify/app-bridge/actions";
import { useAppBridgeState } from "@shopify/app-bridge-react";
import { useNavigate } from "@shopify/app-bridge-react";

export default function HomePage() {
  const myCart = useAppBridgeState("cart");
  console.log("mycart:", myCart);
  let cartCustId;
  const app = createApp(config);
  let cart = Cart.create(app);
  const navigate = useNavigate();
  let unsubscriber = cart.subscribe(Cart.Action.UPDATE, function (payload) {
    console.log("[Client] fetchCart mycart", payload.data.customer.id);
    unsubscriber();
    cartCustId = payload.data.customer.id;
    const newRoute = `/editcustomer/?customerId=${cartCustId}`;
    navigate(newRoute);
  });

  cart.dispatch(Cart.Action.FETCH);
  if (cartCustId) {
    console.log("routing to next page");
    const newRoute = `/editcustomer/?customerId=${cartCustId}`;
    navigate(newRoute);
  }

  return (
    <Page narrowWidth>
      <TitleBar title="Add Loyalty Customer" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            {/*             <TextContainer spacing="loose">
              <Heading>Welcome to React Enabled Shopify POS App</Heading>
              <p> Get Ready to explore the features and capabilities</p>
            </TextContainer> */}
          </Card>
          <CustomerHomePage userId={cartCustId} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
