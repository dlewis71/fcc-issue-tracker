'use strict';

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb'); // If using MongoDB
const Issue = require('../models/issue'); // Your Mongoose model


module.exports = function (app) {

  app.route('/api/issues/:project')

  router.get('/api/issues/:project', async (req, res) => {
    const project = req.params.project;
    const filter = { project, ...req.query }; // Accept query params as filters

    try {
      const issues = await Issue.find(filter).exec();
      res.json(issues);
    } catch (err) {
      res.json({ error: 'could not fetch issues' });
    }
  });


  router.post('/api/issues/:project', async (req, res) => {
    const project = req.params.project;
    const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: 'required field(s) missing' });
    }

    const now = new Date();
    const issue = new Issue({
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      created_on: now,
      updated_on: now,
      open: true
    });

    try {
      const savedIssue = await issue.save();
      res.json(savedIssue);
    } catch (err) {
      res.json({ error: 'could not create issue' });
    }
  });


  router.put('/api/issues/:project', async (req, res) => {
    const { _id, ...fields } = req.body;

    if (!_id) return res.json({ error: 'missing _id' });
    if (Object.keys(fields).length === 0) return res.json({ error: 'no update field(s) sent', _id });

    fields.updated_on = new Date(); // Update timestamp

    try {
      const updated = await Issue.findByIdAndUpdate(_id, fields, { new: true }).exec();
      if (!updated) return res.json({ error: 'could not update', _id });
      res.json({ result: 'successfully updated', _id });
    } catch (err) {
      res.json({ error: 'could not update', _id });
    }
  });


  router.delete('/api/issues/:project', async (req, res) => {
    const { _id } = req.body;

    if (!_id) return res.json({ error: 'missing _id' });

    try {
      const deleted = await Issue.findByIdAndDelete(_id).exec();
      if (!deleted) return res.json({ error: 'could not delete', _id });
      res.json({ result: 'successfully deleted', _id });
    } catch (err) {
      res.json({ error: 'could not delete', _id });
    }
  });


};
