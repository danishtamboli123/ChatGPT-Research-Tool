import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  Registrationform!: FormGroup;
  API_URL!: "http://localhost:8000/api";
  hide = true;
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,){
    
  }
  ngOnInit(): void {
    this.Registrationform = this.formBuilder.group({
      name: '',
      email: '',
      password: '',
      account_type: '',
    })
      
  }

  submitRegisterForm(): void {
    this.http.post("http://localhost:8000/api/register",this.Registrationform?.getRawValue()).subscribe(() =>{
      this.router.navigate(['/login']);
    });
  }
}
