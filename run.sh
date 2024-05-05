#/bin/bash 

echo "[PRE-INIT] Setting up NVM"
if [ -z "$NVM_DIR" ]; then
    source $NVM_DIR/nvm.sh
fi

echo "[PRE-INIT] Overview NPM packages"
npm ls

echo "[INIT] Starting server"
npm run start