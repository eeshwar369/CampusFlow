import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-course-materials',
  templateUrl: './course-materials.component.html',
  styleUrls: ['./course-materials.component.scss']
})
export class CourseMaterialsComponent implements OnInit {
  materials: any[] = [];
  courses: any[] = [];
  selectedCourse: number | null = null;
  loading = false;

  constructor(
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadMaterials();
  }

  loadCourses() {
    this.studentService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.data;
      }
    });
  }

  loadMaterials() {
    this.loading = true;
    const observable = this.selectedCourse 
      ? this.studentService.getCourseMaterials(this.selectedCourse)
      : this.studentService.getAllMaterials();
      
    observable.subscribe({
      next: (response) => {
        this.materials = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load materials');
        this.loading = false;
      }
    });
  }

  downloadMaterial(material: any) {
    this.studentService.downloadMaterial(material.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${material.title}.${material.file_type}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Download started');
      },
      error: () => {
        this.toast.error('Failed to download');
      }
    });
  }

  filterByCourse() {
    this.loadMaterials();
  }

  getFileIcon(fileType: string): string {
    switch(fileType) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'ppt': return '📊';
      default: return '📎';
    }
  }
}
