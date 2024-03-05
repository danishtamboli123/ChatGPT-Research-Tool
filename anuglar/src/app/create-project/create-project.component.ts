import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { json } from 'stream/consumers';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})
export class CreateProjectComponent implements OnInit {

  CreateProjectForm!: FormGroup;
  isLinear = true;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private UserService: UserService,) {}

  ngOnInit(): void {
    this.CreateProjectForm = this.formBuilder.group({
      study_name: "",
      user_id: "",
      irb_pdf:"",
      pre_study_questionnaire: "",
      questions_list: "",
      post_study_questionnaire: "",
    })
  }

}
