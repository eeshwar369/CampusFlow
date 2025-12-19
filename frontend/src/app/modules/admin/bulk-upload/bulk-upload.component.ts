import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploading = false;
  downloading = false;
  uploadResult: any = null;

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  /**
   * Download Excel template with all current students
   */
  downloadStudentList(): void {
    this.downloading = true;
    this.toast.info('Preparing student list for download...');

    this.http.get(`${environment.apiUrl}/admin/students/export`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.downloading = false;
        this.toast.success('Student list downloaded successfully!');
      },
      error: (error) => {
        this.downloading = false;
        this.toast.error('Failed to download student list: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        this.toast.error('Please select a valid Excel file (.xlsx, .xls, or .csv)');
        return;
      }

      this.selectedFile = file;
      this.uploadResult = null;
      this.toast.info(`File selected: ${file.name}`);
    }
  }

  /**
   * Upload modified student list
   */
  uploadStudentList(): void {
    if (!this.selectedFile) {
      this.toast.warning('Please select a file first');
      return;
    }

    this.uploading = true;
    this.toast.info('Uploading student list...');

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.apiUrl}/admin/students/import`, formData)
      .subscribe({
        next: (response: any) => {
          this.uploadResult = response.data;
          this.uploading = false;
          this.selectedFile = null;
          
          const { created, updated, deactivated, errors } = this.uploadResult;
          let message = `Success! Created: ${created}, Updated: ${updated}, Deactivated: ${deactivated}`;
          
          if (errors && errors.length > 0) {
            message += `. ${errors.length} errors occurred.`;
            this.toast.warning(message);
          } else {
            this.toast.success(message);
          }

          // Reset file input
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (error) => {
          this.uploading = false;
          this.toast.error('Upload failed: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  /**
   * Download error report if there were errors
   */
  downloadErrorReport(): void {
    if (!this.uploadResult || !this.uploadResult.errors || this.uploadResult.errors.length === 0) {
      this.toast.warning('No errors to download');
      return;
    }

    const errorText = this.uploadResult.errors.map((err: any, index: number) => 
      `${index + 1}. Row ${err.row}: ${err.message}`
    ).join('\n');

    const blob = new Blob([errorText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload_errors_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.toast.success('Error report downloaded');
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.uploadResult = null;
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
