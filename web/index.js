// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations.js";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && {
    CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN],
  }),
});

// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );

  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get(`/api/customer/search/:searchtxt`, async (req, res) => {
    console.log("inside /api/customer/search/:searchtxt API");
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      let status = 200;
      let error = null;
      const { Customer } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );

      const query = req.params.searchtxt;
      if (query == null) {
        throw new Error("Bad request");
      }
      console.log(`Search text : ${query}`);
      const userData = await Customer.search({
        session: session,
        query: `*${query}*`,
      });
      if (userData == null) {
        throw new Error("Not Found");
      }
      var retVal = getCustomerInfo(userData);
      // console.log(`respose ---> ${JSON.stringify(retVal)}`);
      res.status(200).json({ success: status === 200, error, payload: retVal });
      console.log(`Search success, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process search: ${e.message}`);
      res.status(500).send(e.message);
    }
  });

  function getCustomerInfo(userData) {
    if (userData == null) {
      throw new Error("Not Found");
    }
    var customers = userData.customers;
    var retVal = {};
    var key = "customers";
    retVal[key] = [];
    for (var id in customers) {
      var data = {
        id: customers[id].id,
        first_name: customers[id].first_name,
        last_name: customers[id].last_name,
        phone: customers[id].phone,
        email: customers[id].email,
        marketing_opt_in_level: customers[id].marketing_opt_in_level,
        email_marketing_consent: customers[id].email_marketing_consent,
        loyalty_opt_in: {},
      };
      retVal[key].push(data);
    }
    return retVal;
  }

  app.post("/api/customer/create", async (req, res) => {
    console.log("inside create customer api");
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    console.log({ session });
    let status = 200;
    let error = null;
    console.log(req.body);
    let customerId;
    try {
      const { Customer } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );

      const customer = new Customer({ session });
      customer.first_name = req.body.firstName;
      customer.email = req.body.email;
      customer.phone = req.body.phone;
      customer.last_name = req.body.lastName;
      if (req.body.marketingInd) {
        customer.email_marketing_consent = {
          state: "subscribed",
          opt_in_level: "single_opt_in",
          consent_updated_at: new Date().toISOString(),
        };
      } else {
        customer.email_marketing_consent = {
          state: "not subscribed",
          opt_in_level: "single_opt_in",
          consent_updated_at: null,
        };
      }

      const result = await customer.save({
        update: true,
      });
      console.log("customer after save:", customer);
      console.log("customer id: ", customer.id);
      customerId = customer.id;
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }

    // try {
    //   result = await customerCreator(session, req.body);
    //   console.log({ result });
    // } catch (e) {
    //   console.log(`Failed to process products/create: ${e.message}`);
    //   status = 500;
    //   error = e.message;
    // }

    res
      .status(status)
      .json({ success: status === 200, error, payload: customerId });
  });

  app.get("/api/customer/getdata", async (req, res) => {
    console.log("inside get customer api");
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    console.log({ session });
    console.log("request query:", req.query);
    const userId = req.query.customerId;
    let status = 200;
    let error = null;
    console.log({ userId });
    let customerInfo = null;
    try {
      const { Customer } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );

      const customer = await Customer.find({
        session: session,
        id: userId,
      });

      customerInfo = customer;
      console.log({ customer });
    } catch (e) {
      console.log(`Failed to process customer/get: ${e.message}`);
      status = 500;
      error = e.message;
    }

    const customerData = {
      firstName: customerInfo?.first_name || " ",
      lastName: customerInfo?.last_name || "",
      email: customerInfo?.email || "",
      phone: customerInfo?.phone || "",
      id: customerInfo?.id || "",
      marketingInd: `${
        customerInfo?.email_marketing_consent.state === "subscribed"
          ? true
          : false
      }`,
      loyaltyInd: true,
    };

    res
      .status(status)
      .json({ success: status === 200, error, payload: customerData });
  });

  app.post("/api/customer/edit", async (req, res) => {
    console.log("inside edit customer api");
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    console.log({ session });
    console.log("request query:", req.query);
    let status = 200;
    let error = null;
    const userId = req.query.customerId;
    let customerInfo;
    try {
      const { Customer } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );

      const customer = await Customer.find({
        session: session,
        id: userId,
      });
      console.log("customer before save:", customer);

      customer.first_name = req.body.firstName;
      customer.email = req.body.email;
      customer.phone = req.body.phone;
      customer.last_name = req.body.lastName;
      if (req.body.marketingInd) {
        customer.email_marketing_consent = {
          state: "subscribed",
          opt_in_level: "single_opt_in",
          consent_updated_at: new Date().toISOString(),
        };
      } else {
        customer.email_marketing_consent = {
          state: "not subscribed",
          opt_in_level: "single_opt_in",
          consent_updated_at: null,
        };
      }

      const result = await customer.save({
        update: true,
      });
      console.log("customer after save:", customer);
      console.log("customer id: ", customer.id);

      console.log({ customer });
    } catch (e) {
      console.log(`Failed to process customer/get: ${e.message}`);
      status = 500;
      error = e.message;
    }

    res
      .status(status)
      .json({ success: status === 200, error, payload: userId });
  });

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      //res.status(500);
      res.status(404);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
