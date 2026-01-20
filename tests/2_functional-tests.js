const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);
const assert = chai.assert;

let testId;

suite('Functional Tests', function () {

  suite('POST /api/issues/{project}', function () {

    test('Create an issue with every field', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Tester',
          assigned_to: 'Dev',
          status_text: 'In Progress'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.isTrue(res.body.open);
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Required',
          issue_text: 'Only',
          created_by: 'Tester'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, '');
          done();
        });
    });

    test('Create an issue with missing required fields', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({ issue_title: 'Missing' })
        .end((err, res) => {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function () {

    test('View issues on a project', done => {
      chai.request(server)
        .get('/api/issues/test')
        .end((err, res) => {
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', done => {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end((err, res) => {
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with multiple filters', done => {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, created_by: 'Tester' })
        .end((err, res) => {
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function () {

    test('Update one field on an issue', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_text: 'Updated' })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update multiple fields on an issue', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_text: 'Updated again',
          status_text: 'Done'
        })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update an issue with missing _id', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({ issue_text: 'Fail' })
        .end((err, res) => {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId })
        .end((err, res) => {
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with an invalid _id', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: 'invalidid', issue_text: 'Fail' })
        .end((err, res) => {
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function () {

    test('Delete an issue', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete an issue with an invalid _id', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: 'invalidid' })
        .end((err, res) => {
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete an issue with missing _id', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});

