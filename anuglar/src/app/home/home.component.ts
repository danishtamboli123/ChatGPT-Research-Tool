import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { NavComponent } from '../nav/nav.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  studyID?: number;

  constructor(
    private http: HttpClient,
    private navcomp: NavComponent,
    public UserService: UserService,
  ){}

  ngOnInit(): void {

  }

  GoToStudy(studyID:number|undefined){
    console.log(studyID)
  }
}
