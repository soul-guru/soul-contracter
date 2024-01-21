"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const exporter_zipkin_1 = require("@opentelemetry/exporter-zipkin");
const sdk = new sdk_node_1.NodeSDK({
    traceExporter: new exporter_zipkin_1.ZipkinExporter({
        url: "http://170.130.55.120:9411/api/v2/spans",
        serviceName: "i2-contracter-node",
    }),
    metricReader: new sdk_metrics_1.PeriodicExportingMetricReader({
        exporter: new sdk_metrics_1.ConsoleMetricExporter(),
    }),
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
});
sdk.start();
//# sourceMappingURL=instrumentation.js.map