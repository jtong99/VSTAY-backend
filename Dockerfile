FROM node:12.14.0-buster-slim

RUN mkdir /app
WORKDIR /app
COPY package*.json ./

RUN npm install \
    && npm install -g nodemon 

RUN npm audit fix

COPY . .
