FROM debian:latest

# NVM environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 18

# Create NVM directory
RUN mkdir -p /usr/local/nvm

# Install dependencies
RUN apt update && apt upgrade -y 
RUN apt install -y wget curl 

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH


# Apply bashrc
RUN source /root/.bashrc

# Load NVM
RUN export NVM_DIR="$HOME/.nvm" 
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
RUN [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start"]