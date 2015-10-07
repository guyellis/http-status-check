'use strict';

// Copy this file to emailActualData.js and in that file change the values
// according to the comments

module.exports = {
  // transport is your SMTP transport. This is who will send the email for you.
  transport: {
    // service is the name of the service that you will be using.
    service: 'Gmail',
    // Your authentication credentials go here.
    auth: {
      user: 'some-user@gmail.com',
      pass: 'some-password'
    }
  },
  // locals is who you will be sending the email to
  locals: {
    email: 'noc@critical.com',
    name: {
      first: 'Noc',
      last: 'Manager'
    }
  },
  // from is who you will be sendign the email from
  from: {
    email: 'http-status-check-sender@example.com',
    name: {
      first: 'Http',
      last: 'Status'
    }
  },
  // subject is the subject that will appear in the email.
  // The date/time will be appended to the subject
  subject: 'HTTP Status Check encountered some problems'
};
