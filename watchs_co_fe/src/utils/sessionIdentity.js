export const selectSessionKey = (state) =>
  `${state.auth?.user?.id ?? "guest"}:${state.auth?.sessionEpoch ?? 0}`;
