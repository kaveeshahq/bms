import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit {
  member: Member | null = null;

  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    this.memberService.getById(id).subscribe({
      next: (data) => {
        this.member = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading member', err)
    });
  }
}