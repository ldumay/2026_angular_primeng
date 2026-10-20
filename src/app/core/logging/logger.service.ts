import { inject, Injectable, InjectionToken, isDevMode } from '@angular/core';
import type { LogLevel } from './log-level';

type OutputLogLevel = Exclude<LogLevel, 'silent'>;

export const LOG_LEVEL = new InjectionToken<LogLevel>('LOG_LEVEL', {
    providedIn: 'root',
    factory: () => (isDevMode() ? 'debug' : 'error'),
});

@Injectable({ providedIn: 'root' })
export class LoggerService {
    readonly level = inject(LOG_LEVEL);

    private readonly priorities: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        silent: 4,
    };

    debug(message: unknown, ...details: unknown[]): void {
        this.write('debug', () => console.debug(message, ...details));
    }

    log(message: unknown, ...details: unknown[]): void {
        this.write('info', () => console.log(message, ...details));
    }

    info(message: unknown, ...details: unknown[]): void {
        this.write('info', () => console.info(message, ...details));
    }

    warn(message: unknown, ...details: unknown[]): void {
        this.write('warn', () => console.warn(message, ...details));
    }

    error(message: unknown, ...details: unknown[]): void {
        this.write('error', () => console.error(message, ...details));
    }

    assert(condition: boolean, message: unknown, ...details: unknown[]): void {
        this.write('error', () => console.assert(condition, message, ...details));
    }

    table(data: unknown): void {
        this.write('debug', () => console.table(data));
    }

    dir(value: object): void {
        this.write('debug', () => console.dir(value));
    }

    group(label: string, callback: () => void): void {
        this.write('debug', () => {
            console.group(label);
            try {
                callback();
            } finally {
                console.groupEnd();
            }
        });
    }

    time(label: string, callback: () => void): void {
        this.write('debug', () => {
            console.time(label);
            try {
                callback();
            } finally {
                console.timeEnd(label);
            }
        });
    }

    count(label: string): void {
        this.write('debug', () => console.count(label));
    }

    trace(message: unknown, ...details: unknown[]): void {
        this.write('debug', () => console.trace(message, ...details));
    }

    private write(level: OutputLogLevel, action: () => void): void {
        if (this.priorities[level] >= this.priorities[this.level]) {
            action();
        }
    }
}
