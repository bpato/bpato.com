import { isValidPath } from '@wordpress/url'

const WP_DOMAIN = import.meta.env.WP_DOMAIN
const WP_API_CUSTOM = import.meta.env.WP_API_CUSTOM

/**
 * Normaliza y valida el dominio
 */
const normalizeDomain = (url: string | undefined): string | null => {
    if (!url) return null

    let domain = url.trim()

    // asegurar protocolo
    if (!domain.startsWith('http')) {
        domain = `https://${domain}`
    }

    try {
        new URL(domain)
        return domain
    } catch {
        return null
    }
}

const domain = normalizeDomain(WP_DOMAIN)

/**
 * Construcción segura del endpoint
 */
const rootUrl = (() => {
    if (!domain || !WP_API_CUSTOM) return null

    const apiPath = WP_API_CUSTOM.trim()

    // no asumir graphql por defecto
    const finalPath = isValidPath(apiPath) ? apiPath : null

    if (!finalPath) return null

    return `${domain.replace(/\/$/, '')}/${finalPath.replace(/^\/+/, '')}`
})()

export interface gqlParams {
    query: string
    variables?: object
}

export async function wpquery({ query, variables = {} }: gqlParams): Promise<any> {
    if (!rootUrl) {
        console.warn('WP config missing, returning empty data')

        console.log('WP_DOMAIN raw:', WP_DOMAIN)
        console.log('WP_API_CUSTOM raw:', WP_API_CUSTOM)
        console.log('domain parsed:', domain)
        console.log('rootUrl:', rootUrl)

        const q = query.toLowerCase()

        if (q.includes('pages')) return { pages: { nodes: [] } }
        if (q.includes('posts')) return { posts: { nodes: [] } }
        if (q.includes('postby')) return { postBy: null }

        return {}
    }

    const response = await fetch(rootUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        const preview = errorText.substring(0, 500)
        console.error(`WP API error ${response.status}: ${response.statusText}`)
        console.error('Response preview:', preview)
        throw new Error(`WP API error: ${response.status} ${response.statusText}`)
    }

    try {
        const { data } = await response.json()
        return data
    } catch (e) {
        console.error('Invalid JSON response from WP API - server may be down')
        throw e
    }
}