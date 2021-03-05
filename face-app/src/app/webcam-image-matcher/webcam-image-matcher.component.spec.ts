import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamImageMatcherComponent } from './webcam-image-matcher.component';

describe('WebcamImageMatcherComponent', () => {
  let component: WebcamImageMatcherComponent;
  let fixture: ComponentFixture<WebcamImageMatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamImageMatcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcamImageMatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
