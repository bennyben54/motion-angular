import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribeElemComponent } from './subscribe-elem.component';

describe('SubscribeElemComponent', () => {
  let component: SubscribeElemComponent;
  let fixture: ComponentFixture<SubscribeElemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscribeElemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribeElemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
