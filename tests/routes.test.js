// Set env vars before anything loads
process.env.SESSION_SECRET = 'test-secret';

const request = require('supertest');
const { ObjectId } = require('mongodb');

// Mock passport config before requiring the app
jest.mock('../config/passport', () => {
  return function (passport) {
    // no-op for testing
  };
});

// Mock the database module before requiring the app
jest.mock('../db', () => {
  const mockCollection = {
    find: jest.fn(),
    findOne: jest.fn()
  };
  const mockDb = {
    collection: jest.fn(() => mockCollection)
  };
  const connectDB = jest.fn(() => Promise.resolve(mockDb));
  connectDB._mockDb = mockDb;
  connectDB._mockCollection = mockCollection;
  return connectDB;
});

const app = require('../server');
const connectDB = require('../db');
const mockCollection = connectDB._mockCollection;

const mockDb = connectDB._mockDb;

beforeEach(() => {
  jest.clearAllMocks();
  // Re-set connectDB to return the mockDb after clearAllMocks
  connectDB.mockResolvedValue(mockDb);
  mockDb.collection.mockReturnValue(mockCollection);
  // Reset default mock implementations
  mockCollection.find.mockReturnValue({
    toArray: jest.fn().mockResolvedValue([])
  });
  mockCollection.findOne.mockResolvedValue(null);
});

// ============================================
// EXERCISES
// ============================================
describe('GET /exercises', () => {
  test('should return all exercises with status 200', async () => {
    const mockExercises = [
      { _id: new ObjectId(), name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: 10, difficulty: 'Intermediate', description: 'Flat bench press' },
      { _id: new ObjectId(), name: 'Squats', muscleGroup: 'Legs', equipment: 'Barbell', sets: 5, reps: 5, difficulty: 'Advanced', description: 'Back squats' }
    ];
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockExercises)
    });

    const res = await request(app).get('/exercises');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Bench Press');
    expect(res.body[1].name).toBe('Squats');
  });

  test('should return empty array when no exercises exist', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/exercises');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /exercises/:id', () => {
  test('should return a single exercise with status 200', async () => {
    const id = new ObjectId();
    const mockExercise = { _id: id, name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: 10, difficulty: 'Intermediate', description: 'Flat bench press' };
    mockCollection.findOne.mockResolvedValue(mockExercise);

    const res = await request(app).get(`/exercises/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bench Press');
  });

  test('should return 404 when exercise not found', async () => {
    const id = new ObjectId();
    mockCollection.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/exercises/${id}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Exercise not found');
  });

  test('should return 400 for invalid id format', async () => {
    const res = await request(app).get('/exercises/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid id format');
  });
});

// ============================================
// WORKOUT LOGS
// ============================================
describe('GET /workout-logs', () => {
  test('should return all workout logs with status 200', async () => {
    const mockLogs = [
      { _id: new ObjectId(), exerciseId: 'abc123', date: '2026-10-08', setsCompleted: 4, repsCompleted: 10, weight: 135, notes: 'Good session' },
      { _id: new ObjectId(), exerciseId: 'def456', date: '2026-10-09', setsCompleted: 3, repsCompleted: 8, weight: 185, notes: '' }
    ];
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockLogs)
    });

    const res = await request(app).get('/workout-logs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].exerciseId).toBe('abc123');
  });

  test('should return empty array when no workout logs exist', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/workout-logs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /workout-logs/:id', () => {
  test('should return a single workout log with status 200', async () => {
    const id = new ObjectId();
    const mockLog = { _id: id, exerciseId: 'abc123', date: '2026-10-08', setsCompleted: 4, repsCompleted: 10, weight: 135, notes: 'Great' };
    mockCollection.findOne.mockResolvedValue(mockLog);

    const res = await request(app).get(`/workout-logs/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.exerciseId).toBe('abc123');
  });

  test('should return 404 when workout log not found', async () => {
    const id = new ObjectId();
    mockCollection.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/workout-logs/${id}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Workout log not found');
  });

  test('should return 400 for invalid id format', async () => {
    const res = await request(app).get('/workout-logs/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid id format');
  });
});

// ============================================
// WORKOUT PLANS
// ============================================
describe('GET /workout-plans', () => {
  test('should return all workout plans with status 200', async () => {
    const mockPlans = [
      { _id: new ObjectId(), name: 'PPL Split', description: 'Push Pull Legs', daysPerWeek: 6, exercises: ['Bench', 'Squat'], difficulty: 'Intermediate', durationWeeks: 12 }
    ];
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockPlans)
    });

    const res = await request(app).get('/workout-plans');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('PPL Split');
  });

  test('should return empty array when no workout plans exist', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/workout-plans');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /workout-plans/:id', () => {
  test('should return a single workout plan with status 200', async () => {
    const id = new ObjectId();
    const mockPlan = { _id: id, name: 'PPL Split', description: 'Push Pull Legs', daysPerWeek: 6, exercises: ['Bench'], difficulty: 'Intermediate', durationWeeks: 12 };
    mockCollection.findOne.mockResolvedValue(mockPlan);

    const res = await request(app).get(`/workout-plans/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('PPL Split');
  });

  test('should return 404 when workout plan not found', async () => {
    const id = new ObjectId();
    mockCollection.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/workout-plans/${id}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Workout plan not found');
  });

  test('should return 400 for invalid id format', async () => {
    const res = await request(app).get('/workout-plans/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid id format');
  });
});

// ============================================
// GOALS
// ============================================
describe('GET /goals', () => {
  test('should return all goals with status 200', async () => {
    const mockGoals = [
      { _id: new ObjectId(), title: 'Bench 225', description: 'Hit 225 bench', targetDate: '2027-03-01', category: 'Strength', targetValue: 225, currentValue: 185, unit: 'lbs' }
    ];
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockGoals)
    });

    const res = await request(app).get('/goals');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Bench 225');
  });

  test('should return empty array when no goals exist', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/goals');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /goals/:id', () => {
  test('should return a single goal with status 200', async () => {
    const id = new ObjectId();
    const mockGoal = { _id: id, title: 'Bench 225', description: 'Hit 225 bench', targetDate: '2027-03-01', category: 'Strength', targetValue: 225, currentValue: 185, unit: 'lbs' };
    mockCollection.findOne.mockResolvedValue(mockGoal);

    const res = await request(app).get(`/goals/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Bench 225');
  });

  test('should return 404 when goal not found', async () => {
    const id = new ObjectId();
    mockCollection.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/goals/${id}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Goal not found');
  });

  test('should return 400 for invalid id format', async () => {
    const res = await request(app).get('/goals/invalidid');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid id format');
  });
});
