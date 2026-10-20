import { Component, inject } from '@angular/core';
import { LoggerService } from '../../core/logging/logger.service';

@Component({
    selector: 'app-logs-page',
    standalone: true,
    templateUrl: './logs-page.html',
    styleUrl: './logs-page.scss',
})
export class LogsPage {
    private readonly logger = inject(LoggerService);

    protected readonly logLevel = this.logger.level;

    protected writeLog(type: 'log' | 'info' | 'warn' | 'error' | 'debug'): void {
        const message = `Message console.${type} déclenché depuis la démonstration Angular.`;

        switch (type) {
            case 'info':
                this.logger.info(message);
                break;
            case 'warn':
                this.logger.warn(message);
                break;
            case 'error':
                this.logger.error(message);
                break;
            case 'debug':
                this.logger.debug(message);
                break;
            default:
                this.logger.log(message);
        }
    }

    protected writeAdvancedLog(type: 'assert' | 'table' | 'dir' | 'group' | 'time' | 'count' | 'trace'): void {
        const message = `Démonstration console.${type} depuis Angular.`;

        switch (type) {
            case 'assert':
                this.logger.assert(false, message);
                break;
            case 'table':
                this.logger.table([
                    { fonctionnalite: 'console.table', statut: 'Disponible' },
                    { fonctionnalite: 'console.dir', statut: 'Disponible' },
                ]);
                break;
            case 'dir':
                this.logger.dir({ application: 'Angular', message, version: 1 });
                break;
            case 'group':
                this.logger.group(message, () => this.logger.log('Ce message appartient au groupe.'));
                break;
            case 'time':
                this.logger.time(message, () => undefined);
                break;
            case 'count':
                this.logger.count(message);
                break;
            case 'trace':
                this.logger.trace(message);
        }
    }
}
