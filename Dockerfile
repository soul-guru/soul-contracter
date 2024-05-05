FROM arm64v8/node:18-buster

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "start"]