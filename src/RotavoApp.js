// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { DrawingMode } from './DrawingMode';
import { OptionsMode } from './OptionsMode';
import { Sketch } from './Sketch';

export class RotavoApp {
  constructor(rootElement) {
    this._drawingMode = new DrawingMode(rootElement, this);
    this._optionsMode = new OptionsMode(rootElement, this);
    this.sketchModel = new Sketch({ x: 10, y: 10 });

    this._drawingMode.activate();
  }

  activateOptionsMode() {
    this._drawingMode.deactivate();
    this._optionsMode.activate();
  }

  activateDrawingMode() {
    this._optionsMode.deactivate();
    this._drawingMode.activate();
  }
}
