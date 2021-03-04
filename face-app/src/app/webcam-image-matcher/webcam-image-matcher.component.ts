import { Component, OnInit } from '@angular/core';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
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
  faceMatchScore = 70;
  processingResult = false;
  processingCompleted = false;

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
      this.loading = false;
    });
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    this.images.push(webcamImage);
    console.log(this.images);
  }

  async start(uploadedImage: any) {
    this.matchFound = false;
    this.faceMatchScore = 0;
    this.processingResult = true;
    this.processingCompleted = false;
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container)
    const labeledFaceDescriptors = await this.loadImageLabels();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    let image;
    let canvas;
    document.body.append('Loaded');
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(uploadedImage);
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
        if (result.label === 'Face match detected') {
           this.matchFound = true;
           this.faceMatchScore = result.distance;
        }
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
        drawBox.draw(canvas);
      });
      this.processingResult = false;
      this.processingCompleted = true;
  }

  loadImageLabels() {
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
        const img = await faceapi.fetchImage(`assets/labeled_images/Nishant Shetty/1.jpg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  fileChangeEvent(e: File[]){
    // const img = document.createElement("img");
    // img.src = "http://www.google.com/intl/en_com/images/logo_plain.png";
    const reader = new FileReader();
    let imagePath = e;
    let imgSrc;
    this.uploadSuccess = true;
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
    }
    // setTimeout(() => {
    //   const img = document.createElement("img");
    //   img.src = imgSrc;
    //   img.height = 300;
    //   img.width = 200;
    //   const uploadedImage = document.getElementById("uploadedImage");
    //   uploadedImage.appendChild(img);
    // });
    console.log(e[0]);
    const fileName = e[0].name;
    const fileType = e[0].type;
}

}
