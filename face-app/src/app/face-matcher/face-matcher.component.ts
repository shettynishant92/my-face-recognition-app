import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-face-matcher',
  templateUrl: './face-matcher.component.html',
  styleUrls: ['./face-matcher.component.scss']
})
export class FaceMatcherComponent implements OnInit {

  images: WebcamImage[] = [];
  public webcamImage: WebcamImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  video: any;

  constructor() {
  }

  ngOnInit(): void {
    this.video = document.getElementById('video');
    console.log(faceapi.nets)
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
    ]).then(() => {
      this.startVideo();
    });
    this.video.addEventListener('playing', () => {
      const canvas = faceapi.createCanvasFromMedia(this.video);
      document.body.append(canvas);
      const displaySize = { width: this.video.width, height: this.video.height};
      faceapi.matchDimensions(canvas, displaySize);
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks().withFaceExpressions();
        console.log(detections);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }, 100);
      console.log('Event listener works');
    })
  }

  startVideo(): void {
    console.log('Hello');
    navigator.mediaDevices.getUserMedia(
      { video: true }
    ).then(stream => this.video.srcObject = stream)
      .catch(err => console.log(err));
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.images.push(webcamImage);
    console.log(this.images)
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

}
