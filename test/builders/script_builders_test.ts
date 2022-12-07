/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {concatScripts, safeScript, safeScriptWithArgs, valueAsScript} from '../../src/builders/script_builders';
import {SafeScript} from '../../src/internals/script_impl';

describe('script_builders', () => {
  describe('safeScript', () => {
    it('can build a simple script', () => {
      expect(safeScript`return this;`.toString()).toEqual('return this;');
    });

    it('rejects any interpolation', () => {
      const castSafeScript =
          safeScript as (arr: TemplateStringsArray, str: string) => SafeScript;
      expect(() => castSafeScript`return ${'this'};`).toThrowError();
    });
  });

  describe('concatScripts', () => {
    it('concatenates `SafeScript` values', () => {
      const script1 = safeScript`1;`;
      const script2 = safeScript`2;`;
      expect(concatScripts([script1, script2]).toString()).toEqual('1;2;');
    });
  });

  describe('valueAsScript', () => {
    it('should serialize as JSON', () => {
      const json = valueAsScript(
          {'a': 1, 'b': (() => 'unserializable') as unknown as string});
      expect(json.toString()).toEqual('{"a":1}');
    });

    it('escapes < signs', () => {
      const json = valueAsScript('<script></script>');
      expect(json.toString()).toEqual('"\\u003Cscript>\\u003C/script>"');
    });
  });

  describe('safeScriptWithArgs', () => {
    it('can build a simple script with arguments',
       () => {
         expect(safeScriptWithArgs`function (a, b, c) {
  console.log(a, b, c);
}`(['hello', 123, null], 'test',
   {'key': 'value'}).toString())
             .toEqual(`(function (a, b, c) {
  console.log(a, b, c);
})(["hello",123,null],"test",{"key":"value"})`);
       });

    it('escapes < signs', () => {
      expect(safeScriptWithArgs`alert`('</script</script').toString())
          .toEqual(`(alert)("\\u003C/script\\u003C/script")`);
    });

    it('rejects any interpolation', () => {
      const castSafeScriptWithArgs =
          safeScriptWithArgs as (arr: TemplateStringsArray, str: string) =>
              (arg: string) => SafeScript;
      expect(() => castSafeScriptWithArgs`${'console.log'}`('test'))
          .toThrowError();
    });

    it('allows inline comments', () => {
      expect(safeScriptWithArgs`function (a) {${/* Just a simple comment */ ''}
  console.log(a);
}`('arg').toString())
          .toEqual(`(function (a) {
  console.log(a);
})("arg")`);
    });
  });
});
