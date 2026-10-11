const { ensureAuthenticated } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const logs = await db.collection('workoutLogs').find().toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve workout logs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const log = await db.collection('workoutLogs').findOne({ _id: new ObjectId(req.params.id) });
    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { exerciseId, date, setsCompleted, repsCompleted, weight, notes } = req.body;

    const errors = [];
    if (!exerciseId || typeof exerciseId !== 'string') errors.push('exerciseId must be a non-empty string');
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('date must be a string in YYYY-MM-DD format');
    if (!setsCompleted || typeof setsCompleted !== 'number' || setsCompleted < 1) errors.push('setsCompleted must be a number greater than 0');
    if (!repsCompleted || typeof repsCompleted !== 'number' || repsCompleted < 1) errors.push('repsCompleted must be a number greater than 0');
    if (!weight || typeof weight !== 'number' || weight <= 0) errors.push('weight must be a number greater than 0');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('workoutLogs').insertOne({
      exerciseId, date, setsCompleted, repsCompleted, weight, notes: notes || ''
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workout log' });
  }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { exerciseId, date, setsCompleted, repsCompleted, weight, notes } = req.body;

    const errors = [];
    if (!exerciseId || typeof exerciseId !== 'string') errors.push('exerciseId must be a non-empty string');
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('date must be a string in YYYY-MM-DD format');
    if (!setsCompleted || typeof setsCompleted !== 'number' || setsCompleted < 1) errors.push('setsCompleted must be a number greater than 0');
    if (!repsCompleted || typeof repsCompleted !== 'number' || repsCompleted < 1) errors.push('repsCompleted must be a number greater than 0');
    if (!weight || typeof weight !== 'number' || weight <= 0) errors.push('weight must be a number greater than 0');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('workoutLogs').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { exerciseId, date, setsCompleted, repsCompleted, weight, notes: notes || '' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('workoutLogs').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

module.exports = router;