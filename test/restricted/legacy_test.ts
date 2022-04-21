
// Disabling formatting of these imports so we can use LINE-INTERNAL to strip
// out the sanitizer import from the OSS version
// clang-format off
import {legacyUnsafeHtml} from '../../src/restricted/legacy';
// clang-format on

describe('legacy conversions', () => {
  it('safe HTML conversion with no options', () => {
    expect(
        legacyUnsafeHtml('<html><script>alert(0)</script></html>').toString())
        .toEqual('<html><script>alert(0)</script></html>');
    expect(legacyUnsafeHtml('<anything>at>all').toString())
        .toEqual('<anything>at>all');
  });

  it('report-only conversion: inactive HTML', () => {
    const collectedReports: string[] = [];

    expect(legacyUnsafeHtml('<html><b>hi</b></html>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<html><b>hi</b></html>');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([
      '{"type":"HEARTBEAT"}',
      '{"type":"H_ESCAPE"}',
    ]);
  });

  it('report-only conversion: plaintext', () => {
    const collectedReports: string[] = [];

    expect(legacyUnsafeHtml('hi', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('hi');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([
      '{"type":"HEARTBEAT"}',
    ]);
  });

  it('report-only conversion: reports getting sent doesn\'t crash', () => {
    expect(legacyUnsafeHtml('<html><b>hi</b></html>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
           }).toString())
        .toEqual('<html><b>hi</b></html>');
  });

  it('report-only conversion: low sampling rate', () => {
    const collectedReports: string[] = [];

    expect(legacyUnsafeHtml('<script>alert(0)</script>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 0.0,
             heartbeatRate: 0.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<script>alert(0)</script>');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([]);
  });

  it('report-only conversion: using global sampling rates', () => {
    const collectedReports: string[] = [];

    expect(legacyUnsafeHtml('<script>alert(0)</script>', {
             reportingId: '0_any_id',
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<script>alert(0)</script>');

    expect(legacyUnsafeHtml('<script>alert(0)</script>', {
             reportingId: 'z_any_id',
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<script>alert(0)</script>');
  });
});

function assertAndClearHostname(report: string): unknown {
  const parsed = JSON.parse(report) as {[key: string]: unknown};
  expect(parsed['host']).toBeTruthy();
  expect(parsed['host']).toBeInstanceOf(String);
  delete parsed['host'];
  return JSON.stringify(parsed);
}
