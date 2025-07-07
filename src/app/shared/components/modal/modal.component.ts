import { Component, Inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogModule, 
  MatDialogTitle, 
  MatDialogContent, 
  MatDialogActions, 
  MatDialogClose 
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ModalData {
  title: string;
  form: FormGroup;
  isEditMode?: boolean;
  fieldsTemplate: TemplateRef<any>;
  confirmText?: string;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ]
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.data.form.valid) {
      this.dialogRef.close(this.data.form.value);
    }
  }
}
