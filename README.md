# Soul Contract Engine

<img src="https://i.ibb.co/gPqCvrh/Background.png" align="right"
alt="Size Limit logo by Anton Lovchikov" width="80" height="80">

**SOUL CE** is a set of tools for running custom scripts in an isolated environment. Completely isolated environment. Soul CE can understand contracts in vanilla JavaScript. The contract execution environment is higher in the hierarchy than SOUL Essent, since without CE the raison d'être of Essent is lost

![NodeJS](https://img.shields.io/badge/nodejs-%237F52FF.svg?style=for-the-badge&logo=typescript&logoColor=white)

<br/>

## Module principles ☝️
- CE dependent project, stores information in database, creates memory area, short term, long term, V8 memory
- CE is obliged to run any contract as isolated as possible
- CE is required to report everything that happens in the system

### Get started
```shell
ts-node src/main.ts serve --vmec --vmec-up-start-up --http --use-example-contract

```
