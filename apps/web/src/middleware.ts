// middleware.ts
import { withABTesting } from 'middlewares/ab-test-middleware'
import { withClientId } from 'middlewares/client-id-middleware'
import { withUserIp } from 'middlewares/ip-address-middleware'
import { stackMiddlewares } from 'middlewares/stack-middleware'

export const middleware = stackMiddlewares([withClientId, withUserIp, withABTesting])

export const config = {
  matcher: [
    '/',
    '/swap',
    '/pools/:path*',
    '/add/:path*',
    '/remove/:path*',
    '/tokens/:path*',
    '/v2/:path*',
    '/increase/:path*',
    '/liquidity/:path*',
    '/terms',
    '/dashboard/:path*',
  ],
}
