// META: script=/resources/testdriver.js?feature=bidi
// META: script=/resources/testdriver-vendor.js
// META: script=/bluetooth/resources/bluetooth-test.js
// META: script=/bluetooth/resources/bluetooth-fake-devices.js
// META: timeout=long
'use strict';
const test_desc = 'getDevices() resolves with empty array if no device ' +
    'permissions have been granted.';

bluetooth_bidi_test(async () => {
  await navigator.bluetooth.test.simulateCentral({state: 'powered-on'});
  let devices = await navigator.bluetooth.getDevices();

  assert_equals(
      0, devices.length, 'getDevices() should resolve with an empty array');
}, test_desc);
