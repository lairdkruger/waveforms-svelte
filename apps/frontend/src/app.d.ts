import type { SupabaseClient, Session } from '@supabase/supabase-js'
import type { Database } from 'supabase'
import type { z } from 'zod'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>
			getSession(): Promise<Session | null>
		}
		interface PageData {
			session: Session | null
			subscribed: boolean
		}
		interface FormActionReturn {
			[key: string]: any
			id: string
			success?: boolean
			message?: string
			data?: any // Returns form data back to form
			issues?: z.ZodIssue[]
		}
	}
}
