/*
 * @license
 * Copyright 2021 Google LLC

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     https://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {concatScripts, script, scriptFromJson, scriptWithArgs} from '../../src/builders/script_builders';

describe('script_builders', () => {
  describe('script', () => {
    it('can build a simple script', () => {
      expect(script`return this;`.toString()).toEqual('return this;');
    });

    it('rejects any interpolation', () => {
      const castScript = script as (arr: TemplateStringsArray, str: string) =>
                             TrustedScript;
      expect(() => castScript`return ${'this'};`).toThrowError();
    });
  });

  describe('concatScripts', () => {
    it('concatenates `TrustedScript` values', () => {
      const script1 = script`1;`;
      const script2 = script`2;`;
      expect(concatScripts([script1, script2]).toString()).toEqual('1;2;');
    });
  });

  describe('scriptFromJson', () => {
    it('should serialize as JSON', () => {
      const json = scriptFromJson(
          {'a': 1, 'b': (() => 'unserializable') as unknown as string});
      expect(json.toString()).toEqual('{"a":1}');
    });

    it('escapes < signs', () => {
      const json = scriptFromJson('<script></script>');
      expect(json.toString()).toEqual('"\\x3cscript>\\x3c/script>"');
    });
  });

  describe('scriptWithArgs', () => {
    it('can build a simple script with arguments',
       () => {
         expect(scriptWithArgs`function (a, b, c) {
  console.log(a, b, c);
}`(['hello', 123, null], 'test',
   {'key': 'value'}).toString())
             .toEqual(`(function (a, b, c) {
  console.log(a, b, c);
})(["hello",123,null],"test",{"key":"value"})`);
       });

    it('escapes < signs', () => {
      expect(scriptWithArgs`alert`('</script</script').toString())
          .toEqual(`(alert)("\\x3c/script\\x3c/script")`);
    });

    it('rejects any interpolation', () => {
      const castScriptWithArgs =
          scriptWithArgs as (arr: TemplateStringsArray, str: string) =>
              (arg: string) => TrustedScript;
      expect(() => castScriptWithArgs`${'console.log'}`('test')).toThrowError();
    });

    it('allows inline comments', () => {
      expect(scriptWithArgs`function (a) {${/* Just a simple comment */ ''}
  console.log(a);
}`('arg').toString())
          .toEqual(`(function (a) {
  console.log(a);
})("arg")`);
    });
  });
});
