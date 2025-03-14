/**
 * @license
 * Copyright Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {domParserParseFromString} from 'safevalues/dom';
import {htmlSafeByReview} from 'safevalues/restricted/reviewed';
import {
  isCallSampled,
  isReportingDisabled,
  ReportingOptions,
  sendBeaconPolyfill,
  TEST_ONLY,
} from './reporting.js';

const NETWORK_REQUEST_REPORT_HEARTBEAT_RATE = 0.1;
const NETWORK_REQUEST_REPORT_SAMPLING_RATE = 0.1;

declare interface NetworkRequestElementPayload {
  url: string;
  element: string;
  elementType: ElementType;
  type: NetworkRequestElementReportType;
}

// LINT.IfChange
enum NetworkRequestElementReportType {
  // An unknown report type.
  DEFAULT_UNKNOWN = 'DEFAULT_UNKNOWN',

  // A report type that is triggered for a fraction of all function calls no
  // matter the contents of the input.
  HEARTBEAT = 'HEARTBEAT',

  // A report type that is triggered if the markdown contains an element that
  // can initiate an external network request.
  ELEMENT_DETECTED = 'ELEMENT_DETECTED',
}

enum ElementType {
  ELEMENT_TYPE_UNKNOWN = 'ELEMENT_TYPE_UNKNOWN',
  ELEMENT_TYPE_IMG = 'ELEMENT_TYPE_IMG',
  ELEMENT_TYPE_LINK = 'ELEMENT_TYPE_LINK',
  ELEMENT_TYPE_AUDIO = 'ELEMENT_TYPE_AUDIO',
  ELEMENT_TYPE_VIDEO = 'ELEMENT_TYPE_VIDEO',
}
// LINT.ThenChange(//depot/google3/java/com/google/security/csp/collector/securityreportservice/proto/network_request_element_reports.proto)

function reportNetworkRequestElement(
  options: ReportingOptions,
  url: string,
  elementType: ElementType,
  element: string,
  type: NetworkRequestElementReportType,
) {
  let sendReport = undefined;
  if (TEST_ONLY.sendReport) {
    sendReport = TEST_ONLY.sendReport;
  } else if (
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.sendBeacon !== undefined
  ) {
    sendReport = navigator.sendBeacon.bind(navigator);
  } else {
    sendReport = sendBeaconPolyfill;
  }
  const payload: NetworkRequestElementPayload = {
    'url': url,
    'element': element,
    'elementType': elementType,
    'type': type,
  };
  sendReport(
    'https://csp.withgoogle.com/csp/greport/' + options.reportingId,
    JSON.stringify(payload),
  );
}

/**
 * Passes through the given HTML string unchanged, but send reports containing metadata about
 * whether the HTML contains elements that can trigger network requests to the security
 * collector.
 */
export function reportOnlyNetworkRequestElementPassthrough(
  s: string,
  options: ReportingOptions,
): string {
  if (
    !isCallSampled(options, NETWORK_REQUEST_REPORT_SAMPLING_RATE) ||
    isReportingDisabled()
  ) {
    return s;
  }
  // Check for heartbeat
  if (
    Math.random() <
    (options.heartbeatRate ?? NETWORK_REQUEST_REPORT_HEARTBEAT_RATE)
  ) {
    reportNetworkRequestElement(
      options,
      '',
      ElementType.ELEMENT_TYPE_UNKNOWN,
      '',
      NetworkRequestElementReportType.HEARTBEAT,
    );
  }

  const parser = new DOMParser();
  const doc = domParserParseFromString(
    parser,
    htmlSafeByReview(s, {
      justification:
        'Parsing just to check if the HTML contains network request elements. b/361350306',
    }),
    'text/html',
  );
  const elements = doc.querySelectorAll('img, a, audio, video');

  elements.forEach((node) => {
    let elementType: ElementType = ElementType.ELEMENT_TYPE_UNKNOWN;
    let schema = '';

    switch (node.tagName.toUpperCase()) {
      case 'IMG':
        elementType = ElementType.ELEMENT_TYPE_IMG;
        schema = node.getAttribute('src')?.split(':')[0] ?? '';
        break;
      case 'A':
        elementType = ElementType.ELEMENT_TYPE_LINK;
        schema = node.getAttribute('href')?.split(':')[0] ?? '';
        break;
      case 'AUDIO':
        elementType = ElementType.ELEMENT_TYPE_AUDIO;
        schema = node.getAttribute('src')?.split(':')[0] ?? '';
        break;
      case 'VIDEO':
        elementType = ElementType.ELEMENT_TYPE_VIDEO;
        schema = node.getAttribute('src')?.split(':')[0] ?? '';
        break;
      default:
        break;
    }

    if (elementType) {
      reportNetworkRequestElement(
        options,
        schema,
        elementType,
        '', // Leaving the element field empty for now. Collecting the element type and URL schema should be enough.
        NetworkRequestElementReportType.ELEMENT_DETECTED,
      );
    }
  });
  return s;
}
