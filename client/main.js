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
import 'input-knob';

class RotavoApp {
  constructor(els) {
    this.x = 10;
    this.y = 10;
    this.updating = false;

    this.els = els;
    this.ctx = this.els.activeSketch.getContext('2d');
    this.ctx.moveTo(this.x, this.y);
    this.ctx.strokeStyle = '#AA471F'
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    this.handleKnob = this.handleKnob.bind(this);
    this.updateSketch = this.updateSketch.bind(this);

    this.els.casing.addEventListener('knob-move-change', this.handleKnob);
  }

  handleKnob(e) {
    window.requestAnimationFrame(this.updateSketch);
  }

  updateSketch() {
    if (!this.updating) {
      this.x = this.els.horzKnob.value;
      this.y = this.els.vertKnob.value;
      this.ctx.lineTo(this.x, this.y);
      this.ctx.stroke();
    }
  }
}

window.customElements.whenDefined('input-knob').then(initApp());

function initApp() {
  const app = new RotavoApp({
    casing: document.querySelector('.casing'),
    activeSketch: document.querySelector('.active-sketch'),
    horzKnob: document.querySelector('.horz-knob'),
    vertKnob: document.querySelector('.vert-knob'),
  });
}

