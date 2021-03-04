import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { FaceMatcherComponent } from './face-matcher/face-matcher.component';
import { WebcamModule } from 'ngx-webcam';
import { ImageFaceMatcherComponent } from './image-face-matcher/image-face-matcher.component';

@NgModule({
  declarations: [
    AppComponent,
    FaceMatcherComponent,
    ImageFaceMatcherComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
