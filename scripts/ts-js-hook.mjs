// Lets plain Node run the server's .ts files, whose imports use .js (the form Vercel needs).
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && specifier.endsWith('.js')) return next(specifier.slice(0, -3) + '.ts', context)
      throw error
    }
  },
})
