import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import CustomerHomePage from "../components/poscomponents/CustomerHomePage";

export default function HomePage() {
  const host1 = new URLSearchParams(location.search).get("host");
  console.log({ host1 });
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
