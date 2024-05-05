curl --location 'http://localhost:911/contracts/signal' \
--header 'Content-Type: application/json' \
--data '{
    "signalId": "shell",
    "signalProps": "Привет!",
    "botId": "9"
}'