FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .

RUN /bin/bash npm install

CMD [ "npm", "start"]