
SELECT * FROM param_values_history
    PREWHERE (param_id,time) IN (
        SELECT param_id, max(max_time)
        FROM last_positions GROUP BY param_id
    );
