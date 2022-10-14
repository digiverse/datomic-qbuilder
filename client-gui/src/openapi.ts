import { Configuration } from '../service'
import { errorMiddleware } from '@/ErrorState'

const configuration = new Configuration({
  basePath: window.location.origin,
  middleware: [errorMiddleware],
})
export default configuration
