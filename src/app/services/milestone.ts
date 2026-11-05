import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Milestone {
  id?: number;
  name: string;
  status: string;
}

export interface MilestoneResponse {
  message: string;
  milestone: {
    name: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/milestones';

  // GET: Retrieve milestones from Express
  getMilestones(): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(this.apiUrl, {
  transferCache: false
});
  }

  // POST: Submit a milestone to Express
  addMilestone(milestone: {
    name: string;
    status: string;
  }): Observable<MilestoneResponse> {
    return this.http.post<MilestoneResponse>(
      this.apiUrl,
      milestone
    );
  }
}
