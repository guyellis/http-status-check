'use strict';

// Copy this file to emailActualData.js and in that file change the values
// according to the comments

const emailData = {
  // from is who you will be sendign the email from
  from: {
    email: 'http-status-check-sender@example.com',
    name: {
      first: 'Http',
      last: 'Status',
    },
  },
  // locals is who you will be sending the email to
  locals: {
    email: 'noc@critical.com',
    name: {
      first: 'Noc',
      last: 'Manager',
    },
  },
  // subject is the subject that will appear in the email.
  // The date/time will be appended to the subject
  subject: 'HTTP Status Check encountered some problems',
  // transport is your SMTP transport. This is who will send the email for you.
  transport: {
    // Your authentication credentials go here.
    auth: {
      pass: 'some-password',
      user: 'some-user@gmail.com',
    },
    // service is the name of the service that you will be using.
    service: 'Gmail',
  },
};

export default emailData;
