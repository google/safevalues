/*
 * @license
 * Copyright 2020 Google LLC

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

/**
 * @fileoverview Export for main builders of the library.
 *
 * Only used in open source version for now.
 */

export {htmlEscape} from './builders/trusted_html_builders';
export {trustedScript} from './builders/trusted_script_builders';
export {trustedScriptURL} from './builders/trusted_script_url_builders';

/** Reexport the public type (but not the Impl). */
export {EMPTY_HTML, unwrapTrustedHTML} from './implementation/trusted_html_impl';
export {EMPTY_SCRIPT, unwrapTrustedScript} from './implementation/trusted_script_impl';
export {unwrapTrustedScriptURL} from './implementation/trusted_script_url_impl';
