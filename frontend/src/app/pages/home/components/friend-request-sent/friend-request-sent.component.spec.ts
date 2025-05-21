import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendRequestSentComponent } from './friend-request-sent.component';

describe('FriendRequestSentComponent', () => {
  let component: FriendRequestSentComponent;
  let fixture: ComponentFixture<FriendRequestSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendRequestSentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendRequestSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
