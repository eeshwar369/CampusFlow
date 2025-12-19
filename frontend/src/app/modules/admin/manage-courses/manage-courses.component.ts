import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-courses',
  templateUrl: './manage-courses.component.html',
  styleUrls: ['./manage-courses.component.scss']
})
export class ManageCoursesComponent implements OnInit {
  courses: any[] = [];
  loading = false;
  error: string | null = null;
  showAddForm = false;
  newCourse = {
    name: '',
    code: '',
    department: '',
    credits: 3,
    semester: 1,
    year: 1
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/admin/courses`)
      .subscribe({
        next: (response: any) => {
          this.courses = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.error?.message || 'Failed to load courses';
          this.loading = false;
        }
      });
  }

  addCourse(): void {
    this.http.post(`${environment.apiUrl}/admin/courses`, this.newCourse)
      .subscribe({
        next: () => {
          alert('Course added successfully');
          this.showAddForm = false;
          this.resetForm();
          this.loadCourses();
        },
        error: (error) => {
          alert(error.error?.error?.message || 'Failed to add course');
        }
      });
  }

  resetForm(): void {
    this.newCourse = {
      name: '',
      code: '',
      department: '',
      credits: 3,
      semester: 1,
      year: 1
    };
  }
}
