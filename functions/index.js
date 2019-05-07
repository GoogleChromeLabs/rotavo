'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');


const shareApp = express();

shareApp.get('/sharing/:ref', (req, res) => {
    const ref = req.params.ref;
    const valid = new RegExp('^[a-z0-9]+$', 'gi');
    const resHeading = `
    <!DOCTYPE html>
    <html lang="en">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Share your drawing</title>
    <meta name="Description" content="Rotavo" />
    <link rel="canonical" href="https://rotavo-pwa.firebaseapp.com" />
    <link rel="stylesheet" href="/kiosk.css" />`;

    if (!valid.test(ref)) {
        res.status(404).send(resHeading +
            `<h1>Invalid reference</h1>
            <p>Sorry, it looks like the reference provided for this drawing is not in the right format.</p>`
        );
    }

    res.send(resHeading +
        `<script type="application/ld+json">
        {
        "@context":"http://schema.org",
        "@type":"ARArtifact",
        "arTarget":{
            "@type":"Barcode",
            "text":"https://rotavo-pwa.firebaseapp.com/sharing/${ref}"
        },
        "arContent":{
            "@type":"WebPage",
            "url":"/details/rotavo/",
            "image":"https://rotavo-pwa.firebaseapp.com/sharing/${ref}/rotavo.png",
            "mainEntity": {
                "url": "https://rotavo-pwa.firebaseapp.com/sharing/${ref}"
            }
        }
        }
        </script>
        <h1>Share your drawing</h1>
        <p><a href="/sharing/${ref}/rotavo.png" download>[Download]</a></p>
        <img class="share-image" src="/sharing/${ref}/rotavo.png" />`
    );
});

shareApp.get('/sharing/:ref/rotavo.png', async (req, res) => {
    const ref = req.params.ref;
    console.log(ref);
    const valid = new RegExp('^[a-z0-9]+$', 'gi');

    if (!valid.test(ref)) {
        res.status(404).send();
    }

    const filename = ref + '.png';
    console.log(filename);
    const tempFilePath = path.join(os.tmpdir(), filename);
    console.log(tempFilePath);

    const bucket = admin.storage().bucket();
    bucket.file(filename).download().then(function(data) {
        res.type('image/png').send(data[0]);
      });
    // await bucket.file(filename).download({ destination: tempFilePath });
    // res.sendFile(tempFilePath);
    // return fs.unlinkSync(tempFilePath);
});

const opts = { memory: '2GB', timeoutSeconds: 60 };

exports.createDrawing = functions.runWith(opts).firestore
    .document('drawings/{ref}')
    .onCreate(async (_snap, context) => {
        const ref = context.params.ref;
        const filename = ref + '.png';
        const tempFilePath = path.join(os.tmpdir(), filename);
        const url = 'https://rotavo-pwa.firebaseapp.com/redraw/' + ref;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        const viewport = {
            width: 1600,
            height: 900,
            deviceScaleFactor: 1,
            isLandscape: true,
        };
        await page.setViewport(viewport);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const opts = {
            path: tempFilePath,
            type: 'png',
            fullPage: true
        };
        await page.screenshot(opts);

        const metadata = {
            contentType: 'image/png',
        };

        // const bucket = storage.bucket('rotavo-kiosk.appspot.com');
        const bucket = admin.storage().bucket();
        await bucket.upload(tempFilePath, {
            destination: filename,
            metadata: metadata,
        });

        await browser.close();

        return fs.unlinkSync(tempFilePath);
    });


exports.sharing = functions.runWith(opts).https.onRequest(shareApp);
