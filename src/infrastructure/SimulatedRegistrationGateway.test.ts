import { SimulatedRegistrationGateway } from './SimulatedRegistrationGateway';

describe('SimulatedRegistrationGateway', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('R1: con delayMs 0 resuelve success', async () => {
    await expect(new SimulatedRegistrationGateway({ delayMs: 0 }).register()).resolves.toEqual({
      kind: 'success',
    });
  });

  it('R1: con el retardo por defecto resuelve a los 1000 ms y no antes', async () => {
    vi.useFakeTimers();
    let settled = false;
    const pending = new SimulatedRegistrationGateway().register().then((result) => {
      settled = true;
      return result;
    });
    await vi.advanceTimersByTimeAsync(999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ kind: 'success' });
  });

  it('R3/FR-014/T-INF-01: no usa red, almacenamiento ni consola', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => undefined),
    );
    const result = await new SimulatedRegistrationGateway({ delayMs: 0 }).register();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    consoleSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(JSON.stringify(result)).not.toMatch(/password/i);
  });
});
