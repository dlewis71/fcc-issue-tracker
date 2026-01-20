'use strict';

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: { type: String },           // project name
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: () => new Date() },
  updated_on: { type: Date, default: () => new Date() },
  open: { type: Boolean, default: true }
});

module.exports = mongoose.model('Issue', issueSchema);
