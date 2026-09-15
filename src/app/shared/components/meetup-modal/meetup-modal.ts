import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { MeetupService, MeetupPlace } from '../../../core/services/meetup.service';

@Component({
  selector: 'app-meetup-modal',
  standalone: true,
  imports: [],
  templateUrl: './meetup-modal.html',
  styleUrl: './meetup-modal.css'
})
export class MeetupModalComponent implements OnInit {
  @Input({ required: true }) city!: string;
  @Output() close = new EventEmitter<void>();

  private meetupService = inject(MeetupService);

  places: MeetupPlace[] = [];
  loading = true;

  ngOnInit(): void {
    if (this.city) {
      this.meetupService.getMeetupPoints(this.city).subscribe({
        next: (res) => {
          this.places = res.places;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
