import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ConsoleSpanExporter,
  InMemorySpanExporter,
} from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

// Create an instance of OpenTelemetry Node.js SDK
const sdk = new NodeSDK({
  // Configure the trace exporter with Zipkin
  traceExporter: new ZipkinExporter({
    url: "http://170.130.55.120:9411/api/v2/spans", // Replace with your Zipkin server URL
    serviceName: "i2-contracter-node", // Specify your service name
  }),

  // Configure the metric reader with periodic exporting to console
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),

  // Enable auto-instrumentations for Node.js
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the OpenTelemetry SDK
sdk.start();
