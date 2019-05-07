
import 'shake.js'; // imports Shake

export class DrawingMode {

  constructor(rootElement, app) {
    this._rootElement = rootElement;
    this._app = app;

    this._canDraw = true;
    this._lastSketchAngle = null;
    this._lastDraw = 0;
    this._drawInterval = 0;
    this._keyInterval = 200;
    this._horzKeys = {
      w: {
        pressed: false,
        timestamp: 0,
        value: 0.01,
        prev: { key: 'a', value: -0.785 },
        next: { key: 'd', value: 0.785 }
      },
      d: {
        pressed: false,
        timestamp: 0,
        value: 1.57,
        prev: { key: 'w', value: 0.785 },
        next: { key: 's', value: 2.355 }
      },
      s: {
        pressed: false,
        timestamp: 0,
        value: 3.14,
        prev: { key: 'd', value: 2.355 },
        next: { key: 'a', value: -2.355 }
      },
      a: {
        pressed: false,
        timestamp: 0,
        value: -1.56,
        prev: { key: 's', value: -2.355 },
        next: { key: 'w', value: -0.785 }
      }
    };

    this._vertKeys = {
      i: {
        pressed: false,
        timestamp: 0,
        value: 0.01,
        prev: { key: 'j', value: -0.785 },
        next: { key: 'l', value: 0.785 }
      },
      l: {
        pressed: false,
        timestamp: 0,
        value: 1.57,
        prev: { key: 'i', value: 0.785 },
        next: { key: 'k', value: 2.355 }
      },
      k: {
        pressed: false,
        timestamp: 0,
        value: 3.14,
        prev: { key: 'l', value: 2.355 },
        next: { key: 'j', value: -2.355 }
      },
      j: {
        pressed: false,
        timestamp: 0,
        value: -1.56,
        prev: { key: 'k', value: -2.355 },
        next: { key: 'i', value: -0.785 }
      }
    };

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleKeyup = this._handleKeyup.bind(this);
    this._onShake = this._onShake.bind(this);
    this._optimizeSketch = this._optimizeSketch.bind(this);
    this._requestOptimizeSketch = this._requestOptimizeSketch.bind(this);
    this._requestUpdateSketch = this._requestUpdateSketch.bind(this);
    this._toggleDetail = this._toggleDetail.bind(this);
    this._updateSketch = this._updateSketch.bind(this);

    this._screen = this._rootElement.querySelector('.screen');
    this._activeSketch = this._rootElement.querySelector('.active-sketch');
    this._path = this._rootElement.querySelector('.sketch-path');
    this._stylus = this._rootElement.querySelector('.sketch-stylus');

    this._horzKnob = this._rootElement.querySelector('.horz-knob');
    this._vertKnob = this._rootElement.querySelector('.vert-knob');
  }

  activate() {
    this._rootElement.addEventListener('touch-knob-move', this._requestUpdateSketch, { capture: false, passive: true });
    this._rootElement.addEventListener('touch-knob-end', this._requestOptimizeSketch, { capture: false, passive: true });

    this._shakeDetector = new Shake({ threshold: 5, timeout: 200 });
    this._shakeDetector.start();
    window.addEventListener('shake', this._onShake, { capture: false, passive: true });
    this._jiggleButton = this._rootElement.querySelector('.button-jiggle');

    if (this._jiggleButton) {
      this._jiggleButton.addEventListener('click', this._onShake, { capture: false, passive: true });
    }

    this._detailButton = this._rootElement.querySelector('.button-detail');

    if (this._detailButton) {
      this._detailButton.addEventListener('click', this._toggleDetail, { capture: false, passive: true });
    }

    this._rootElement.addEventListener('keydown', this._handleKeydown, { capture: false, passive: true });
    this._rootElement.addEventListener('keyup', this._handleKeyup, { capture: false, passive: true });
  }

  deactivate() {
    this._rootElement.removeEventListener('touch-knob-move', this._requestUpdateSketch);
    this._rootElement.removeEventListener('touch-knob-end', this._requestOptimizeSketch);

    window.removeEventListener('shake', this._onShake, { capture: false, passive: true });

    this._jiggleButton.removeEventListener('click', this._onShake, { capture: false, passive: true });
    this._shakeDetector.stop();

    this._detailButton.removeEventListener('click', this._toggleDetail, { capture: false, passive: true });

    this._rootElement.removeEventListener('keydown', this._handleKeydown, { capture: false, passive: true });
    this._rootElement.removeEventListener('keyup', this._handleKeyup, { capture: false, passive: true });
  }

  _isAnyKeyPressed(config) {
    for (let key in config) {
      if (config.hasOwnProperty(key) && config[key]['pressed'] === true) {
        return true;
      }
    }
  }
  _handleRotateKeydown(key, config, knob) {
    if (config[key]['pressed'] != false) {
      return;
    }

    const current = config[key];
    const prev = config[config[key]['prev']['key']];
    const next = config[config[key]['next']['key']];

    if (prev['pressed'] === true || Date.now() - prev['timestamp'] < this._keyInterval) {
      knob.rotateToContinue(current['prev']['value']);
    } else if (next['pressed'] === true || Date.now() - next['timestamp'] < this._keyInterval) {
      knob.rotateToContinue(current['next']['value']);
    } else if (this._isAnyKeyPressed(config)) {
      knob.rotateToContinue(current['value']);
    } else {
      knob.rotateToStart(current['value']);
    }

    current['pressed'] = true;
    current['timestamp'] = Date.now();
  }

  _handleRotateKeyup(key, config, knob) {
    config[key]['pressed'] = false;

    const prev = config[config[key]['prev']['key']];
    const next = config[config[key]['next']['key']];

    if (prev['pressed'] === true) {
      knob.rotateToContinue(prev['value']);
    } else if (next['pressed'] == true) {
      knob.rotateToContinue(next['value']);
    } else {
      knob.rotateToEnd();
    }
  }

  _handleKeydown(event) {
    if (['w', 'd', 's', 'a'].includes(event.key)) {
      this._handleRotateKeydown(event.key, this._horzKeys, this._horzKnob);
    } else if (['i', 'l', 'k', 'j'].includes(event.key)) {
      this._handleRotateKeydown(event.key, this._vertKeys, this._vertKnob);
    } else if (event.key === 'x') {
      this._onShake();
    }
  }

  _handleKeyup(event) {
    if (['w', 'd', 's', 'a'].includes(event.key)) {
      this._handleRotateKeyup(event.key, this._horzKeys, this._horzKnob);
    } else if (['i', 'l', 'k', 'j'].includes(event.key)) {
      this._handleRotateKeyup(event.key, this._vertKeys, this._vertKnob);
    } else if (event.key === 'r') {
      this._app.activateOptionsMode();
    }
  }

  setDrawInterval(milliseconds) {
    this._drawInterval = milliseconds;
  }

  _requestUpdateSketch() {
    if (this._canDraw === true && Date.now() - this._lastDraw > this._drawInterval) {
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
    this._app.sketchModel.moveTo({
      x: this._horzKnob.value,
      y: this._vertKnob.value
    });
    this._drawSketch();
    this._canDraw = true;
  }

  _optimizeSketch() {
    this._app.sketchModel.simplifyPath();
    this._drawSketch();
    this._canDraw = true;
  }

  _drawSketch() {
    const path = this._app.sketchModel.path;
    const start = path[0];
    let svgPath = `M ${start.x - 2} ${start.y - 2} M ${start.x + 2} ${start.y + 2} M ${start.x} ${start.y}`;

    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      svgPath += ` L ${point.x} ${point.y}`;
    }

    this._path.setAttribute('d', svgPath);

    const stylus = this._app.sketchModel.lastPoint;
    this._stylus.setAttribute('x1', stylus.x);
    this._stylus.setAttribute('x2', stylus.x);
    this._stylus.setAttribute('y1', stylus.y);
    this._stylus.setAttribute('y2', stylus.y);
  }

  _onShake() {
    if (this._app.sketchModel.jiggle()) {
      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const start = this._app.sketchModel.path[0];
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
