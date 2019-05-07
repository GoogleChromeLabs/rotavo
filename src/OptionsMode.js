import firebase from 'firebase/app';
import 'firebase/firestore';
import QRious from 'qrious';

export class OptionsMode {
  constructor(rootElement, app) {
    this._rootElement = rootElement;
    this._app = app;
    this._db = null;

    this._screen = this._rootElement.querySelector('.screen');
    this._detailButton = this._rootElement.querySelector('.button-detail');
    this._options = this._rootElement.querySelector('.options');
    this._qrcode = this._rootElement.querySelector('.qrcode');
    this._drawingLink = this._rootElement.querySelector('.drawing-link>a');

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleKeyup = this._handleKeyup.bind(this);
    this._toggleDetail = this._toggleDetail.bind(this);

    this._initFirebase();
  }

  _initFirebase() {
    if (!this._db) {
      // Initialize Cloud Firestore through Firebase
      firebase.initializeApp({
        apiKey: 'AIzaSyCV444-QKFwglGHmhJbVgCN6Cj2GXf5KIM',
        authDomain: 'rotavo-pwa.firebaseapp.com',
        databaseURL: 'https://rotavo-pwa.firebaseio.com',
        projectId: 'rotavo-pwa',
        storageBucket: 'rotavo-pwa.appspot.com',
        messagingSenderId: '646348013955'
      });

      this._db = firebase.firestore();
    }
  }

  activate() {
    const qrcode = this._qrcode;
    const drawingLink = this._drawingLink;
    this._db.collection('drawings').add({
      path: this._app.sketchModel.path
    }).then(function (docRef) {
      const url = 'https://rotavo-pwa.firebaseapp.com/sharing/' + docRef.id;
      drawingLink.href = url;
      drawingLink.textContent = url;

      const qr = new QRious({
        element: qrcode,
        value: url,
        size: 200,
        foreground: 'black',
        background: 'white'
      });
    })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });;

    this._options.classList.add('options-active');

    this._rootElement.addEventListener('keydown', this._handleKeydown, { capture: false, passive: true });
    this._rootElement.addEventListener('keyup', this._handleKeyup, { capture: false, passive: true });
  }

  deactivate() {
    this._options.classList.remove('options-active');

    this._rootElement.removeEventListener('keydown', this._handleKeydown, { capture: false, passive: true });
    this._rootElement.removeEventListener('keyup', this._handleKeyup, { capture: false, passive: true });
  }

  _handleKeydown(event) {
    switch (event.key) {
      case 'w':
        break;
      case 'd':
        break;
      case 's':
        break;
      case 'a':
        break;
      case 'i':
        break;
      case 'l':
        break;
      case 'k':
        break;
      case 'j':
        break;
      case 'x':
        this._toggleDetail();
        break;
      case 'r':
        break;
    }
  }

  _handleKeyup(event) {
    switch (event.key) {
      case 'w':
        break;
      case 'd':
        break;
      case 's':
        break;
      case 'a':
        break;
      case 'i':
        break;
      case 'l':
        break;
      case 'k':
        break;
      case 'j':
        break;
      case 'x':
        break;
      case 'r':
        this._app.activateDrawingMode();
        break;
    }
  }

  _toggleDetail() {
    console.log(this._detailButton.value);
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
