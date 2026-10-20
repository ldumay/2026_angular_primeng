import { TestBed } from '@angular/core/testing';
import { LOG_LEVEL, LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOG_LEVEL, useValue: 'error' }],
    });
    service = TestBed.inject(LoggerService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes errors in the production profile', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    service.error('Une erreur de démonstration');

    expect(error).toHaveBeenCalledWith('Une erreur de démonstration');
  });

  it('does not write debug messages in the production profile', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    service.debug('Un détail de diagnostic');

    expect(debug).not.toHaveBeenCalled();
  });
});
