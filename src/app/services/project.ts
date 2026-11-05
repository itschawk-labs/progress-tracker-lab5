import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectInput {
  name: string;
  description: string;
  manager: string;
  startDate: string;
  dueDate: string;
  status: string;
  priority: string;
  completion: number;
}

export interface Project extends ProjectInput {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/projects';

  list(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, { transferCache: false });
  }
  get(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, { transferCache: false });
  }
  create(project: ProjectInput): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }
  update(id: string, project: ProjectInput): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
