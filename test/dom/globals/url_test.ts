/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {objectUrlFromSafeSource} from '../../../src/dom/globals/url';

describe('objectUrlFromSafeSource', () => {
  function buildBlobWithType(type: string) {
    return objectUrlFromSafeSource(new Blob(['test'], {type})).toString();
  }

  const objectUrlRegExp = /blob:(?:https?:\/\/.+\/)?[\w\d\-]+/;

  it('validates MIME types for blobs as expected', () => {
    expect(buildBlobWithType('image/jpg')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('image/png')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('image/heic')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('image/heif')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3')).toMatch(objectUrlRegExp);

    expect(buildBlobWithType('audio/mp3;foo=bar')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3;foo="bar"')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3;1="2";3=4')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3;1="2;3=4"')).toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3;1="2;3=";4=5'))
        .toMatch(objectUrlRegExp);
    expect(buildBlobWithType('audio/mp3;1="2;";3=5')).toMatch(objectUrlRegExp);

    expect(() => buildBlobWithType('image/jpg x')).toThrow();
    expect(() => buildBlobWithType('x image/jpg')).toThrow();
    expect(() => buildBlobWithType('image/jpg;x')).toThrow();
    expect(() => buildBlobWithType('image/jpg;x=')).toThrow();
    expect(() => buildBlobWithType('image/jpg;x="')).toThrow();

    expect(() => buildBlobWithType('text/html')).toThrow();
    expect(() => buildBlobWithType('application/javascript')).toThrow();
    expect(() => buildBlobWithType('text')).toThrow();
    expect(() => buildBlobWithType('')).toThrow();
    expect(() => buildBlobWithType('¯\\_(ツ)_/¯')).toThrow();
  });

  // MediaSource support in Safari is limited
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaSource#browser_compatibility
  if (typeof MediaSource !== 'undefined') {
    it('works with MediaSources', () => {
      expect(objectUrlFromSafeSource(new MediaSource()).toString())
          .toMatch(objectUrlRegExp);
    });

    it('works with a File', () => {
      expect(objectUrlFromSafeSource(new File(['my file content'], 'cat.jpg', {
               'type': 'image/jpg'
             })).toString())
          .toMatch(objectUrlRegExp);
    });

    it('cannot be bypassed with a cast', () => {
      expect(
          () => objectUrlFromSafeSource(
              buildBlobWithType('application/javascript') as unknown as Blob))
          .toThrow();
    });
  }
});
