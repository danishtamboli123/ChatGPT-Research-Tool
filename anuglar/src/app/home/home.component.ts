import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { NavComponent } from '../nav/nav.component';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  studyID!: number;
  errorMessage!: string;

  constructor(
    private http: HttpClient,
    private navcomp: NavComponent,
    public UserService: UserService,
    public router: Router,
  ){}

  ngOnInit(): void {

    this.http.get("http://localhost:8000/api/user", {withCredentials: true}).subscribe((res:any) => {
      this.UserService.UpdateCurrentUserInfo(res);
      Emitters.authEmitter.emit(true);
      this.UserService.UpdateAuthentication(true);
    },
    err => {
      Emitters.authEmitter.emit(false);
      this.UserService.UpdateAuthentication(false);
    })

  }

  GoToStudy(studyID:number){
    this.http.get(`http://localhost:8000/api/study/?study_id=${studyID}&user_id=${this.UserService.CurrentUser.id}`).subscribe((res:any) => {
      this.router.navigate(['study'], { state: {study_data: res.study_data} });
    },
    (err:any) => {
      this.errorMessage = err.error.detail;
    })
  }
}
