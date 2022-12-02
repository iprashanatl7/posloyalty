import { Shopify } from "@shopify/shopify-api";

const CREATE_CUSTOMER_MUTATION = `
    mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
            customer {
            firstName,
            lastName,
            phone,
            email,
            acceptsMarketing
            }
        }
    }
`;

export default async function customerCreator(session, customerData) {
  console.log("customer - create function");
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  try {
    await client.query({
      data: {
        query: CREATE_CUSTOMER_MUTATION,
        variables: {
          input: {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            phone: customerData.phone,
            email: customerData.email,
            acceptsMarketing: true,
          },
        },
      },
    });
    console.log("Success creating customer");
  } catch (error) {
    console.log("error creating customer");
    if (error instanceof Shopify.Errors.GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
