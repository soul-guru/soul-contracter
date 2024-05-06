FROM debian:latest

# Create app directory
WORKDIR /usr/src/app

# Use changes to package.json to force Docker not to use the cache
# when we change our application’s nodejs dependencies:
COPY . .
COPY run.sh ./

# Make run.sh executable
RUN chmod +x /usr/src/app/run.sh

# This line for support 'source'
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# NVM environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 18

# Create NVM directory
RUN mkdir -p /usr/local/nvm

# Install dependencies
RUN apt update && apt upgrade -y 
RUN apt install -y wget curl make g++

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Relogin
SHELL ["/bin/bash", "--login", "-c"]

# Add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Create sym link
RUN ln -sf $NVM_DIR/versions/node/v$NODE_VERSION/bin/node /usr/bin/nodejs
RUN ln -sf $NVM_DIR/versions/node/v$NODE_VERSION/bin/node /usr/bin/node
RUN ln -sf $NVM_DIR/versions/node/v$NODE_VERSION/bin/npm /usr/bin/npm

# Environment variables
ENV I2_CLUSTER_FLOW=1
ENV VENDOR='Docker Image'
ENV DEVELOPER='Wireforce'

# confirm installation
RUN npm install -g yarn
RUN npm install
RUN npm ls

CMD /usr/src/app/run.sh