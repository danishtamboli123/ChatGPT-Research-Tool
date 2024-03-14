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

  constructor(
    private http: HttpClient,
    private navcomp: NavComponent,
    public UserService: UserService,
    public router: Router,
  ){}

  ngOnInit(): void {

  }

  GoToStudy(studyID:number){
    this.http.get(`http://localhost:8000/api/study/?study_id=${studyID}&user_id=${this.UserService.CurrentUser.id}`).subscribe((res:any) => {
      console.log(res)
      // this.router.navigate(['study'], { state: {study_id: studyID} });
    },
    err => {
      console.log(err)
    })
  }
}
