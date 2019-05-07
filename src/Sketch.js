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

export class Sketch {
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