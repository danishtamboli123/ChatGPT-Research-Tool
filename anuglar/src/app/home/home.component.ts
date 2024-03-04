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
  constructor(
    private http: HttpClient,
    private navcomp: NavComponent,
    public UserService: UserService,
  ){}

  ngOnInit(): void {
      this.http.get("http://localhost:8000/api/user", {withCredentials: true}).subscribe((res:any) => {
        this.UserService.UpdateAuthentication(true);
        this.UserService.UpdateCurrentUserInfo(res);
        Emitters.authEmitter.emit(true);
      },
      err => {
        Emitters.authEmitter.emit(false);
        this.UserService.UpdateAuthentication(true);
      })
      
  }
}
