'use strict';

import nodemailer from 'nodemailer';
import outAdapter from '../../../lib/outAdapters/emailAdapter.js';

describe('outAdapters/emailAdapter/', function () {
  describe('organizeErrors()', function () {
    test('should put object properties into an array', function () {
      const organizeErrors = outAdapter.organizeErrors;
      const errors = {
        one: 'one',
        two: 'two',
      };
      const result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('should put string into an array', function () {
      const organizeErrors = outAdapter.organizeErrors;
      const errors = 'one';
      const result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBe('one');
    });

    test('should return array of strings when errors is already an array', function () {
      const organizeErrors = outAdapter.organizeErrors;
      const errors = ['error one', 'error two'];
      const result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['error one', 'error two']);
    });
  });

  describe('writeResult()', function () {
    test('should increment success counter when successful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('success', { verbose: true });
      const successHits = outAdapter.getSuccessHits();
      expect(successHits).toBeGreaterThan(0);
    });

    test('should increment fail counter when unsuccessful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', { errors: 'some error' });
      const failHits = outAdapter.getFailHits();
      expect(failHits).toBeGreaterThan(0);
    });

    test('should increment fail counter when unsuccessful without errors property', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', { name: 'test-site' });
      const failHits = outAdapter.getFailHits();
      expect(failHits).toBe(1);
    });

    test('should increment disabled counter when url is disabled', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('disabled', { verbose: true });
      const disableHits = outAdapter.getDisableHits();
      expect(disableHits).toBeGreaterThan(0);
    });

    test('should throw an exception if an unrecognized result type is passed', function () {
      let exceptionThrown = false;
      try {
        outAdapter.writeResult('unknown', { errors: 'some error' });
      } catch (_e) {
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(true);
    });
  });

  describe('done()', function () {
    test('should not send email when failHits is zero', function () {
      outAdapter.resetHits();
      const createTransportSpy = vi.spyOn(nodemailer, 'createTransport');
      outAdapter.done();
      expect(createTransportSpy).not.toHaveBeenCalled();
      createTransportSpy.mockRestore();
    });

    test('should send email when failHits is greater than zero', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', { errors: 'sample error' });

      let capturedMailOptions: Record<string, unknown> | undefined;
      const sendMailMock = vi
        .fn()
        .mockImplementation(
          (
            options: Record<string, unknown>,
            callback: (err: Error | null, res?: { message?: string }) => void,
          ) => {
            capturedMailOptions = options;
            callback(null, { message: '250 Queued' });
          },
        );
      const transportMock = { sendMail: sendMailMock };
      const createTransportSpy = vi
        .spyOn(nodemailer, 'createTransport')
        .mockReturnValue(transportMock as unknown as ReturnType<typeof nodemailer.createTransport>);

      outAdapter.done();

      expect(createTransportSpy).toHaveBeenCalledWith('SMTP', expect.any(Object));
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(capturedMailOptions?.to).toBeDefined();
      expect(capturedMailOptions?.html).toBe('need to define some html');

      createTransportSpy.mockRestore();
    });

    test('should throw error when transport.sendMail calls back with an error', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', { errors: 'sample error' });

      const sendMailMock = vi
        .fn()
        .mockImplementation(
          (
            _options: Record<string, unknown>,
            callback: (err: Error | null, res?: { message?: string }) => void,
          ) => {
            callback(new Error('SMTP connection error'));
          },
        );
      const transportMock = { sendMail: sendMailMock };
      const createTransportSpy = vi
        .spyOn(nodemailer, 'createTransport')
        .mockReturnValue(transportMock as unknown as ReturnType<typeof nodemailer.createTransport>);

      expect(function () {
        outAdapter.done();
      }).toThrow('SMTP connection error');

      createTransportSpy.mockRestore();
    });
  });
});
