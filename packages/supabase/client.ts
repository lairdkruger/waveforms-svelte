// https://github.com/vercel/nextjs-subscription-payments/blob/main/utils/supabase-client.ts

import { User, createClient } from '@supabase/supabase-js'
import { ProductWithPrice } from './types'
import { Database } from './types'

export const supabase = createClient<Database>(
	process.env.PUBLIC_SUPABASE_URL || '',
	process.env.PUBLIC_SUPABASE_ANON_KEY || ''
)

export const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
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

export const updateUserName = async (user: User, name: string) => {
	await supabase
		.from('users')
		.update({
			full_name: name
		})
		.eq('id', user.id)
}
