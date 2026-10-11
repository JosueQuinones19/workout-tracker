const { ensureAuthenticated } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const plans = await db.collection('workoutPlans').find().toArray();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve workout plans' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const plan = await db.collection('workoutPlans').findOne({ _id: new ObjectId(req.params.id) });
    if (!plan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, daysPerWeek, exercises, difficulty, durationWeeks } = req.body;

    const errors = [];
    if (!name || typeof name !== 'string') errors.push('name must be a non-empty string');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');
    if (!daysPerWeek || typeof daysPerWeek !== 'number' || daysPerWeek < 1 || daysPerWeek > 7) errors.push('daysPerWeek must be a number between 1 and 7');
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) errors.push('exercises must be a non-empty array');
    if (!difficulty || typeof difficulty !== 'string' || !['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) errors.push('difficulty must be Beginner, Intermediate, or Advanced');
    if (!durationWeeks || typeof durationWeeks !== 'number' || durationWeeks < 1) errors.push('durationWeeks must be a number greater than 0');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('workoutPlans').insertOne({
      name, description, daysPerWeek, exercises, difficulty, durationWeeks
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workout plan' });
  }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, daysPerWeek, exercises, difficulty, durationWeeks } = req.body;

    const errors = [];
    if (!name || typeof name !== 'string') errors.push('name must be a non-empty string');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');
    if (!daysPerWeek || typeof daysPerWeek !== 'number' || daysPerWeek < 1 || daysPerWeek > 7) errors.push('daysPerWeek must be a number between 1 and 7');
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) errors.push('exercises must be a non-empty array');
    if (!difficulty || typeof difficulty !== 'string' || !['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) errors.push('difficulty must be Beginner, Intermediate, or Advanced');
    if (!durationWeeks || typeof durationWeeks !== 'number' || durationWeeks < 1) errors.push('durationWeeks must be a number greater than 0');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('workoutPlans').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, description, daysPerWeek, exercises, difficulty, durationWeeks } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('workoutPlans').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

module.exports = router;
