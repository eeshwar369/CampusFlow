import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSavedMindMaps();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.error = null;
  }

  uploadSyllabus(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a PDF file';
      return;
    }

    this.uploading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.aiServiceUrl}/api/ai/generate-mindmap`, formData)
      .subscribe({
        next: (response: any) => {
          this.mindMapData = response.data;
          this.uploading = false;
          this.loadSavedMindMaps();
        },
        error: (error) => {
          this.error = error.error?.error || 'Failed to generate mind map';
          this.uploading = false;
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
    this.mindMapData = mindMap;
  }
}
