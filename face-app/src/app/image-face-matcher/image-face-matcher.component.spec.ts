import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFaceMatcherComponent } from './image-face-matcher.component';

describe('ImageFaceMatcherComponent', () => {
  let component: ImageFaceMatcherComponent;
  let fixture: ComponentFixture<ImageFaceMatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageFaceMatcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFaceMatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
