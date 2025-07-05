const domain = import.meta.env.WP_DOMAIN
const apiUrl = `${domain}${import.meta.env.WP_API_V1}`
console.info(apiUrl)

export const getPages = async () => {
    const response = await fetch(`${apiUrl}/pages`)

    if (!response.ok) throw new Error("Failed to fetch page info");

    const data = await response.json()
console.log(data)
    return data
}

export const getPageInfo = async (slug: string) => {
    const response = await fetch(`${apiUrl}/pages?slug=${slug}`)

    if (!response.ok) throw new Error("Failed to fetch page info");

    const [ data ] = await response.json()

    const { title: {rendered: title}, content: {rendered: content} } = data

    return {title, content}
}