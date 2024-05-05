FROM ubuntu:latest

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN nvm install 18
RUN nvm use 18

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start"]