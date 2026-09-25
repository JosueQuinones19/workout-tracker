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

router.post('/', async (req, res) => {
  try {
    const { exerciseId, date, setsCompleted, repsCompleted, weight, notes } = req.body;

    if (!exerciseId || !date || !setsCompleted || !repsCompleted || !weight) {
      return res.status(400).json({ error: 'exerciseId, date, setsCompleted, repsCompleted, and weight are required' });
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

router.put('/:id', async (req, res) => {
  try {
    const { exerciseId, date, setsCompleted, repsCompleted, weight, notes } = req.body;

    if (!exerciseId || !date || !setsCompleted || !repsCompleted || !weight) {
      return res.status(400).json({ error: 'exerciseId, date, setsCompleted, repsCompleted, and weight are required' });
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

router.delete('/:id', async (req, res) => {
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