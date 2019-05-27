import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserElemComponent } from './user-elem.component';

describe('UserElemComponent', () => {
  let component: UserElemComponent;
  let fixture: ComponentFixture<UserElemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserElemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserElemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
