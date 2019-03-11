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

export class ToggleFullscreen extends HTMLElement {

  constructor() {
    super();

    this._onFullscreenchange = this._onFullscreenchange.bind(this);
    this._toggleFullscreen = this._toggleFullscreen.bind(this);
  }


  connectedCallback() {
    document.addEventListener('fullscreenchange', this._onFullscreenchange, { capture: false, passive: true });

    this._fullscreenButton = this.querySelector('.button-fullscreen');
    this._fullscreenButton.addEventListener('click', this._toggleFullscreen, { capture: false, passive: true });
  }

  disconnectedCallback() {
    this._fullscreenButton.removeEventListener('click', this._toggleFullscreen);
  }

  _onFullscreenchange() {
    if (document.fullscreenElement !== null) {
      this._fullscreenButton.textContent = '⤵️ Return';
    } else {
      this._fullscreenButton.textContent = '⤴️ Full';
    }
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}