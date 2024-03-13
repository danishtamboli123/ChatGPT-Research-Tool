import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit{
  public authenticated!:boolean;
  
  constructor(private http: HttpClient,
    public UserService: UserService,
    private router: Router,){}
  ngOnInit(): void {
      Emitters.authEmitter.subscribe((auth:boolean) => {
        this.authenticated = auth;
      })

      if(this.authenticated){
      this.http.get("http://localhost:8000/api/user", {withCredentials: true}).subscribe((res:any) => {
        this.UserService.UpdateCurrentUserInfo(res);
        Emitters.authEmitter.emit(true);
        this.UserService.UpdateAuthentication(true);
        this.authenticated = true;
      },
      err => {
        Emitters.authEmitter.emit(false);
        this.UserService.UpdateAuthentication(false);
      })
    }
  }

  UserLogout():void{
    this.http.post("http://localhost:8000/api/logout", {}, {withCredentials:true}).subscribe((res:any) =>{
    this.authenticated = false;
  });
    this.UserService.ResetUser();
  }  

}
