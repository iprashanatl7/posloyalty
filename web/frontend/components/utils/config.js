export const config = {
  apiKey: process.env.SHOPIFY_API_KEY || "8824f0738a172d86f8b79c85d14f2210",
  host: new URLSearchParams(location.search).get("host"),
};
