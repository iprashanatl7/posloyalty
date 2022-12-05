#FROM node:18-alpine
FROM --platform=linux/amd64 node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ARG SHOPIFY_API_SECRET
ENV SHOPIFY_API_SECRET=$SHOPIFY_API_SECRET
ARG SCOPES
ENV SCOPES=$SCOPES
ARG HOST
ENV HOST=$HOST

ENV PORT=8081
EXPOSE 8081

WORKDIR /app
COPY web .
RUN npm install
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
