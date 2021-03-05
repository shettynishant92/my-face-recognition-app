import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-webcam-image-matcher',
  templateUrl: './webcam-image-matcher.component.html',
  styleUrls: ['./webcam-image-matcher.component.scss']
})
export class WebcamImageMatcherComponent implements OnInit {
  images: WebcamImage[] = [];
  public webcamImage: WebcamImage = null;
  imageUpload: any;
  uploadSuccess = false;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  loading = true;
  matchFound = false;
  faceMatchScore = 0;
  processingResult = false;
  processingCompleted = false;
  container: any;
  step = 1;
  loadedImageLabels: any;
  noFaceDetectedError = false;

  constructor() { }

  ngOnInit(): void {
    this.imageUpload = document.getElementById('imageUpload');
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
    ]).then(() => {
      this.loading = false;
    });
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  async handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
    this.images.push(webcamImage);
    this.loadedImageLabels = await this.loadImageLabels();
  }

  async start(uploadedImage: any) {
    this.matchFound = false;
    this.faceMatchScore = 0;
    this.processingResult = true;
    this.processingCompleted = false;
    let image;
    let canvas;

    const labeledFaceDescriptors = this.loadedImageLabels;
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
    image = await faceapi.bufferToImage(uploadedImage);
    canvas = faceapi.createCanvasFromMedia(image);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    results.forEach((result, i) => {
      if (result.label === 'Face match detected') {
        this.matchFound = true;
        // Displaying as a percentage
        this.faceMatchScore = Math.round((1 - result.distance) * 100);
      } else if (!this.matchFound && i === results.length - 1) {
        // Displaying as a percentage
        this.faceMatchScore = Math.round((1 - result.distance) * 100);
      }
    });
    this.processingResult = false;
    this.processingCompleted = true;
  }

  loadImageLabels(): Promise<any> {
    const labels = ['Face match detected'];
    // return async () => {
    //   const descriptions = []
    //   const img = await faceapi.fetchImage(`${this.webcamImage.imageAsDataUrl}`)
    //   const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
    //   descriptions.push(detections.descriptor);
    //   return new faceapi.LabeledFaceDescriptors(label, descriptions)
    // }
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        const img = await faceapi.fetchImage(`${this.webcamImage.imageAsDataUrl}`);
        const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })).withFaceLandmarks().withFaceDescriptor();
        if (detections?.descriptor) {
          this.noFaceDetectedError = false;
          descriptions.push(detections.descriptor);
        } else {
          this.noFaceDetectedError = true;
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  fileChangeEvent(e: File[]): void {
    const reader = new FileReader();
    let imgSrc;
    reader.readAsDataURL(e[0]);
    reader.onload = (_event) => {
      imgSrc = reader.result;
      const img = document.createElement("img");
      img.src = imgSrc;
      img.height = 531;
      img.width = 413;
      const uploadedImage = document.getElementById("uploadedImage");
      if (uploadedImage.hasChildNodes()) {
        uploadedImage.removeChild(uploadedImage.firstChild);
      }
      uploadedImage.appendChild(img);
      this.start(e[0]);
      this.uploadSuccess = true;
    }
  }

  disabledCheck(): boolean {
    if (this.step === 1 && (!this.webcamImage || this.noFaceDetectedError)) {
      return true;
    } else if (this.step === 2 && !this.uploadSuccess) {
      return true;
    } else if (this.step === 3) {
      return true;
    }
    return false;
  }

  stepChange(navigate: 'next' | 'back'): void {
    if (navigate === 'next') {
      this.step++;
    } else if (this.step !== 1) {
      this.step--;
    }
  }

  getStepMessage(step: number): string {
    if (step === 1) {
      return 'Please take a snapshot from your WebCam';
    } else if (step === 2) {
      return 'Please upload a passport size image or selfie';
    } else {
      return 'Results';
    }
  }
}
