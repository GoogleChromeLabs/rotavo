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

export class TouchKnob extends HTMLElement {
  constructor() {
    super();
    this._angle = 1;
    this._canDraw = true;
    this._rotations = 0;
    this._scale = 10;
    this._TWO_PI = 2 * Math.PI;
    this.min = 0;
    this.max = 298;

    this._drawState = this._drawState.bind(this);
    this._onMousedown = this._onMousedown.bind(this);
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseup = this._onMouseup.bind(this);
    this._onPointerdown = this._onPointerdown.bind(this);
    this._onPointermove = this._onPointermove.bind(this);
    this._onPointerup = this._onPointerup.bind(this);
    this._onTouchend = this._onTouchend.bind(this);
    this._onTouchmove = this._onTouchmove.bind(this);
    this._onTouchstart = this._onTouchstart.bind(this);
  }

  get value() {
    return this.hasAttribute('value') ? this.getAttribute('value') : 0;
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  connectedCallback() {
    this.style.setProperty('transform', 'rotate(' + this._angle + 'rad)');
    if ('PointerEvent' in window) {
      this.addEventListener('pointerdown', this._onPointerdown);
    } else {
      this.addEventListener('touchstart', this._onTouchstart);
      this.addEventListener('mousedown', this._onMousedown);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this._onPointerdown);
    this.removeEventListener('touchstart', this._onTouchstart);
    this.removeEventListener('mousedown', this._onMousedown);
  }

  _onMousedown(e) {
    this._touchX = e.clientX;
    this._touchY = e.clientY;

    this._handleStart();

    document.addEventListener('mousemove', this._onMousemove);
    document.addEventListener('mouseup', this._onMouseup);
  }

  _onMousemove(e) {
    e.preventDefault();
    this._touchX = e.clientX;
    this._touchY = e.clientY;

    this._handleMove();
  }

  _onMouseup(e) {
    e.preventDefault();

    document.removeEventListener('mousemove', this._onMousemove);
    document.removeEventListener('mouseup', this._onMouseup);

    this._handleEnd();
  }

  _onTouchstart(e) {
    e.preventDefault();
    window.oncontextmenu = () => { return false; };

    this._touchX = e.changedTouches[0].clientX;
    this._touchY = e.changedTouches[0].clientY;

    this._handleStart();

    this.addEventListener('touchmove', this._onTouchmove);
    this.addEventListener('touchend', this._onTouchend);
    this.addEventListener('touchcancel', this._onTouchend);
  }

  _onTouchmove(e) {
    e.preventDefault();

    this._touchX = e.targetTouches[0].clientX;
    this._touchY = e.targetTouches[0].clientY;

    this._handleMove();
  }

  _onTouchend(e) {
    e.preventDefault();
    window.oncontextmenu = null;

    this.removeEventListener('touchmove', this._onTouchmove);
    this.removeEventListener('touchend', this._onTouchend);
    this.removeEventListener('touchcancel', this._onTouchend);

    this._handleEnd();
  }

  _onPointerdown(e) {
    e.preventDefault();
    window.oncontextmenu = () => { return false; };

    this._touchX = e.clientX;
    this._touchY = e.clientY;
    this.setPointerCapture(e.pointerId);

    this._handleStart();

    this.addEventListener('pointermove', this._onPointermove);
    this.addEventListener('pointerup', this._onPointerup);
    this.addEventListener('pointercancel', this._onPointerup);
  }

  _onPointermove(e) {
    e.preventDefault();
    this._touchX = e.clientX;
    this._touchY = e.clientY;

    this._handleMove();
  }

  _onPointerup(e) {
    e.preventDefault();
    window.oncontextmenu = null;

    this.releasePointerCapture(e.pointerId);
    this.removeEventListener('pointermove', this._onPointermove);
    this.removeEventListener('pointerup', this._onPointerup);
    this.removeEventListener('pointercancel', this._onPointerup);

    this._handleEnd();
  }

  _handleStart() {
    this._centerX = this.offsetLeft - this.scrollLeft + this.clientLeft + this.offsetWidth / 2;
    this._centerY = this.offsetTop - this.scrollTop + this.clientTop + this.offsetHeight / 2;

    this._initialAngle = this._angle;
    this._initialValue = parseFloat(this.value);
    this._initialTouchAngle = Math.atan2(
      this._touchY - this._centerY,
      this._touchX - this._centerX
    );

    this._attemptedAngle = this._angle;
    this._attemptedRotations = this._rotations;
    this._attemptedValue = this.value;

    const evt = new CustomEvent('touch-knob-start', { bubbles: true });
    this.dispatchEvent(evt);
  }

  _handleMove() {
    if (this._canDraw === true) {
      this._canDraw = false;
      window.requestAnimationFrame(this._drawState);
    }

    const evt = new CustomEvent('touch-knob-move', { bubbles: true });
    this.dispatchEvent(evt);
  }

  _handleEnd() {
    const evt = new CustomEvent('touch-knob-end', { bubbles: true });
    this.dispatchEvent(evt);
  }
  _drawState() {
    const previousAttemptedAngle = this._attemptedAngle;
    this._attemptedAngle =
      this._initialAngle - this._initialTouchAngle
      + Math.atan2(this._touchY - this._centerY, this._touchX - this._centerX);
    this._attemptedAngle = this._attemptedAngle
      - this._TWO_PI * Math.floor((this._attemptedAngle + Math.PI) / this._TWO_PI);

    if (
      previousAttemptedAngle > -1.57 && previousAttemptedAngle < 0
      && this._attemptedAngle >= 0 && this._attemptedAngle <= 1.57
    ) {
      this._attemptedRotations++;
    } else if (
      previousAttemptedAngle < 1.57 && previousAttemptedAngle > 0
      && this._attemptedAngle <= 0 && this._attemptedAngle >= -1.57
    ) {
      this._attemptedRotations--;
    }

    if (this._attemptedAngle >= 0) {
      this._attemptedValue =
        (this._attemptedAngle + this._TWO_PI * this._attemptedRotations) * this._scale;
    } else if (this._attemptedAngle < 0) {
      this._attemptedValue =
        (this._attemptedAngle + this._TWO_PI * (this._attemptedRotations + 1)) * this._scale;
    }

    if (this._attemptedValue >= this.min && this._attemptedValue <= this.max) {
      this.value = this._attemptedValue;
      this._rotations = this._attemptedRotations;
      this._angle = this._attemptedAngle;
      this.style.setProperty('transform', `rotate(${this._angle}rad)`);
    }

    this._canDraw = true;
  }
}