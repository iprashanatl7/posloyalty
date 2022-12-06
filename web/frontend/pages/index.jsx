import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import CustomerHomePage from "../components/poscomponents/CustomerHomePage";
import createApp from "@shopify/app-bridge";
import { config } from "../components/utils/config";
import { Cart, Toast } from "@shopify/app-bridge/actions";

export default function HomePage() {
  let cartData;
  const app = createApp(config);
  let cart = Cart.create(app);
  let unsubscriber = cart.subscribe(Cart.Action.UPDATE, function (payload) {
    console.log("[Client] fetchCart", payload);
    cartData = payload;
    unsubscriber();
  });

  cart.dispatch(Cart.Action.FETCH);
  console.log(cartData);

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
          <CustomerHomePage />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
