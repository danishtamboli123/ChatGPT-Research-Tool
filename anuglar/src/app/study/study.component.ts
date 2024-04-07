import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Sanitizer } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { Emitters } from '../emitters/emitters';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrl: './study.component.css'
})
export class StudyComponent  implements OnInit{

  study_id!: number;
  participantStudyData!: any;
  IRBFile!:File;
  IRBUrl!: SafeUrl;
  fileName!: string;
  studyData!:any;
  isLinear = true;
  formData = new FormData();
  loadingCompleted = false;


  constructor(
    private http: HttpClient,
    public UserService: UserService,
    private router: Router,
    private sanitizer: DomSanitizer,
  )
  {
    this.study_id = this.router.getCurrentNavigation()?.extras.state?.["study_id"];
    }

  ngOnInit(): void {

    this.UserService.getCurrentUserService().then((authServiceInstance:UserService) => {
      if (authServiceInstance) {
        this.UserService = authServiceInstance;
        if(this.UserService.IsAuthenticated){
          this.GetStudy(this.study_id);
          this.GetPaticipantStudyData(this.study_id);
        }
      }
    });
  }

  GetPaticipantStudyData(studyID:number){
    this.http.get(`http://localhost:8000/api/study/?study_id=${studyID}&user_id=${this.UserService.CurrentUser.id}`).subscribe((res:any) => {
      this.participantStudyData = res.study_data[0]
      this.CreateAnswersList(this.participantStudyData, this.studyData);
    },
    (err:any) => {

    })
  }

  GetStudy(studyID:number){
    this.http.get(`http://localhost:8000/api/editStudy/?q=${studyID}`).subscribe((res:any) => {
      this.studyData = res[0]
      if(this.studyData.pre_study_questionnaire != "null"){
      this.studyData.pre_study_questionnaire = this.GetSafeURl(this.studyData.pre_study_questionnaire)
      }
      if(this.studyData.post_study_questionnaire != "null"){
      this.studyData.post_study_questionnaire = this.GetSafeURl(this.studyData.post_study_questionnaire)
      }
      this.GetFile(this.studyData.irb_pdf)
    },
    err => {
    })
  }

  GetFile(file_name: string){
    this.http.get(`http://localhost:8000/api/getIRBFile/?q=${file_name}`, { responseType: 'blob' }).subscribe(response => {
      const blob = new Blob([response], { type: 'application/pdf' });
      this.IRBUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
      this.fileName = String(String(this.studyData.irb_pdf).split("/").pop());
      this.IRBFile = new File([blob], this.fileName, { type: 'application/pdf' });
    })
  }

  SubmitParticipantStudyData(){
    this.formData = new FormData();
    for ( var key in this.participantStudyData ) {
      if(key == 'questions_answers_list'){
        this.formData.append(key, JSON.stringify(this.participantStudyData[key]));
      }
      else{
      this.formData.append(key, this.participantStudyData[key]);
      }
    }
    this.http.post("http://localhost:8000/api/study/", this.formData, {withCredentials:true})
    .subscribe((res:any) => {
      console.log(this.participantStudyData);
      console.log(res);
      this.router.navigate(['']);
      setTimeout(() => {
        window.alert('Study Completed!');
        }, 500);
    })
  }

  GetSafeURl(url:string){
    return url.startsWith("http://") || url.startsWith("https://") ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : this.sanitizer.bypassSecurityTrustResourceUrl("http://" + url)
  }

  CreateAnswersList(participantData:any, studyData:any){
    var temp:any = {}
    for (var question in studyData.questions_list) { // 'field' is a string
      
      temp[studyData.questions_list[question]] = {'prompt':'','answer': ''};
    }
    participantData.questions_answers_list = temp;
    this.loadingCompleted = true;
  }

  autoGrowTextZone(e:any) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 25)+"px";
  }

  checkQuestionsCompleted(){

    for ( var question in this.participantStudyData.questions_answers_list){
      if(this.participantStudyData.questions_answers_list[question].prompt == '' || this.participantStudyData.questions_answers_list[question].answer == ''){
        return false
      }
    }
    return true
  }

  ProcessChatGPT(question :any){
    var prompt = question.prompt;
    this.http.get(`http://localhost:8000/api/chatgpt-response/?prompt=${prompt}`).subscribe((res:any) => {
      question.answer = res.answer;
    },
    (err:any) => {

    })
  }

  actionMethod(event: any) {
    event.currentTarget.disabled = true;
}
}
