FROM node:12.14.0-buster-slim

RUN mkdir /app
WORKDIR /app
COPY package*.json ./

RUN if [ "$NODE_ENV" = "production" ]; \
    then npm install --only=production; \
    else npm install \
    && npm install -g nodemon \
    fi;

RUN npm audit fix

COPY . .
