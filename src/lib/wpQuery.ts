import { isURL, isValidPath, prependHTTPS } from '@wordpress/url';

const domain = ! isURL(import.meta.env.WP_DOMAIN) ? prependHTTPS(import.meta.env.WP_DOMAIN) : import.meta.env.WP_DOMAIN

const rootUrl = ! isValidPath(import.meta.env.WP_API_CUSTOM) ? `${domain}graphql/` : `${domain}${import.meta.env.WP_API_CUSTOM}`

export interface gqlParams {
    query: String
    variables?: object
}

export async function wpquery({ query, variables = {}}: gqlParams) {
    const options = {
        url: rootUrl,
        path: '',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            variables
        })
    }

    const { data }  = await fetch(`${options.url}${options.path}`, options).then((res: Response): Response => {
        if (! res.ok ) {
            console.error(res)
            throw new Error("Failed to fetch page info");
        }

        return res
    }).then((res: Response) => res.json())

    return data
}