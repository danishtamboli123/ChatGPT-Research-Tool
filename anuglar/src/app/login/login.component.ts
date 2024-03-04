import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { Emitters } from '../emitters/emitters';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  LoginForm!: FormGroup;
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private UserService: UserService,
  ){

  }

  ngOnInit(): void {
      this.LoginForm = this.formBuilder.group({
        email: '',
        password: '',
      })
  }

  LoginSubmit(){
    this.http.post("http://localhost:8000/api/login", this.LoginForm.getRawValue(), {withCredentials:true})
    .subscribe(() => {
      this.router.navigate(['/']);
      this.http.get("http://localhost:8000/api/user", {withCredentials: true}).subscribe((res:any) => {
        this.UserService.UpdateCurrentUserInfo(res);
        Emitters.authEmitter.emit(true);
        this.UserService.UpdateAuthentication(true);
      },
      err => {
        Emitters.authEmitter.emit(false);
        this.UserService.UpdateAuthentication(false);
      })
    })
    }
}
