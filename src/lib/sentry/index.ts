import * as Sentry from '@sentry/nextjs';
import { PostgrestError } from '@supabase/supabase-js'

function shouldLogLocally() {
  return process.env.SENTRY_ENABLED === 'false' || process.env.SENTRY_LOG_LOCAL === 'true'
}

function shouldLogToSentry() {
  return process.env.SENTRY_ENABLED === 'true'
}

export const logError = (error: Error | PostgrestError | null) => {
  if (error && shouldLogLocally()) {
    console.error(error)
  }
  if (error && shouldLogToSentry()) {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: { action: 'signOut' },
      extra: { errorMessage: error.message }
    })
  }
}

export const logMessage = (message: string | null | undefined, shouldLog: boolean) => {
  if (shouldLog || (message && shouldLogLocally())) {
    console.log(message)
  }
  if (message && shouldLogToSentry()) {
    // Log the error to Sentry
    Sentry.captureException(message, {
      tags: { action: 'signOut' },
      extra: { errorMessage: message }
    })
  }
}

const sentryHelper = {
  logError,
  logMessage
}

export default sentryHelper