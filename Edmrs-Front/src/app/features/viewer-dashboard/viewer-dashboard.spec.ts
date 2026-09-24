import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewerDashboard } from './viewer-dashboard';

describe('ViewerDashboard', () => {
  let component: ViewerDashboard;
  let fixture: ComponentFixture<ViewerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
