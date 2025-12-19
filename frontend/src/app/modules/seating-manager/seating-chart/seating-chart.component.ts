import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatingService } from '../../../services/seating.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-seating-chart',
  templateUrl: './seating-chart.component.html',
  styleUrls: ['./seating-chart.component.scss']
})
export class SeatingChartComponent implements OnInit {
  examId: number | null = null;
  exam: any = null;
  chart: any = null;
  statistics: any = null;
  
  loading = false;
  searchTerm = '';
  selectedRoom: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private seatingService: SeatingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.examId = +params['examId'];
      if (this.examId) {
        this.loadSeatingChart();
        this.loadStatistics();
      }
    });
  }

  loadSeatingChart(): void {
    if (!this.examId) return;

    this.loading = true;
    this.seatingService.getSeatingChart(this.examId).subscribe({
      next: (response) => {
        this.chart = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load seating chart');
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    if (!this.examId) return;

    this.seatingService.getStatistics(this.examId).subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: () => {
        // Silent fail
      }
    });
  }

  exportChart(): void {
    if (!this.examId) return;

    this.seatingService.exportChart(this.examId).subscribe({
      next: (response) => {
        const csvData = response.data;
        this.downloadCSV(csvData);
        this.toast.success('Seating chart exported successfully');
      },
      error: () => {
        this.toast.error('Failed to export chart');
      }
    });
  }

  downloadCSV(data: any[][]): void {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seating-chart-exam-${this.examId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  printChart(): void {
    window.print();
  }

  filterRooms(): any[] {
    if (!this.chart || !this.chart.rooms) return [];

    let rooms = this.chart.rooms;

    if (this.selectedRoom) {
      rooms = rooms.filter((r: any) => r.room_name === this.selectedRoom);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      rooms = rooms.map((room: any) => ({
        ...room,
        students: room.students.filter((s: any) => 
          s.roll_number.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term)
        )
      })).filter((room: any) => room.students.length > 0);
    }

    return rooms;
  }

  getRoomNames(): string[] {
    if (!this.chart || !this.chart.rooms) return [];
    return this.chart.rooms.map((r: any) => r.room_name);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRoom = null;
  }

  goBack(): void {
    this.router.navigate(['/seating-manager']);
  }
}
