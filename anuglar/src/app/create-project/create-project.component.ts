import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { json } from 'stream/consumers';
import { FormControl } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Directive, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})

export class CreateProjectComponent implements OnInit {
  url_checker = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  CreateProjectQuestions:String[] = []
  CreateProjectForm = new FormGroup({
    study_name: new FormControl(null, [Validators.required]),
    user_id: new FormControl(null, [Validators.required]),
    irb_pdf: new FormControl(),
    pre_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
    questions_list: new FormControl(this.CreateProjectQuestions,[Validators.required]),
    post_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
  });
  

  isLinear = true;
  fileName = '';
  fileURL?:SafeUrl;
  file?:File;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private UserService: UserService,
    private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    
  }

  AddQuestion():void{
    this.CreateProjectQuestions.push("");
    this.CreateProjectForm.patchValue({questions_list:this.CreateProjectQuestions});
    console.log(this.CreateProjectForm.controls.questions_list.value) 
   }

  ResetFormData():void{
    this.CreateProjectQuestions = [];
    this.fileName = "";
    this.fileURL = undefined;
    this.file = undefined;
  }

  trackByMethod(index: number, el: any): number {
    return index;
 }

 RemoveQuestion(index:number){
  this.CreateProjectQuestions = this.CreateProjectQuestions.slice(0, index).concat(this.CreateProjectQuestions.slice(index +1));
 }

 onFileSelected(event:any) {

     this.file = event.target.files[0];
     this.CreateProjectForm.patchValue({irb_pdf :this.file});

     if (this.file) {

         this.fileName = this.CreateProjectForm.controls.study_name.value + "_" + this.file.name;
         this.fileURL= this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(event.target.files[0]));
  

        //  console.log(this.CreateProjectForm.controls.irb_pdf.value)

        //  const upload$ = this.http.post("/api/thumbnail-upload", formData);

        //  upload$.subscribe();
     }
 }
}
