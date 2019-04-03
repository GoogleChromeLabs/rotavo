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
import { TouchKnob } from './touch-knob.js';
import { DoodleCase } from './doodle-case.js';
import { ToggleFullscreen } from './toggle-fullscreen.js';

window.customElements.define('touch-knob', TouchKnob);
window.customElements.define('doodle-case', DoodleCase);
window.customElements.define('toggle-fullscreen', ToggleFullscreen);

window.customElements.whenDefined('touch-knob').then(setupKeydown());

function setupKeydown() {
  const horzKnob = document.querySelector('.horz-knob');
  const vertKnob = document.querySelector('.vert-knob');
  const doodleCase = document.querySelector('doodle-case');

  document.addEventListener("keydown", event => {
    switch (event.key) {
      case 'w':
        horzKnob.rotateTo(0.01);
        break;
      case 'd':
        horzKnob.rotateTo(1.57);
        break;
      case 's':
        horzKnob.rotateTo(3.14);
        break;
      case 'a':
        horzKnob.rotateTo(-1.56);
        break;
        case 'i':
        vertKnob.rotateTo(0.01);
        break;
      case 'l':
        vertKnob.rotateTo(1.57);
        break;
      case 'k':
        vertKnob.rotateTo(3.14);
        break;
      case 'j':
        vertKnob.rotateTo(-1.56);
        break;
      case 'x':
        doodleCase._onShake();
        break;
      case 'm':
        doodleCase._toggleDetail();
    }
  })
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) { });
  });
}