
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

});
