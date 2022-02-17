
import {legacyConversionToHtml} from '../../src/restricted/legacy';

describe('legacy conversions', () => {
  it('safe HTML conversion with no options', () => {
    expect(legacyConversionToHtml('<html><script>alert(0)</script></html>')
               .toString())
        .toEqual('<html><script>alert(0)</script></html>');
    expect(legacyConversionToHtml('<anything>at>all').toString())
        .toEqual('<anything>at>all');
  });
  it('report-only conversion: inactive HTML', () => {
    const collectedReports: string[] = [];

    expect(legacyConversionToHtml('<html><b>hi</b></html>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<html><b>hi</b></html>');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([
      '{"type":"HEARTBEAT"}', '{"type":"H_ESCAPE"}'
    ])
  });
  it('report-only conversion: plaintext', () => {
    const collectedReports: string[] = [];

    expect(legacyConversionToHtml('hi', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('hi');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([
      '{"type":"HEARTBEAT"}'
    ])
  });
  it('report-only conversion: reports getting sent doesn\'t crash', () => {
    expect(legacyConversionToHtml('<html><b>hi</b></html>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 1.0,
             heartbeatRate: 1.0,
           }).toString())
        .toEqual('<html><b>hi</b></html>');
  });
  it('report-only conversion: low sampling rate', () => {
    const collectedReports: string[] = [];

    expect(legacyConversionToHtml('<script>alert(0)</script>', {
             reportingId: 'legacy_conversion_unit_test',
             samplingRate: 0.0,
             heartbeatRate: 0.0,
             sendReport: (_, data) => collectedReports.push(data)
           }).toString())
        .toEqual('<script>alert(0)</script>');

    expect(collectedReports.map(assertAndClearHostname)).toEqual([])
  });
});

function assertAndClearHostname(report: string): any {
  const parsed = JSON.parse(report) as any;
  expect(parsed['host']).toBeTruthy();
  delete parsed['host'];
  return JSON.stringify(parsed);
}
