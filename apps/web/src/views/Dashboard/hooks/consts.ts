export const refreshIntervalForInfo = 15000 // 15s
export const QUERY_SETTINGS_IMMUTABLE = {
  refetchOnReconnect: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
}
export const QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH = {
  retry: 3,
  retryDelay: 3000,
}
export const QUERY_SETTINGS_INTERVAL_REFETCH = {
  refetchInterval: refreshIntervalForInfo,
  keepPreviousData: true,
  ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
}
export const graphPerPage = 50
