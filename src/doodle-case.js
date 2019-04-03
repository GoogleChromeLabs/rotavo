// Copyright 2019 Google LLC
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

import 'simplify-js'; // imports simplify()
import 'shake.js'; // imports Shake

class Sketch {
  constructor(startingPoint) {
    this.path = [startingPoint];
    this.erasedPaths = [];
    this._lastAngle = null;
  }

  get lastPoint() {
    return this.path[this.path.length - 1];
  }

  get lastAngle() {
    if (this.path.length < 2) {
      return null;
    }

    const penultimatePoint = this.path[this.path.length - 2];

    return Math.atan2(
      this.lastPoint.x - penultimatePoint.x,
      this.lastPoint.y - penultimatePoint.y
    );
  }

  moveTo(point) {
    point = {
      x: parseFloat(point.x),
      y: parseFloat(point.y)
    }

    const angle = Math.atan2(
      point.x - this.lastPoint.x,
      point.y - this.lastPoint.y
    );

    if (angle === this.lastAngle && (this.lastPoint.x !== point.x || this.lastPoint.y !== point.y)) {
      this.path.pop();
    }

    this.path.push(point);
  }

  simplifyPath() {
    this.path = simplify(this.path, 0.5);
  }

  jiggle() {
    if (this.path.length > 1) {
      this.erasedPaths.push(this.path);
      this.path = [this.lastPoint];
      this._lastAngle = null;
      return true;
    }

    return false;
  }
}

export class DoodleCase extends HTMLElement {
  constructor() {
    super();
    this._canDraw = true;
    this._lastSketchAngle = null;
    this._lastDraw = 0;

    this._onShake = this._onShake.bind(this);
    this._optimizeSketch = this._optimizeSketch.bind(this);
    this._requestOptimizeSketch = this._requestOptimizeSketch.bind(this);
    this._requestUpdateSketch = this._requestUpdateSketch.bind(this);
    this._toggleDetail = this._toggleDetail.bind(this);
    this._updateSketch = this._updateSketch.bind(this);
  }

  connectedCallback() {
    this._sketchModel = new Sketch({ x: 10, y: 10 });

    this._screen = this.querySelector('.screen');
    this._activeSketch = this.querySelector('.active-sketch');
    this._path = this.querySelector('.sketch-path');
    this._stylus = this.querySelector('.sketch-stylus');

    this._horzKnob = this.querySelector('.horz-knob');
    this._vertKnob = this.querySelector('.vert-knob');

    this.addEventListener('touch-knob-move', this._requestUpdateSketch, { capture: false, passive: true });
    this.addEventListener('touch-knob-end', this._requestOptimizeSketch, { capture: false, passive: true });

    this._shakeDetector = new Shake({ threshold: 5, timeout: 200 });
    this._shakeDetector.start();
    window.addEventListener('shake', this._onShake, { capture: false, passive: true });

    this._jiggleButton = this.querySelector('.button-jiggle');
    this._jiggleButton.addEventListener('click', this._onShake, { capture: false, passive: true });

    this._detailButton = this.querySelector('.button-detail');
    this._detailButton.addEventListener('click', this._toggleDetail, { capture: false, passive: true });
  }

  disconnectedCallback() {
    this.removeEventListener('touch-knob-move', this._requestUpdateSketch);
    this.removeEventListener('touch-knob-end', this._requestOptimizeSketch);

    window.removeEventListener('shake', this._onShake, { capture: false, passive: true });
    this._jiggleButton.removeEventListener('click', this._onShake, { capture: false, passive: true });
    this._shakeDetector.stop();

    this._detailButton.removeEventListener('click', this._toggleDetail, { capture: false, passive: true });
  }

  _requestUpdateSketch() {
    if (this._canDraw === true && Date.now() - this._lastDraw > 50) {
      this._canDraw = false;
      this._lastDraw = Date.now();
      window.requestAnimationFrame(this._updateSketch);
    }
  }

  _requestOptimizeSketch() {
    if (this._canDraw === true) {
      this._canDraw = false;
      window.requestAnimationFrame(this._optimizeSketch);
    }
  }

  _updateSketch() {
    this._sketchModel.moveTo({
      x: this._horzKnob.value,
      y: this._vertKnob.value
    });
    this._drawSketch();
    this._canDraw = true;
  }

  _optimizeSketch() {
    this._sketchModel.simplifyPath();
    this._drawSketch();
    this._canDraw = true;
  }

  _drawSketch() {
    const path = this._sketchModel.path;
    const start = path[0];
    let svgPath = `M ${start.x - 2} ${start.y - 2} M ${start.x + 2} ${start.y + 2} M ${start.x} ${start.y}`;

    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      svgPath += ` L ${point.x} ${point.y}`;
    }

    this._path.setAttribute('d', svgPath);

    const stylus = this._sketchModel.lastPoint;
    this._stylus.setAttribute('x1', stylus.x);
    this._stylus.setAttribute('x2', stylus.x);
    this._stylus.setAttribute('y1', stylus.y);
    this._stylus.setAttribute('y2', stylus.y);
  }

  _onShake() {
    if (this._sketchModel.jiggle()) {
      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const start = this._sketchModel.path[0];
      const initialPath = `M ${start.x - 2} ${start.y - 2} M ${start.x + 2} ${start.y + 2} M ${start.x} ${start.y}`;

      newPath.setAttributeNS(null, 'd', initialPath);
      newPath.classList.add('sketch-path');

      const erasedSketch = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      erasedSketch.classList.add('erased-sketch');
      erasedSketch.setAttributeNS(null, 'preserveAspectRatio', 'none');
      erasedSketch.setAttributeNS(null, 'x', '0');
      erasedSketch.setAttributeNS(null, 'y', '0');
      erasedSketch.setAttributeNS(null, 'viewBox', '-2 -2 302 302');
      erasedSketch.style.opacity = '1';

      erasedSketch.appendChild(this._path);
      this._path = newPath;
      this._activeSketch.insertBefore(this._path, this._stylus);
      this._screen.insertBefore(erasedSketch, this._activeSketch);
    }

    this._screen.querySelectorAll('.erased-sketch').forEach(erasedSketch => {
      let opacity = Number.parseFloat(erasedSketch.style.opacity);
      if (opacity <= 0) {
        this._screen.removeChild(erasedSketch);
      } else {
        opacity -= 0.21;
        const blur = 1 - opacity;
        erasedSketch.style.opacity = opacity;
        erasedSketch.style.filter = 'blur(' + blur + 'vw)';
      }
    });
  }

  _toggleDetail() {
    switch (this._detailButton.value) {
      case 'fast':
        this._screen.classList.add('fast');
        this._screen.classList.remove('fanciest', 'fancy');
        this._detailButton.textContent = '✨ Fancy';
        this._detailButton.value = 'fancy';
        break;
      case 'fancy':
        this._screen.classList.add('fancy');
        this._screen.classList.remove('fanciest', 'fast');
        this._detailButton.textContent = '🌈 Fanciest';
        this._detailButton.value = 'fanciest';
        break;
      case 'fanciest':
        this._screen.classList.add('fanciest');
        this._screen.classList.remove('fancy', 'fast');
        this._detailButton.textContent = '🚀 Fast';
        this._detailButton.value = 'fast';
        break;
    }
  }
}
