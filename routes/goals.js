const { ensureAuthenticated } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const goals = await db.collection('goals').find().toArray();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve goals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const goal = await db.collection('goals').findOne({ _id: new ObjectId(req.params.id) });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, targetDate, category, targetValue, currentValue, unit } = req.body;

    const errors = [];
    if (!title || typeof title !== 'string') errors.push('title must be a non-empty string');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');
    if (!targetDate || typeof targetDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) errors.push('targetDate must be a string in YYYY-MM-DD format');
    if (!category || typeof category !== 'string' || !['Strength', 'Endurance', 'Weight Loss', 'Muscle Gain', 'Flexibility'].includes(category)) errors.push('category must be Strength, Endurance, Weight Loss, Muscle Gain, or Flexibility');
    if (targetValue === undefined || typeof targetValue !== 'number' || targetValue <= 0) errors.push('targetValue must be a number greater than 0');
    if (currentValue === undefined || typeof currentValue !== 'number' || currentValue < 0) errors.push('currentValue must be a number 0 or greater');
    if (!unit || typeof unit !== 'string') errors.push('unit must be a non-empty string');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('goals').insertOne({
      title, description, targetDate, category, targetValue, currentValue, unit
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, targetDate, category, targetValue, currentValue, unit } = req.body;

    const errors = [];
    if (!title || typeof title !== 'string') errors.push('title must be a non-empty string');
    if (!description || typeof description !== 'string') errors.push('description must be a non-empty string');
    if (!targetDate || typeof targetDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) errors.push('targetDate must be a string in YYYY-MM-DD format');
    if (!category || typeof category !== 'string' || !['Strength', 'Endurance', 'Weight Loss', 'Muscle Gain', 'Flexibility'].includes(category)) errors.push('category must be Strength, Endurance, Weight Loss, Muscle Gain, or Flexibility');
    if (targetValue === undefined || typeof targetValue !== 'number' || targetValue <= 0) errors.push('targetValue must be a number greater than 0');
    if (currentValue === undefined || typeof currentValue !== 'number' || currentValue < 0) errors.push('currentValue must be a number 0 or greater');
    if (!unit || typeof unit !== 'string') errors.push('unit must be a non-empty string');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await connectDB();
    const result = await db.collection('goals').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, description, targetDate, category, targetValue, currentValue, unit } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('goals').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid id format' });
  }
});

module.exports = router;
