import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MilestoneService } from './milestone';

describe('MilestoneService', () => {
  let service: MilestoneService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/milestones';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MilestoneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET milestones from the Express API', () => {
    const data = [{ id: 1, name: 'Project Planning', status: 'Completed' }];
    service.getMilestones().subscribe((result) => expect(result).toEqual(data));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(data);
  });

  it('should POST a new milestone to the Express API', () => {
    const milestone = { name: 'Complete Lab 4', status: 'In Progress' };
    service.addMilestone(milestone).subscribe((result) =>
      expect(result.message).toBe('Milestone submitted successfully'),
    );

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(milestone);
    req.flush({ message: 'Milestone submitted successfully', milestone });
  });
});
