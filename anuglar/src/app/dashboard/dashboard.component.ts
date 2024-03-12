import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Emitters } from '../emitters/emitters';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { state } from '@angular/animations';
import { DeleteStudyDialogComponent } from '../delete-study-dialog/delete-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})


export class DashboardComponent implements OnInit{

  myStudies!:any;
  searchFilterVar:string = "";

  constructor(public UserService: UserService,
    public http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    ){

  }

  ngOnInit(): void {
    
    this.http.get("http://localhost:8000/api/user", {withCredentials: true}).subscribe((res:any) => {
      this.UserService.UpdateCurrentUserInfo(res);
      Emitters.authEmitter.emit(true);
      this.UserService.UpdateAuthentication(true);
      this.FectchUserProjects();
    },
    err => {
      Emitters.authEmitter.emit(false);
      this.UserService.UpdateAuthentication(false);
    })

  }

  FectchUserProjects(){
    this.http.get(`http://localhost:8000/api/allStudies/?q=${this.UserService.CurrentUser.id}`).subscribe((res:any) => {
      this.myStudies = res;
    },
    err => {
    })

  }

  getObjectLen(temp_var:any){
    return Object.keys(temp_var).length;
  }

  CheckSubString(temp_var:string, searchfilter:string){
    if(temp_var.includes(searchfilter)){
      return true;
    }
    else return false;
  }

  EditStudy(studyID: number){
    console.log(studyID);
    this.router.navigate(['edit-study'], { state: {study_id: studyID} });
  }

  openDeleteDialog(study: any): void {
    const dialogRef = this.dialog.open(DeleteStudyDialogComponent, {
      width: 'auto',
      data: { study: study }
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      console.log('The dialog was closed');
    });
  }
}
