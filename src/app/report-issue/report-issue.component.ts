import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MdSnackBar } from '@angular/material';

import { ContactValidator } from '../validators/ContactValidator'

import { DialogsService } from '../dialog/dialogs.service';

import { BreakageInfo } from '../objects/breakageInfo';
import { BoatBreakageService } from '../boat-breakage.service'

import { FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent {

  title = "Report Boat Breakage";
  boats = [
    '1', '2', '3', '4', 'RIB'
  ];
  levels = [
    'Urgent (boat out of action)',
    'High (boat usable if needed)',
    'Medium (boat usable)',
    'Low (not affecting use)'
  ];

  breakages: BreakageInfo[];

  constructor(
    private fb: FormBuilder,
    private snackBar: MdSnackBar,
    private breakageService: BoatBreakageService,
    private dialogsService: DialogsService
  ) {
    this.createForm();
    this.breakages = breakageService.recentItems;
  }

  breakageForm: FormGroup;
  createForm() {
    this.breakageForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', ContactValidator.emailAndMobile],
      boatID: ['', Validators.required],
      importance: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(256)]]
    });
    this.breakageForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.breakageForm) { return; }
    const form = this.breakageForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'name': '',
    'contact': '',
    'boatID': '',
    'importance': '',
    'details': ''
  };

  validationMessages = {
    'name': {
      'required': 'Your name is required'
    },
    'contact': {
      'notEmailmobile': 'Contact must be email or mobile'
    },
    'boatID': {
      'required': 'Boat number is required'
    },
    'importance': {
      'required': 'Category is required'
    },
    'details': {
      'required': 'Breakage details are required',
      'maxlength': 'Maximum number of characters is 256'
    }
  };

  onSubmit() {
    if (this.breakageForm.valid) {

      var breakage = new BreakageInfo(
        this.breakageForm.get("name").value,
        this.breakageForm.get("contact").value,
        this.breakageForm.get("boatID").value,
        this.breakageForm.get("importance").value,
        this.breakageForm.get("details").value,
        new Date().getTime()
      );
      this.openDialog(breakage);
    }
  }

  openDialog(breakage: BreakageInfo) {
    var message = "";
    message += "Name: " + breakage.name + '\n';
    message += "Contact: " + breakage.contact + '\n';
    message += "Boat: " + breakage.boatID + '\n';
    message += "Importance: " + breakage.importance + '\n';
    message += "Details: " + breakage.details + '\n';

    this.dialogsService
      .confirm('Confirm Submission', message, "Submit")
      .subscribe(result => {
        if (result) {
          this.breakageService.addBreakageInfo(breakage).then(
            () => (
              this.snackBar.open("Breakage Succesfully Submited", "Close", {
                duration: 2000,
              }),
              this.createForm()
            )
          )
            .catch(
            () =>
              this.snackBar.open("Something Went Wrong", "Close", {
                duration: 2000,
              })
            );
        }
      });
  }
}