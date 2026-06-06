beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2022-02-01T14:30:30.000Z'));
});

afterAll(() => {
  vi.useRealTimers();
});
