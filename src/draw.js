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
import firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyCV444-QKFwglGHmhJbVgCN6Cj2GXf5KIM',
    authDomain: 'rotavo-pwa.firebaseapp.com',
    databaseURL: 'https://rotavo-pwa.firebaseio.com',
    projectId: 'rotavo-pwa',
    storageBucket: 'rotavo-pwa.appspot.com',
    messagingSenderId: '646348013955'
});

const db = firebase.firestore();

const ref = window.location.pathname.split('/').pop();
const valid = new RegExp('^[a-z0-9]+$', 'gi');

if (!valid.test(ref)) {
    console.log('Invalid ID');
}

var docRef = db.collection('drawings').doc(ref);

docRef.get().then(function (doc) {
    if (doc.exists) {
        console.log('Document data:', doc.data());
        const restored = doc.data();
        const path = restored.path;
        const start = path[0];

        let svgPath = `M ${start.x - 2} ${start.y - 2} M ${start.x + 2} ${start.y + 2} M ${start.x} ${start.y}`;

        for (let i = 1; i < path.length; i++) {
            const point = path[i];
            svgPath += ` L ${point.x} ${point.y}`;
        }

        const screenPath = document.querySelector('.sketch-path');
        screenPath.setAttribute('d', svgPath);

        const stylusPoint = path[path.length - 1];
        const stylus = document.querySelector('.sketch-stylus');
        stylus.setAttribute('x1', stylusPoint.x);
        stylus.setAttribute('x2', stylusPoint.x);
        stylus.setAttribute('y1', stylusPoint.y);
        stylus.setAttribute('y2', stylusPoint.y);

    } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
    }
}).catch(function (error) {
    console.log('Error getting document:', error);
});
