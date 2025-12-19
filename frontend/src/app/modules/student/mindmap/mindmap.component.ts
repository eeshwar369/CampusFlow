import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  styleUrls: ['./mindmap.component.scss']
})
export class MindmapComponent implements OnInit {
  selectedFile: File | null = null;
  uploading = false;
  mindMapData: any = null;
  error: string | null = null;
  savedMindMaps: any[] = [];
  loading = false;
  fileName: string = '';
  uploadProgress = 0;

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSavedMindMaps();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.toast.error('File size must be less than 10MB');
        return;
      }
      this.selectedFile = file;
      this.fileName = file.name;
      this.error = null;
    }
  }

  uploadSyllabus(): void {
    if (!this.selectedFile) {
      this.toast.error('Please select a PDF file');
      return;
    }

    this.uploading = true;
    this.error = null;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.aiServiceUrl}/generate-mindmap`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === 4) { // HttpEventType.Response
          this.mindMapData = event.body;
          this.uploading = false;
          this.uploadProgress = 100;
          this.toast.success('Mind map generated successfully!');
          this.selectedFile = null;
          this.fileName = '';
          this.loadSavedMindMaps();
        } else if (event.type === 1) { // HttpEventType.UploadProgress
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        }
      },
      error: (error) => {
        console.error('Mind map generation error:', error);
        let errorMessage = 'Failed to generate mind map. ';
        
        if (error.status === 0) {
          errorMessage += 'AI Service is not running. Please start the AI service on port 5000.';
        } else if (error.error?.error) {
          errorMessage += error.error.error;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please try again.';
        }
        
        this.error = errorMessage;
        this.toast.error(errorMessage);
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  loadSavedMindMaps(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/student/mind-maps`)
      .subscribe({
        next: (response: any) => {
          this.savedMindMaps = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  viewMindMap(mindMap: any): void {
    this.mindMapData = mindMap.mindmap_data ? JSON.parse(mindMap.mindmap_data) : mindMap;
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.error = null;
  }

  clearMindMap(): void {
    this.mindMapData = null;
  }
}
