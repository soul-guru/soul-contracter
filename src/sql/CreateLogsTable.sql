CREATE TABLE IF NOT EXISTS vm_contracts_logs
(
    e_name String,
    e_message String,
    e_time DateTime,
    when_do String,
    bot String,
    contract_id String
)
    ENGINE = MergeTree
    PARTITION BY toStartOfDay(e_time)
    ORDER BY (e_time)
    SETTINGS index_granularity = 8192;
