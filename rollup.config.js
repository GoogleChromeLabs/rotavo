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

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [{
  input: 'src/main.js',
  output: {
    file: 'public/js/main.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs({
      exclude: [
        'node_modules/simplify-js/**',
        'node_modules/shake.js/**',
      ]
    }),
    terser(),
  ]
}];
