import { reactive, toRefs } from 'vue'
import type { ResponseContext } from '../service'

const state = reactive({
  error: null as string | null,
})

export const errorMiddleware = {
  post: (context: ResponseContext) => {
    if (!context.response.ok || context.response.status >= 400) {
      state.error = context.response.statusText
      return Promise.reject(context.response.statusText)
    }

    return Promise.resolve(context.response)
  },
}

export default function useErrorState() {
  return {
    ...toRefs(state),
    clearError: () => {
      state.error = null
    },
  }
}
