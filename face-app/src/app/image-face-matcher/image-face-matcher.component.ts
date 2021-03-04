import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-image-face-matcher',
  templateUrl: './image-face-matcher.component.html',
  styleUrls: ['./image-face-matcher.component.scss']
})
export class ImageFaceMatcherComponent implements OnInit {

  imageUpload: any;
  constructor() { }

  ngOnInit(): void {
    this.imageUpload = document.getElementById('imageUpload');
    console.log(faceapi.nets);
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
    ]).then(() => {
      this.start();
    });
  }

  async start() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container)
    const labeledFaceDescriptors = await this.loadImageLabels();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    let image;
    let canvas;
    document.body.append('Loaded');
    this.imageUpload.addEventListener('change', async () => {
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(this.imageUpload.files[0]);
      container.append(image);
      canvas = faceapi.createCanvasFromMedia(image);
      container.append(canvas);
      const displaySize = { width: image.width, height: image.height };
      faceapi.matchDimensions(canvas, displaySize);
      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
      document.body.append(detections.length.toString());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
        drawBox.draw(canvas);
      });
    })
  }

  loadImageLabels() {
    const labels = ['Black Widow', 'Captain America', 'Tony Stark', 'Jim Rhodes', 'Thor', 'Hawkeye', 'Captain Marvel'];
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }
}
