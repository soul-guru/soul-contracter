FROM ubuntu:latest

# Install dependencies
RUN apt update && apt upgrade -y 
RUN apt install -y wget curl 

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN nvm install 18
RUN nvm use 18

# Load NVM
RUN export NVM_DIR="$HOME/.nvm" 
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
RUN [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start"]