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


  isLinear = true;
  fileName = '';
  fileURL?:SafeUrl;
  file?:File;
  formData = new FormData();
  pre_url:boolean = false;
  post_url:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public UserService: UserService,
    private sanitizer: DomSanitizer) {}


  url_checker = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  studyname_checker = '^[0-9a-zA-Z_\\-. ]+$';

  CreateProjectQuestions:String[] = []
  CreateProjectForm = new FormGroup({
    study_name: new FormControl(null, [Validators.required,Validators.pattern(this.studyname_checker)]),
    user_id: new FormControl(null, [Validators.required]),
    irb_pdf: new FormControl(),
    pre_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
    questions_list: new FormControl(this.CreateProjectQuestions,[Validators.required]),
    post_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
  });

  ngOnInit(): void {
  }

  AddQuestion():void{
    this.CreateProjectQuestions.push("");
    this.CreateProjectForm.patchValue({questions_list:this.CreateProjectQuestions});
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

         this.fileName = this.file.name;
         this.fileURL= this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(event.target.files[0]));
  

        //  console.log(this.CreateProjectForm.controls.irb_pdf.value)

        //  const upload$ = this.http.post("/api/thumbnail-upload", formData);

        //  upload$.subscribe();
     }
 }

 CreateStudy(){
  this.formData = new FormData();
  this.CreateProjectForm.patchValue({user_id : this.UserService.CurrentUser.id});
  const temp_var:any = this.CreateProjectForm.getRawValue();
  for (var field in temp_var) { // 'field' is a string
    if(field != "questions_list"){
      this.formData.append(field,temp_var[field as keyof any]);
    }
  }

  var temp:any = {}

  temp_var["questions_list"].forEach((element:any, index:any) => {
    temp["Question " + (index+1)] = element;
  });

  this.formData.append("questions_list", JSON.stringify(temp));


  this.http.post("http://localhost:8000/api/createStudy", this.formData, {withCredentials:true})
  .subscribe(() => {
    this.router.navigate(['/dashboard']);
    setTimeout(() => {
      window.alert('Study Created!');
      }, 500);
  })
 }

 GetSafeURl(url:any){
  if(url != null || url != undefined || url !=""){
  return url.startsWith("http://") || url.startsWith("https://") ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : this.sanitizer.bypassSecurityTrustResourceUrl("http://" + url)
  }
  else{
    return "null"
  }
  }

  CheckQuestions(){
    var returnbool = false;
    if(this.CreateProjectQuestions.length == 0){
      returnbool = true;
    }
    for (var question in this.CreateProjectQuestions) { // 'field' is a string
      if(this.CreateProjectQuestions[question].length == 0){
        returnbool = true;
      }
    }
    return returnbool;
  }


}
