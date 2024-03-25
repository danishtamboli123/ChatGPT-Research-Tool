import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Emitters } from '../emitters/emitters';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-edit-study',
  templateUrl: './edit-study.component.html',
  styleUrl: './edit-study.component.css'
})
export class EditStudyComponent implements OnInit{

  isLinear = true;
  fileName = '';
  fileURL?:SafeUrl;
  file?:File;
  formData = new FormData();


  study_id!:number;
  studyData: any;

  url_checker = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  studyname_checker = '^[0-9a-zA-Z_\\-. ]+$';


  constructor(private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public UserService: UserService,
    private sanitizer: DomSanitizer){
      this.study_id = this.router.getCurrentNavigation()?.extras.state?.["study_id"];
  }

  UpdateProjectQuestions:String[] = []
  UpdateProjectForm = new FormGroup({
    study_name: new FormControl(null, [Validators.required,Validators.pattern(this.studyname_checker)]),
    user_id: new FormControl(null, [Validators.required]),
    irb_pdf: new FormControl(),
    pre_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
    questions_list: new FormControl(this.UpdateProjectQuestions,[Validators.required]),
    post_study_questionnaire: new FormControl(null,Validators.pattern(this.url_checker)),
  });


  ngOnInit(): void {
    
    this.UserService.getCurrentUserService().then((authServiceInstance:UserService) => {
      if (authServiceInstance) {
        this.UserService = authServiceInstance;
        if(this.UserService.IsAuthenticated){
          this.FetchStudyData(this.study_id);
        }
      }
    });

  }

  FetchStudyData(studyID: number){
    this.http.get(`http://localhost:8000/api/editStudy/?q=${studyID}`).subscribe((res:any) => {
      this.studyData = res[0];
      this.UpdateProjectForm.controls.study_name.patchValue(this.studyData.study_name);
      this.UpdateProjectForm.patchValue({user_id : this.studyData.user_id});
      this.GetFile(this.studyData.irb_pdf);
      this.UpdateProjectForm.controls.pre_study_questionnaire.patchValue(this.studyData.pre_study_questionnaire == 'null' ? null : this.studyData.pre_study_questionnaire);
      this.UpdateProjectQuestions =  Object.values(this.studyData.questions_list);
      this.UpdateProjectForm.controls.questions_list.patchValue(this.UpdateProjectQuestions);
      this.UpdateProjectForm.controls.post_study_questionnaire.patchValue(this.studyData.post_study_questionnaire == 'null' ? null : this.studyData.post_study_questionnaire);
    },
    err => {
    })
  }

  GetFile(file_name: string){
    this.http.get(`http://localhost:8000/api/getIRBFile/?q=${file_name}`, { responseType: 'blob' }).subscribe(response => {
      const blob = new Blob([response], { type: 'application/pdf' });
      this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
      this.fileName = String(String(this.studyData.irb_pdf).split("/").pop());
      this.file = new File([blob], this.fileName, { type: 'application/pdf' });
      this.UpdateProjectForm.patchValue({irb_pdf :this.file});
    })
  }

  AddQuestion():void{
    this.UpdateProjectQuestions.push("");
    this.UpdateProjectForm.patchValue({questions_list:this.UpdateProjectQuestions});
   }

  ResetFormData():void{
    this.UpdateProjectQuestions = [];
    this.fileName = "";
    this.fileURL = undefined;
    this.file = undefined;
  }

  trackByMethod(index: number, el: any): number {
    return index;
 }

 RemoveQuestion(index:number){
  this.UpdateProjectQuestions = this.UpdateProjectQuestions.slice(0, index).concat(this.UpdateProjectQuestions.slice(index +1));
 }

 onFileSelected(event:any) {

     this.file = event.target.files[0];
     this.UpdateProjectForm.patchValue({irb_pdf :this.file});

     if (this.file) {

         this.fileName = this.file.name;
         this.fileURL= this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(event.target.files[0]));
     }
 }

 UpdateStudy(){

  this.formData = new FormData();
  const temp_var:any = this.UpdateProjectForm.getRawValue();
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

  this.formData.append("study_id", this.study_id as any)


  this.http.post("http://localhost:8000/api/editStudy/", this.formData, {withCredentials:true})
  .subscribe(() => {
    this.router.navigate(['/dashboard']);
  })

 }

  

}
