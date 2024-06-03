/*
Copyright 2021 Kloudmate Inc.

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

import { SpanAttributes } from '@opentelemetry/api';
import { expect } from 'chai';
import KloudmateRum from '../src';
import { updateSessionStatus } from '../src/session';

describe('KloudmateOtelWeb', () => {
  afterEach(() => {
    KloudmateRum.deinit();
  });

  describe('global attributes', () => {
    it('should be settable via constructor and then readable', () => {
      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>',
        globalAttributes: {
          key1: 'value1',
        },
      });
      expect(KloudmateRum.getGlobalAttributes()).to.deep.eq({
        key1: 'value1',
      });
    });

    it('should be patchable via setGlobalAttributes and then readable', () => {
      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>',
        globalAttributes: {
          key1: 'value1',
          key2: 'value2',
        },
      });

      KloudmateRum.setGlobalAttributes({
        key2: 'value2-changed',
        key3: 'value3',
      });

      expect(KloudmateRum.getGlobalAttributes()).to.deep.eq({
        key1: 'value1',
        key2: 'value2-changed',
        key3: 'value3',
      });
    });

    it('should notify about changes via setGlobalAttributes', async () => {
      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>',
        globalAttributes: {
          key1: 'value1',
          key2: 'value2',
        },
      });

      let receivedAttributes: SpanAttributes | undefined;
      KloudmateRum.addEventListener(
        'global-attributes-changed',
        ({ payload }) => {
          receivedAttributes = payload.attributes;
        },
      );

      KloudmateRum.setGlobalAttributes({
        key2: 'value2-changed',
        key3: 'value3',
      });

      // Wait for promise chain to resolve
      await Promise.resolve();

      expect(receivedAttributes).to.deep.eq({
        key1: 'value1',
        key2: 'value2-changed',
        key3: 'value3',
      });
    });
  });

  describe('session ID', () => {
    it('should be readable', () => {
      expect(KloudmateRum.getSessionId()).to.eq(undefined);

      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>'
      });
      expect(KloudmateRum.getSessionId()).to.match(/[0-9a-f]{32}/);

      KloudmateRum.deinit();
      expect(KloudmateRum.getSessionId()).to.eq(undefined);
    });

    it('should produce notifications when updated', async () => {
      let sessionId: string | undefined;

      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>'
      });
      KloudmateRum.addEventListener(
        'session-changed',
        (ev) => { sessionId = ev.payload.sessionId; },
      );

      document.body.click();
      updateSessionStatus();

      // Wait for promise chain to resolve
      await Promise.resolve();

      expect(sessionId).to.match(/[0-9a-f]{32}/);
    });
  });

  describe('.inited', () => {
    it('should follow lifecycle', () => {
      expect(KloudmateRum.inited).to.eq(false, 'Should be false in the beginning.');

      KloudmateRum.init({
        applicationName: 'app-name',
        beaconEndpoint: 'https://beacon',
        rumAccessToken: '<token>'
      });
      expect(KloudmateRum.inited).to.eq(true, 'Should be true after creating.');

      KloudmateRum.deinit();
      expect(KloudmateRum.inited).to.eq(false, 'Should be false after destroying.');
    });
  });
});
