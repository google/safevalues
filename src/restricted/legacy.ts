/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../environment/dev';

import {htmlEscape} from '../builders/html_builders';
import {createHtml, SafeHtml} from '../internals/html_impl';
import {createResourceUrl, TrustedResourceUrl} from '../internals/resource_url_impl';
import {createScript, SafeScript} from '../internals/script_impl';
import {createStyle, SafeStyle} from '../internals/style_impl';
import {createStyleSheet, SafeStyleSheet} from '../internals/style_sheet_impl';
import {createUrl, SafeUrl} from '../internals/url_impl';



/*
 * Transitional utilities to unsafely trust random strings as
 * safe values. Intended for temporary use when upgrading a library that
 * used to accept plain strings to use safe values, but where it's not
 * practical to transitively update callers.
 *
 * IMPORTANT: No new code should use the conversion functions in this file,
 * they are intended for refactoring old code to use safe values. New code
 * should construct safe values via their APIs, template systems or
 * sanitizers. If that’s not possible it should use a reviewed conversion and
 * undergo security review.
 *
 * The semantics of the legacy conversions are very
 * different from the ones provided by reviewed conversions. The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code will always
 * satisfy the SafeHtml contract (e.g., the output of a secure HTML sanitizer).
 * In uses of legacy conversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the SafeHtml contract.
 *
 * There are only three valid uses of legacy conversions:
 *
 * 1. Introducing a safe values version of a function which currently consumes
 * string and passes that string to a DOM API which can execute script - and
 * hence cause XSS - like innerHTML. For example, Dialog might expose a
 * setContent method which takes a string and sets the innerHTML property of
 * an element with it. In this case a setSafeHtmlContent function could be
 * added, consuming SafeHtml instead of string. setContent could then internally
 *  use legacyUnsafeHtml to create a SafeHtml
 * from string and pass the SafeHtml to a safe values consumer down the line. In
 * this scenario, remember to document the use of legacyUnsafeHtml in the
 * modified setContent and consider deprecating it as well.
 *
 * 2. Automated refactoring of application code which handles HTML as string
 * but needs to call a function which only takes safe values types. For example,
 * in the Dialog scenario from (1) an alternative option would be to refactor
 * setContent to accept SafeHtml instead of string and then refactor
 * all current callers to use legacy conversions to pass SafeHtml. This is
 * generally preferable to (1) because it keeps the library clean of
 * legacy conversions, and makes code sites in application code that are
 * potentially vulnerable to XSS more apparent.
 *
 * 3. Old code which needs to call APIs which consume safe values types and for
 * which it is prohibitively expensive to refactor to use these types.
 * Generally, this is code where safety from XSS is either hopeless or
 * unimportant.
 */

/**
 * Options for configuring {@link legacyUnsafeHtml}.
 */
interface ReportingOptions {
  /**
   * A unique ID that identifies the callsite of a specific legacy conversion.
   * If this option is set, the legacy conversion becomes a report-only legacy
   * conversion that logs whether the callsite can be converted to a safer
   * alternative to the go/security-collector. See
   * go/report-only-safehtml-legacy-exemptions for more details on this design
   * and project.
   *
   * This is set via LSC and should not be manually changed.
   */
  reportingId: string;

  /**
   * Override {@link 0.001} for this specific
   * legacy conversion. It is generally not necessary to use this override
   * unless this legacy conversion is triggering a massive number of reports and
   * it is necessary to decrease the sampling rate to decrease the number of
   * reports.
   */
  samplingRate?: number;

  /**
   * Override {@link 0.01} for this specific
   * legacy conversion. It is generally not necessary to use this override
   * unless this legacy conversion is triggering a massive number of reports and
   * it is necessary to decrease the sampling rate to decrease the number of
   * reports.
   */
  heartbeatRate?: number;

  /**
   * Override for how reports associated with this legacy conversion will be
   * sent to the go/security-collector. It is generally not necessary to use
   * this override unless a caller needs to change how reports are collected
   * (e.g. choosing to collect them via a service's own collection
   * infrastructure).
   */
  sendReport?: (data: string, url: string) => void;
}

/**
 * Turns a string into SafeHtml for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeHtml(
    s: string, options?: ReportingOptions): SafeHtml {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  const legacySafeHtml = createHtml(s);
  if (!options || !isCallSampled(options)) {
    return legacySafeHtml;
  }
  try {
    maybeSendHeartbeat(options);
    isChangedByEscaping(s, options);
  } catch {
    // Our reporting code crashed! Swallow (but report) the error so that the
    // legacy conversion still works correctly no matter what.
    try {
      reportLegacyConversion(options, ReportingType.CRASHED);
    } catch {
      // Failed to send an error report! This should only happen if the security
      // collector is down, which we monitor for. There is nothing else we can
      // do at this point other than fail silently.
    }
  }
  return legacySafeHtml;
}

function isCallSampled(options: ReportingOptions): boolean {
  return Math.random() < (options.samplingRate ?? 0.001);
}

function maybeSendHeartbeat(options: ReportingOptions) {
  if (Math.random() < (options.heartbeatRate ?? 0.01)) {
    // Report a heartbeat signifying that the legacy conversion is being called
    reportLegacyConversion(options, ReportingType.HEARTBEAT);
  }
}

function isChangedByEscaping(s: string, options: ReportingOptions): boolean {
  if (htmlEscape(s).toString() !== s) {
    // The legacy conversion is being used with something other than plain
    // text
    reportLegacyConversion(options, ReportingType.HTML_CHANGED_BY_ESCAPING);
    return true;
  }
  return false;
}

/**
 * The type of the report
 */
enum ReportingType {
  // The type if the report signifies just that the legacy conversion was
  // called.
  HEARTBEAT = 'HEARTBEAT',

  // The type if the report signifies that the legacy conversion code crashed.
  CRASHED = 'CRASHED',

  // The type if the report signifies that escaping the input changed it.
  HTML_CHANGED_BY_ESCAPING = 'H_ESCAPE',

}

function reportLegacyConversion(
    options: ReportingOptions, type: ReportingType) {
  let sendReport = undefined;
  if (options.sendReport) {
    sendReport = options.sendReport;
  } else if (!!navigator.sendBeacon) {
    sendReport = (body: string, url: string) => navigator.sendBeacon(url, body);
  } else {
    sendReport = sendBeaconPolyfill;
  }
  sendReport(
      JSON.stringify({
        'host': window.location.hostname,
        'type': type,
      }),
      'https://csp.withgoogle.com/csp/lcreport/' + options.reportingId);
}

/**
 * A very naive polyfill for navigator.sendBeacon for browsers that don't
 * support navigator.sendBeacon.
 */
function sendBeaconPolyfill(body: string, url: string) {
  const req = new XMLHttpRequest();
  req.open('POST', url);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(body);
}

/**
 * Turns a string into SafeScript for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeScript(s: string): SafeScript {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  return createScript(s);
}

/**
 * Turns a string into TrustedResourceUrl for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeResourceUrl(s: string): TrustedResourceUrl {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  return createResourceUrl(s);
}

/**
 * Turns a string into SafeUrl for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeUrl(s: string): SafeUrl {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  return createUrl(s);
}

/**
 * Turns a string into SafeStyle for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeStyle(s: string): SafeStyle {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  return createStyle(s);
}

/**
 * Turns a string into SafeStyleSheet for legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 */
export function legacyUnsafeStyleSheet(s: string): SafeStyleSheet {
  if (process.env.NODE_ENV !== 'production' && typeof s !== 'string') {
    throw new Error('Expected a string');
  }
  return createStyleSheet(s);
}
