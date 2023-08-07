// https://github.com/vercel/nextjs-subscription-payments/blob/main/utils/supabase-client.ts
import { SupabaseClient, createClient, type User } from '@supabase/supabase-js'
import { Database, ProductWithPrice } from './types'

// For some reason, during build - the env variables causing errors here unless placeholder strings are provided.
export const supabaseClient = createClient<Database>(
	process.env.PUBLIC_SUPABASE_URL || 'https://www.url.com',
	process.env.PUBLIC_SUPABASE_ANON_KEY || 'supabase-anon-key'
)

export const getActiveProductsWithPrices = async (
	supabase: SupabaseClient<Database>
): Promise<ProductWithPrice[]> => {
	const { data, error } = await supabase
		.from('products')
		.select('*, prices(*)')
		.eq('active', true)
		.eq('prices.active', true)
		.order('metadata->index')
		.order('unit_amount', { foreignTable: 'prices' })

	if (error) {
		console.error(error.message)
	}
	// TODO: improve the typing here.
	return (data as ProductWithPrice[]) || []
}

export const updateUserName = async (
	supabase: SupabaseClient<Database>,
	user: User,
	name: string
) => {
	await supabase
		.from('users')
		.update({
			full_name: name
		})
		.eq('id', user.id)
}
