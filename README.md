# Soul Contract Engine

<img src="https://i.ibb.co/gPqCvrh/Background.png" align="right"
alt="Size Limit logo by Anton Lovchikov" width="80" height="80">

**SOUL CE** is a set of tools for running custom scripts in an isolated environment. Completely isolated environment. Soul CE can understand contracts in vanilla JavaScript. The contract execution environment is higher in the hierarchy than SOUL Essent, since without CE the raison d'être of Essent is lost

![NodeJS](https://img.shields.io/badge/nodejs-%237F52FF.svg?style=for-the-badge&logo=typescript&logoColor=white)

<br/>

## Call principles ☝️
- CE dependent project, stores information in database, creates memory area, short term, long term, V8 memory
- CE is obliged to run any contract as isolated as possible
- CE is required to report everything that happens in the system

### Get started
##### Install as binary 

```shell
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

nvm install 18
nvm use 18

# Install this code
git clone https://github.com/soul-guru/soul-contracter

cd soul-contracter

npm install

ts-node src/main.ts serve --vmec --vmec-up-start-up --http --use-example-contract
```

But, why nvm? Answer: your system can be ARM/AMD and nvm can install node special for your system architecture.

##### Install though Docker
```shell
docker pull masloffvs/soul-ce:main
```
 