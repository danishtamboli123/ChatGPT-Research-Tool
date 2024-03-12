import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteStudyDialogComponent } from './delete-study-dialog.component';

describe('DeleteStudyDialogComponent', () => {
  let component: DeleteStudyDialogComponent;
  let fixture: ComponentFixture<DeleteStudyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteStudyDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteStudyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
