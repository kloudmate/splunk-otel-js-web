/*
Copyright 2024 Splunk Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { diag } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NOOP_ATTRIBUTES_TRANSFORMER, NATIVE_XHR_SENDER, NATIVE_BEACON_SENDER, SplunkExporterConfig } from './common';
import { IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

export class SplunkOTLPTraceExporter extends OTLPTraceExporter {
  protected readonly _onAttributesSerializing: SplunkExporterConfig['onAttributesSerializing'];
  protected readonly _xhrSender: SplunkExporterConfig['xhrSender'] = NATIVE_XHR_SENDER;
  protected readonly _beaconSender: SplunkExporterConfig['beaconSender'] = typeof navigator !== 'undefined' && navigator.sendBeacon ? NATIVE_BEACON_SENDER : undefined;
  private readonly rumAccessToken: string;

  constructor(options: SplunkExporterConfig) {
    super(options);
    this._onAttributesSerializing = options.onAttributesSerializing || NOOP_ATTRIBUTES_TRANSFORMER;
    this.rumAccessToken = options.rumAccessToken as string;
  }

  convert(spans: ReadableSpan[]): IExportTraceServiceRequest {
    // Changes: Add attribute serializing hook to remove data before export
    spans = spans.map(span => {
      // @ts-expect-error Yep we're overwriting a readonly property here. Deal with it
      span.attributes = this._onAttributesSerializing ? this._onAttributesSerializing(span.attributes, span) : span.attributes;
      return span;
    });

    return super.convert(spans);
  }

  send(
    items: ReadableSpan[],
    onSuccess: () => void,
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }
    const serviceRequest = this.convert(items);
    const body = JSON.stringify(serviceRequest);

    // Changed: Determine which exporter to use at the time of export
    if (document.hidden && this._beaconSender && body.length <= 64000) {
      this._beaconSender(this.url, body, { type: 'application/json' });
    } else {
      this._xhrSender!(this.url, body, {
        // These headers may only be necessary for otel's collector,
        // need to test with actual ingest
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.rumAccessToken,
        ...this.headers,
      });
    }

    onSuccess();
  }
}