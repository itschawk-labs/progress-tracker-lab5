import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

const API = 'http://localhost:8000/api/projects';

describe('App Lab 5', () => {
  let httpMock: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('loads an initially empty project list', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(API).flush([]);
    expect(fixture.componentInstance.projects.length).toBe(0);
  });

  it('retrieves project records with GET', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const project = {
      _id: '507f1f77bcf86cd799439011', name: 'Sample', description: 'Demo',
      manager: 'Tester', startDate: '2026-11-05T00:00:00.000Z',
      dueDate: '2026-11-06T00:00:00.000Z', status: 'Not Started',
      priority: 'Medium', completion: 0
    };
    httpMock.expectOne(API).flush([project]);
    expect(fixture.componentInstance.projects[0].name).toBe('Sample');
  });
});
