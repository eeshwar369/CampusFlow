import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-bulk-hall-ticket-upload',
  templateUrl: './bulk-hall-ticket-upload.component.html',
  styleUrls: ['./bulk-hall-ticket-upload.component.scss']
})
export class BulkHallTicketUploadComponent implements OnInit {
  exams: any[] = [];
  departments: string[] = [];
  selectedExam: string = '';
  selectedDepartment: string = '';
  selectedFiles: File[] = [];
  uploading = false;
  uploadResult: any = null;
  loading = false;

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadDepartments();
  }

  loadExams(): void {
    this.loading = true;
    this.adminService.getExamsForHallTickets().subscribe({
      next: (response) => {
        this.exams = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load exams');
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.adminService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response.data;
      },
      error: () => {
        this.toast.error('Failed to load departments');
      }
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.toast.success(`${this.selectedFiles.length} files selected`);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadHallTickets(): void {
    if (!this.selectedExam) {
      this.toast.error('Please select an exam');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toast.error('Please select PDF files to upload');
      return;
    }

    this.uploading = true;
    this.uploadResult = null;

    const formData = new FormData();
    formData.append('examId', this.selectedExam);
    if (this.selectedDepartment) {
      formData.append('department', this.selectedDepartment);
    }

    this.selectedFiles.forEach((file) => {
      formData.append('hallTickets', file);
    });

    this.adminService.bulkUploadHallTickets(formData).subscribe({
      next: (response) => {
        this.uploadResult = response.data;
        this.uploading = false;
        
        if (response.data.failed.length === 0) {
          this.toast.success(`Successfully uploaded ${response.data.success.length} hall tickets`);
        } else {
          this.toast.warning(
            `Uploaded ${response.data.success.length} hall tickets. ${response.data.failed.length} failed.`
          );
        }

        // Reset form
        this.selectedFiles = [];
        this.selectedExam = '';
        this.selectedDepartment = '';
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to upload hall tickets');
        this.uploading = false;
      }
    });
  }

  getFileName(file: File): string {
    return file.name;
  }

  getRollNumberFromFile(file: File): string {
    // Extract roll number from filename (e.g., CS2021001.pdf -> CS2021001)
    const name = file.name;
    return name.substring(0, name.lastIndexOf('.')) || name;
  }
}
