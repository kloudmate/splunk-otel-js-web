<p align="center">
  <a href="https://github.com/signalfx/kloudmate-otel-js-web/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/signalfx/kloudmate-otel-js-web?include_prereleases&style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@kloudmate/otel-web-session-recorder">
    <img src="https://img.shields.io/npm/v/@kloudmate/otel-web-session-recorder?style=for-the-badge">
  </a>
  <img alt="GitHub Workflow Status (branch)" src="https://img.shields.io/github/actions/workflow/status/signalfx/kloudmate-otel-js-web/ci-main.yml?branch=main&style=for-the-badge">
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-informational?style=for-the-badge">
</p>

# Kloudmate Session Recorder

Kloudmate session recorder combines [rr-web](https://github.com/rrweb-io/rrweb) with [OpenTelemetry JavaScript for
Web](https://github.com/open-telemetry/opentelemetry-js)

> :construction: This project is currently in **BETA**. It is **officially supported** by Kloudmate. However, breaking changes **MAY** be introduced.

## Installation

### Via NPM package manager

Kloudmate session recorder can be installed via the `@kloudmate/otel-web-session-recorder` npm package:

```
npm install @kloudmate/otel-web-session-recorder
```

Then start the recording by importing the package and calling `KloudmateSessionRecorder.init`:

```js
import KloudmateSessionRecorder from '@kloudmate/otel-web-session-recorder'

// This must be called after initializing kloudmate rum
KloudmateSessionRecorder.init({
  realm: '<realm>',
  rumAccessToken: '<auth token>'
});
```
