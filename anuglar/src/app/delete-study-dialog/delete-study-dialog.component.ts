
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-delete-study-dialog',
  templateUrl: './delete-study-dialog.component.html',
  styleUrl: './delete-study-dialog.component.css'
})
export class DeleteStudyDialogComponent {

  formData = new FormData();

  constructor(
    public dialogRef: MatDialogRef<DeleteStudyDialogComponent>,
    public router: Router,
    public http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  deleteStudy(studyID:number){
    this.formData = new FormData()
    this.formData.append('study_id', studyID as any)
    this.http.post("http://localhost:8000/api/deleteStudy/", this.formData, {withCredentials:true})
    .subscribe(() => {
          this.closeDialog();
          location.reload();
    })
  }

}
