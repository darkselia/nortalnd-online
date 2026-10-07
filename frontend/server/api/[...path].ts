import { proxyApiRequest } from '../utils/apiProxy';

export default defineEventHandler(event => {
  const config = useRuntimeConfig(event);
  return proxyApiRequest(event, config.backendOrigin);
});
