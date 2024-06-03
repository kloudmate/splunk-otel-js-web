/*
Copyright 2023 Kloudmate Inc.

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

const path = require('path');
const fs = require('fs');
const { render } = require('ejs');

const SPLUNK_RUM_TAGS_TEMPLATE = `
<script src="<%= file -%>"></script>
<script>
  window.KloudmateRum && window.KloudmateRum.init(<%- options -%>)
</script>
`;

const LIB_DISK_PATH = path.join(__dirname, '..', '..', 'dist', 'kloudmate-otel-web.js');
const LIB_PATH = '/bundles/kloudmate-rum';

async function handleKloudmateRumRequest(app) {
  app.get(LIB_PATH, (_, res) => {
    res.set({
      'Content-Type': 'text/javascript',
    });
    res.send(getKloudmateRumContent());
  });
}

function generateKloudmateRumTags () {
  const options = {
    beaconEndpoint: '/api/v2/spans',
    applicationName: 'kloudmate-otel-js-dummy-app',
    debug: false,
  };

  return render(SPLUNK_RUM_TAGS_TEMPLATE, {
    file: '/dist/artifacts/kloudmate-otel-web.js',
    options: JSON.stringify(options),
  });
}

function getKloudmateRumContent() {
  return fs.readFileSync(LIB_DISK_PATH);
}

module.exports = {
  handleKloudmateRumRequest,
  generateKloudmateRumTags,
  getKloudmateRumContent,
};
