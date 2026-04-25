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

export interface GqlParams {
    query: string
    variables?: object
}

const MAX_RETRIES = 5
const INITIAL_DELAY = 10000  // 10 segundos inicial (aumentado de 5s)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Determina si un error HTTP debe ser reintentado.
 * Reininta en: Rate limit (429), Service unavailable (503), Bad gateway (502)
 */
const shouldRetry = (status: number) => {
    return status === 429 || status === 503 || status === 502
}

/**
 * Calcula el delay para el reintento usando exponential backoff con jitter.
 * Distribuye 5 intentos con máximo de 5 minutos en el último.
 * Formula: (INITIAL_DELAY * 2^attempt) capped a 5 minutos
 * Delays: 10s → 20s → 40s → 80s → 300s (5 minutos)
 * El jitter evita que múltiples requests reinten simultáneamente (thundering herd)
 */
const getBackoffDelay = (attempt: number): number => {
    const maxDelay = 5 * 60 * 1000  // 5 minutos
    const exponentialDelay = INITIAL_DELAY * Math.pow(2, attempt)
    const cappedDelay = Math.min(exponentialDelay, maxDelay)
    // Agregar jitter (±10%) para evitar thundering herd
    const jitter = cappedDelay * 0.1 * (Math.random() * 2 - 1)
    return Math.max(INITIAL_DELAY, cappedDelay + jitter)
}

/**
 * Retorna datos vacíos si no hay configuración de CMS.
 * Inspecciona la query para retornar la estructura esperada.
 * @param query - GraphQL query que se intentó ejecutar
 * @returns Objeto vacío con estructura esperada o {}
 */
const getEmptyData = (query: string): object => {
    const q = query.toLowerCase()

    if (q.includes('pages')) return { pages: { nodes: [] } }
    if (q.includes('posts')) return { posts: { nodes: [] } }
    if (q.includes('postby')) return { postBy: null }

    return {}
}

/**
 * Valida que la respuesta sea JSON.
 * Lanza error si el Content-Type no incluye 'application/json'
 * @param response - Response object del fetch
 * @throws Error si no es JSON
 */
const validateContentType = async (response: Response): Promise<void> => {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
        const errorText = await response.text()
        console.error('WP API returned non-JSON content')
        console.error('Status:', response.status, response.statusText)
        console.error('Content-Type:', contentType)
        console.error('Headers:', {
            'content-type': contentType,
            'content-length': response.headers.get('content-length'),
        })
        console.error('Response body:', errorText || '(empty)')
        throw new Error('WP API returned non-JSON response')
    }
}

/**
 * Parsea y retorna el JSON de la respuesta.
 * Extrae data.data si existe, sino retorna el objeto completo.
 * @param response - Response object con JSON válido
 * @returns Datos parseados de la respuesta
 * @throws Error si el JSON es inválido
 */
const parseResponse = async (response: Response): Promise<any> => {
    const responseText = await response.text()
    try {
        const data = JSON.parse(responseText)
        return data.data || data
    } catch (e) {
        console.error('Invalid JSON response from WP API - server may be down')
        console.error('Response:', responseText)
        throw e
    }
}

/**
 * Ejecuta un request POST a la API de WordPress.
 * Valida el Content-Type, maneja errores HTTP y parsea la respuesta.
 * @param url - URL del endpoint GraphQL
 * @param query - Query string de GraphQL
 * @param variables - Variables para la query
 * @returns Datos parseados de la respuesta
 * @throws Error si falla la validación, HTTP error, o JSON parse
 */
const performRequest = async (
    url: string,
    query: string,
    variables: object,
): Promise<any> => {
    console.log('WP API request to:', url)
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Astro-Build/1.0',
        },
        body: JSON.stringify({ query, variables }),
    })

    console.log('WP API response status:', response.status, response.statusText)

    await validateContentType(response)

    if (!response.ok) {
        const status = response.status
        const errorText = await response.text()
        console.error(`WP API error ${status}: ${response.statusText}`)
        console.error('Headers:', Object.fromEntries(response.headers.entries()))
        console.error('Response body:', errorText || '(empty)')
        throw new Error(`WP API error: ${status} ${response.statusText}`)
    }

    return parseResponse(response)
}

/**
 * Ejecuta un request con reintentos exponenciales.
 * Reininta automáticamente en errores HTTP retryables (429, 503, 502)
 * y errores de red. Usa exponential backoff con jitter para evitar
 * congestión (thundering herd).
 * @param url - URL del endpoint GraphQL
 * @param query - Query string de GraphQL
 * @param variables - Variables para la query
 * @returns Datos parseados de la respuesta
 * @throws Error si falla después de MAX_RETRIES intentos
 */
const requestWithRetry = async (
    url: string,
    query: string,
    variables: object,
): Promise<any> => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await performRequest(url, query, variables)
        } catch (error) {
            lastError = error as Error
            const status = (error as any)?.message?.match(/\d{3}/)?.[0]
            const isRetryable = status && shouldRetry(parseInt(status))

            if (isRetryable && attempt < MAX_RETRIES - 1) {
                const delay = getBackoffDelay(attempt)
                console.warn(
                    `WP API ${status}, retrying in ${Math.round(delay)}ms ` +
                    `(attempt ${attempt + 1}/${MAX_RETRIES})`
                )
                await sleep(delay)
            } else if (attempt < MAX_RETRIES - 1) {
                const delay = getBackoffDelay(attempt)
                console.warn(
                    `Request failed (${lastError.message}), retrying in ` +
                    `${Math.round(delay)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
                )
                await sleep(delay)
            }
        }
    }

    throw lastError || new Error('WP API request failed after retries')
}

/**
 * Ejecuta una query GraphQL contra la API de WordPress.
 * Retorna datos vacíos si no hay CMS configurado.
 * Si hay CMS configurado, ejecuta el request con reintentos automáticos.
 * @param query - Query string de GraphQL
 * @param variables - Opcionales: variables para la query
 * @returns Datos de la respuesta o datos vacíos si no hay CMS
 * @throws Error si falla después de MAX_RETRIES intentos
 */
export async function wpQuery({ query, variables = {} }: GqlParams): Promise<any> {
    if (!rootUrl) {
        console.warn('WP config missing, returning empty data')
        console.log('WP_DOMAIN raw:', WP_DOMAIN)
        console.log('WP_API_CUSTOM raw:', WP_API_CUSTOM)
        console.log('domain parsed:', domain)
        console.log('rootUrl:', rootUrl)

        return getEmptyData(query)
    }

    return requestWithRetry(rootUrl, query, variables)
}

