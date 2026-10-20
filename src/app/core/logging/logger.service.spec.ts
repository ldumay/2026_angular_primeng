import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoggerService, LOG_LEVEL } from './logger.service';

describe('LoggerService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('filters messages below the configured threshold', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: LOG_LEVEL, useValue: 'warn' }],
        });
        const logger = TestBed.inject(LoggerService);
        const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        logger.debug('diagnostic');
        logger.warn('attention');

        expect(debug).not.toHaveBeenCalled();
        expect(warning).toHaveBeenCalledWith('attention');
    });

    it('closes console groups when their callback throws', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: LOG_LEVEL, useValue: 'debug' }],
        });
        const logger = TestBed.inject(LoggerService);
        vi.spyOn(console, 'group').mockImplementation(() => undefined);
        const groupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

        expect(() =>
            logger.group('test group', () => {
                throw new Error('failure');
            }),
        ).toThrow('failure');

        expect(groupEnd).toHaveBeenCalledOnce();
    });
});
