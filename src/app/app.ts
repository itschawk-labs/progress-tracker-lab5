import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Project, ProjectInput, ProjectService } from './services/project';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly projectsApi = inject(ProjectService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  projects: Project[] = [];
  selectedProject: Project | null = null;
  editingId: string | null = null;
  message = '';
  errorMessage = '';
  busy = false;

  projectForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.required],
    manager: ['', Validators.required],
    startDate: ['', Validators.required],
    dueDate: ['', Validators.required],
    status: ['Not Started', Validators.required],
    priority: ['Medium', Validators.required],
    completion: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  ngOnInit(): void { this.loadProjects(); }

  loadProjects(): void {
    this.projectsApi.list().subscribe({
      next: projects => {
        this.projects = projects;
        this.cdr.markForCheck();
      },
      error: err => this.showError(err, 'Unable to load projects')
    });
  }

  saveProject(): void {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid || this.busy) return;
    const payload: ProjectInput = this.projectForm.getRawValue();
    if (payload.dueDate < payload.startDate) {
      this.errorMessage = 'Due date must be on or after the start date.';
      return;
    }
    this.busy = true;
    this.message = '';
    this.errorMessage = '';
    const operation = this.editingId
      ? this.projectsApi.update(this.editingId, payload)
      : this.projectsApi.create(payload);
    operation.subscribe({
      next: project => {
        this.message = this.editingId ? 'Project updated successfully.' : 'Project created successfully.';
        this.busy = false;
        this.selectedProject = project;
        this.resetForm(false);
        this.loadProjects();
        this.cdr.markForCheck();
      },
      error: err => {
        this.busy = false;
        this.showError(err, 'Could not save project');
      }
    });
  }

  viewProject(project: Project): void {
    this.message = '';
    this.errorMessage = '';
    this.projectsApi.get(project._id).subscribe({
      next: result => { this.selectedProject = result; this.cdr.markForCheck(); },
      error: err => this.showError(err, 'Unable to load project details')
    });
  }

  editProject(project: Project): void {
    this.editingId = project._id;
    this.selectedProject = project;
    this.projectForm.setValue({
      name: project.name,
      description: project.description,
      manager: project.manager,
      startDate: project.startDate.slice(0, 10),
      dueDate: project.dueDate.slice(0, 10),
      status: project.status,
      priority: project.priority,
      completion: project.completion
    });
    this.message = 'Editing selected project. Update fields, then choose Save changes.';
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  deleteProject(project: Project): void {
    if (this.busy || !confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    this.busy = true;
    this.message = '';
    this.errorMessage = '';
    this.projectsApi.delete(project._id).subscribe({
      next: () => {
        this.busy = false;
        this.message = 'Project deleted successfully.';
        if (this.selectedProject?._id === project._id) this.selectedProject = null;
        if (this.editingId === project._id) this.resetForm(false);
        this.loadProjects();
        this.cdr.markForCheck();
      },
      error: err => {
        this.busy = false;
        this.showError(err, 'Could not delete project');
      }
    });
  }

  resetForm(clearMessages = true): void {
    this.editingId = null;
    this.projectForm.reset({
      name: '', description: '', manager: '', startDate: '', dueDate: '',
      status: 'Not Started', priority: 'Medium', completion: 0
    });
    if (clearMessages) { this.message = ''; this.errorMessage = ''; }
  }

  private showError(err: { error?: { message?: string } }, fallback: string): void {
    this.errorMessage = err?.error?.message || fallback;
    this.cdr.markForCheck();
  }
}
