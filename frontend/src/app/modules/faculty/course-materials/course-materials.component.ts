import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacultyService } from '../../../services/faculty.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-course-materials',
  templateUrl: './course-materials.component.html',
  styleUrls: ['./course-materials.component.scss']
})
export class CourseMaterialsComponent implements OnInit {
  courseId: number = 0;
  materials: any[] = [];
  uploading = false;
  
  uploadForm = {
    title: '',
    description: '',
    fileType: 'pdf',
    file: null as File | null
  };

  constructor(
    private route: ActivatedRoute,
    private facultyService: FacultyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.courseId = +this.route.snapshot.params['id'];
    this.loadMaterials();
  }

  loadMaterials() {
    this.facultyService.getCourseMaterials(this.courseId).subscribe({
      next: (response) => {
        this.materials = response.data;
      },
      error: () => {
        this.toast.error('Failed to load materials');
      }
    });
  }

  onFileSelect(event: any) {
    this.uploadForm.file = event.target.files[0];
  }

  uploadMaterial() {
    if (!this.uploadForm.file) {
      this.toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadForm.file);
    formData.append('courseId', this.courseId.toString());
    formData.append('title', this.uploadForm.title);
    formData.append('description', this.uploadForm.description);
    formData.append('fileType', this.uploadForm.fileType);

    this.uploading = true;
    this.facultyService.uploadMaterial(formData).subscribe({
      next: () => {
        this.toast.success('Material uploaded successfully');
        this.loadMaterials();
        this.resetForm();
      },
      error: () => {
        this.toast.error('Failed to upload material');
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  deleteMaterial(materialId: number) {
    if (confirm('Delete this material?')) {
      this.facultyService.deleteMaterial(materialId).subscribe({
        next: () => {
          this.toast.success('Material deleted');
          this.loadMaterials();
        },
        error: () => {
          this.toast.error('Failed to delete material');
        }
      });
    }
  }

  resetForm() {
    this.uploadForm = {
      title: '',
      description: '',
      fileType: 'pdf',
      file: null
    };
  }
}
