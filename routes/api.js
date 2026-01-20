'use strict';

const Issue = require('../models/issue');

module.exports = function (app) {

  app.route('/api/issues/:project')

    // GET
    .get(async (req, res) => {
      const project = req.params.project;
      const filters = { project, ...req.query };

      try {
        const issues = await Issue.find(filters);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })

    // POST
    .post(async (req, res) => {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = '',
        status_text = ''
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const now = new Date();

      try {
        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          open: true,
          created_on: now,
          updated_on: now
        });

        const saved = await issue.save();
        res.json(saved);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })

    // PUT
    .put(async (req, res) => {
      const project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const fieldsToUpdate = Object.keys(updates).filter(
        key => updates[key] !== '' && updates[key] !== undefined
      );

      if (fieldsToUpdate.length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updates.updated_on = new Date();

      try {
        const updated = await Issue.findOneAndUpdate(
          { _id, project },
          updates,
          { new: true }
        );

        if (!updated) {
          return res.json({ error: 'could not update', _id });
        }

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // DELETE
    .delete(async (req, res) => {
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deleted = await Issue.findByIdAndDelete(_id);

        if (!deleted) {
          return res.json({ error: 'could not delete', _id });
        }

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};

