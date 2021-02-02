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
 * @fileoverview Adapter module for use of safevalues from closure
 *
 * This has two advantages:
 *  - Shorter & path independent module names (allowing us to move the code more
 * easily)
 *  - Can be used from files that still use `goog.provide` without having to
 * modify these files
 */

goog.module('safevalues.dom');
goog.module.declareLegacyNamespace();

const safedom = goog.require('google3.javascript.typescript.safevalues.safedom.safedom');

exports.common = safedom.common;
exports.document = safedom.document;
exports.location = safedom.location;
exports.range = safedom.range;
exports.window = safedom.window;
exports.worker = safedom.worker;
exports.a = safedom.a;
exports.area = safedom.area;
exports.button = safedom.button;
exports.form = safedom.form;
exports.iframe = safedom.iframe;
exports.img = safedom.img;
exports.input = safedom.input;
exports.link = safedom.link;
exports.script = safedom.script;
exports.style = safedom.style;
