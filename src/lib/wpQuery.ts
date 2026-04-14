import { isURL, isValidPath, prependHTTPS } from '@wordpress/url';

const WP_DOMAIN = import.meta.env.WP_DOMAIN
const WP_API_CUSTOM = import.meta.env.WP_API_CUSTOM

const isValidUrl = (url: string | undefined): boolean => {
    if (!url || url === 'your-wordpress-site.com') return false
    try {
        new URL(url.startsWith('http') ? url : `https://${url}`)
        return true
    } catch {
        return false
    }
}

const domain = isValidUrl(WP_DOMAIN) 
    ? (! isURL(WP_DOMAIN) ? prependHTTPS(WP_DOMAIN) : WP_DOMAIN)
    : null

const rootUrl = domain && WP_API_CUSTOM
    ? (! isValidPath(WP_API_CUSTOM) ? `${domain}graphql/` : `${domain}${WP_API_CUSTOM}`)
    : null

export interface gqlParams {
    query: String
    variables?: object
}

export async function wpquery({ query, variables = {}}: gqlParams): Promise<any> {
    if (!rootUrl) {
        console.warn('WP_DOMAIN not configured, returning empty data')
        const q = query.toLowerCase()
        if (q.includes('pages')) return { pages: { nodes: [] } }
        if (q.includes('posts')) return { posts: { nodes: [] } }
        if (q.includes('postby')) return { postBy: null }
        return {}
    }

    const response = await fetch(rootUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            variables
        })
    })

    if (!response.ok) {
        console.error(response)
        throw new Error("Failed to fetch page info");
    }

    const { data } = await response.json()
    return data
}