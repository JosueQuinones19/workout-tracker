const { ensureAuthenticated } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const exercises = await db.collection('exercises').find().toArray();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve exercises' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(req.params.id) });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { name, muscleGroup, equipment, sets, reps, difficulty, description } = req.body;

    const errors = [];
    if (!name || typeof name !== 'string') errors.push('name must be a non-empty string');
    if (!muscleGroup || typeof muscleGroup !== 'string') errors.push('muscleGroup must be a non-empty string');
    if (!equipment || typeof equipment !== 'string') errors.push('equipment must be a non-empty string');
    if (!sets || typeof sets !== 'number' || sets < 1) errors.push('sets must be a number greater than 0');
    if (!reps || typeof reps !== 'number' || reps < 1) errors.push('reps must be a number greater than 0');
    if (!difficulty || typeof difficulty !== 'string' || !['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) errors.push('difficulty must be Beginner, Intermediate, or Advanced');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('exercises').insertOne({
      name, muscleGroup, equipment, sets, reps, difficulty, description
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { name, muscleGroup, equipment, sets, reps, difficulty, description } = req.body;

    const errors = [];
    if (!name || typeof name !== 'string') errors.push('name must be a non-empty string');
    if (!muscleGroup || typeof muscleGroup !== 'string') errors.push('muscleGroup must be a non-empty string');
    if (!equipment || typeof equipment !== 'string') errors.push('equipment must be a non-empty string');
    if (!sets || typeof sets !== 'number' || sets < 1) errors.push('sets must be a number greater than 0');
    if (!reps || typeof reps !== 'number' || reps < 1) errors.push('reps must be a number greater than 0');
    if (!difficulty || typeof difficulty !== 'string' || !['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) errors.push('difficulty must be Beginner, Intermediate, or Advanced');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('exercises').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, muscleGroup, equipment, sets, reps, difficulty, description } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('exercises').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

module.exports = router;