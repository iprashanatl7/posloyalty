#!/bin/bash

# Login to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
# Eg: aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 923801260899.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t $IMAGE_URI:$TAG --build-arg SHOPIFY_API_KEY=$SHOPIFY_API_KEY --build-arg SHOPIFY_API_SECRET=$SHOPIFY_API_SECRET --build-arg SCOPES=$SCOPES --build-arg HOST=$HOST .

# Push image to ECR
docker push $IMAGE_URI:$TAG

# Deploy
aws ecs update-service --cluster shopify_reg_app_cluster --service alo-yoga-shopify-reg-app-service --force-new-deployment --region $AWS_REGION