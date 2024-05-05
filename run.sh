#/bin/bash 

echo "[PRE-INIT] Setting up NVM"
source $NVM_DIR/nvm.sh

echo "[PRE-INIT] Overview NPM packages"
npm ls

echo "[INIT] Starting server"
npm run start