// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import '@webcomponents/custom-elements';
import { TouchKnob } from './touch-knob';
import { RotavoApp } from './RotavoApp';
import { ToggleFullscreen } from './toggle-fullscreen';

window.customElements.define('touch-knob', TouchKnob);
window.customElements.define('toggle-fullscreen', ToggleFullscreen);

window.customElements.whenDefined('touch-knob').then(initApp());

function initApp() {
  const app = new RotavoApp(document, false);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) { });
  });
}
