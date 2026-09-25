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

router.post('/', async (req, res) => {
  try {
    const { name, muscleGroup, equipment, sets, reps, difficulty, description } = req.body;

    if (!name || !muscleGroup || !equipment || !sets || !reps || !difficulty || !description) {
      return res.status(400).json({ error: 'All fields are required' });
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

router.put('/:id', async (req, res) => {
  try {
    const { name, muscleGroup, equipment, sets, reps, difficulty, description } = req.body;

    if (!name || !muscleGroup || !equipment || !sets || !reps || !difficulty || !description) {
      return res.status(400).json({ error: 'All fields are required' });
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

router.delete('/:id', async (req, res) => {
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