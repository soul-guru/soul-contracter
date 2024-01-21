CREATE TABLE IF NOT EXISTS vm_contracts_stdout
(
    stdout String,
    time DateTime,
    bot String,
    contract_id String
)
    ENGINE = MergeTree
    PARTITION BY toStartOfDay(time)
    ORDER BY (time)
    SETTINGS index_granularity = 8192;
