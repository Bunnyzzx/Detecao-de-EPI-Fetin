import * as SecureStore from 'expo-secure-store';

import { deviceTokenStore } from '../deviceTokenStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockedSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockedDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

/** Nunca um JWT real — só uma string de teste. */
const FAKE_TOKEN = 'fake-device-token';
const DEVICE_TOKEN_KEY = '@epi-fetin/device-token';

describe('deviceTokenStore', () => {
  beforeEach(() => {
    mockedGetItemAsync.mockReset();
    mockedSetItemAsync.mockReset();
    mockedDeleteItemAsync.mockReset();
  });

  it('set() salva o token na chave correta via SecureStore', async () => {
    mockedSetItemAsync.mockResolvedValueOnce();

    await deviceTokenStore.set(FAKE_TOKEN);

    expect(mockedSetItemAsync).toHaveBeenCalledWith(DEVICE_TOKEN_KEY, FAKE_TOKEN);
  });

  it('get() lê o token pela mesma chave', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(FAKE_TOKEN);

    const result = await deviceTokenStore.get();

    expect(mockedGetItemAsync).toHaveBeenCalledWith(DEVICE_TOKEN_KEY);
    expect(result).toBe(FAKE_TOKEN);
  });

  it('get() devolve null quando nenhum token foi provisionado ainda', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(null);

    await expect(deviceTokenStore.get()).resolves.toBeNull();
  });

  it('remove() apaga o token pela mesma chave', async () => {
    mockedDeleteItemAsync.mockResolvedValueOnce();

    await deviceTokenStore.remove();

    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(DEVICE_TOKEN_KEY);
  });

  it('propaga falha do SecureStore como AppError, sem vazar o token na mensagem', async () => {
    mockedSetItemAsync.mockRejectedValueOnce(new Error('keystore indisponível'));

    await expect(deviceTokenStore.set(FAKE_TOKEN)).rejects.toMatchObject({
      code: 'storage',
      message: expect.not.stringContaining(FAKE_TOKEN),
    });
  });

  it('nunca imprime o token em console.log/console.error', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedSetItemAsync.mockResolvedValueOnce();
    mockedGetItemAsync.mockResolvedValueOnce(FAKE_TOKEN);

    await deviceTokenStore.set(FAKE_TOKEN);
    await deviceTokenStore.get();

    const loggedArgs = [...logSpy.mock.calls, ...errorSpy.mock.calls].flat();
    expect(loggedArgs).not.toContain(FAKE_TOKEN);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
