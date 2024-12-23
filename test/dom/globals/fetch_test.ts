/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {unwrapHtml} from '../../../src/internals/html_impl';
import {createResourceUrlInternal} from '../../../src/internals/resource_url_impl';
import {unwrapScript} from '../../../src/internals/script_impl';
import {unwrapStyleSheet} from '../../../src/internals/style_sheet_impl';

import {fetchResourceUrl} from '../../../src/dom/globals/fetch';

function dummyResource(contentType: string, content: string) {
  return createResourceUrlInternal(
    `data:${contentType},${encodeURIComponent(content)}`,
  );
}

describe('fetchResourceUrl', () => {
  it('should fail if the content type is incorrect', async () => {
    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/plain', 'something')).then(
          (v) => v.script(),
        );
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/html', 'something')).then(
          (v) => v.script(),
        );
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/css', 'something')).then(
          (v) => v.script(),
        );
      })(),
    ).toBeRejected();
  });

  it('should return the right content if the content type is correct', async () => {
    const value = unwrapScript(
      await fetchResourceUrl(
        dummyResource('text/javascript', 'something'),
      ).then((v) => v.script()),
    ).toString();
    expect(value).toEqual('something');
  });

  it('should work even with a specified charset', async () => {
    const value = unwrapScript(
      await fetchResourceUrl(
        dummyResource('text/javascript; charset=utf-8', 'something'),
      ).then((v) => v.script()),
    ).toString();
    expect(value).toEqual('something');
  });

  it('should work case insensitively', async () => {
    const value = unwrapScript(
      await fetchResourceUrl(
        dummyResource('text/javascript', 'something'),
      ).then((v) => v.script()),
    ).toString();
    expect(value).toEqual('something');
  });
});

describe('fetchStyleSheet', () => {
  it('should fail if the content type is incorrect', async () => {
    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/plain', 'something')).then(
          (v) => v.styleSheet(),
        );
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(
          dummyResource('application/javascript', 'something'),
        ).then((v) => v.styleSheet());
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/html', 'something')).then(
          (v) => v.styleSheet(),
        );
      })(),
    ).toBeRejected();
  });

  it('should return the right content if the content type is correct', async () => {
    const value = unwrapStyleSheet(
      await fetchResourceUrl(dummyResource('text/css', 'some css')).then((v) =>
        v.styleSheet(),
      ),
    ).toString();
    expect(value).toEqual('some css');
  });

  it('should work even with a specified charset', async () => {
    const value = unwrapStyleSheet(
      await fetchResourceUrl(
        dummyResource('text/css; charset=utf-8', 'some css'),
      ).then((v) => v.styleSheet()),
    ).toString();
    expect(value).toEqual('some css');
  });

  it('should work case insensitively', async () => {
    const value = unwrapStyleSheet(
      await fetchResourceUrl(dummyResource('Text/Css', 'some css')).then((v) =>
        v.styleSheet(),
      ),
    ).toString();
    expect(value).toEqual('some css');
  });
});

describe('fetchHtml', () => {
  it('should fail if the content type is incorrect', async () => {
    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/plain', 'something')).then(
          (v) => v.html(),
        );
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(dummyResource('text/css', 'something')).then(
          (v) => v.html(),
        );
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(
          dummyResource('text/javascript', 'something'),
        ).then((v) => v.html());
      })(),
    ).toBeRejected();

    await expectAsync(
      (async function shouldFail() {
        await fetchResourceUrl(
          dummyResource('application/javascript', 'something'),
        ).then(async (v) => v.html());
      })(),
    ).toBeRejected();
  });

  it('should return the right content if the content type is correct', async () => {
    const value = unwrapHtml(
      await fetchResourceUrl(dummyResource('text/html', 'some html')).then(
        (v) => v.html(),
      ),
    ).toString();
    expect(value).toEqual('some html');
  });

  it('should work case insensitively', async () => {
    const value = unwrapHtml(
      await fetchResourceUrl(dummyResource('text/html', 'some html')).then(
        (v) => v.html(),
      ),
    ).toString();
    expect(value).toEqual('some html');
  });

  it('should work even with a specified charset', async () => {
    const value = unwrapHtml(
      await fetchResourceUrl(
        dummyResource('text/html; charset=utf8', 'some html'),
      ).then((v) => v.html()),
    ).toString();
    expect(value).toEqual('some html');
  });
});
