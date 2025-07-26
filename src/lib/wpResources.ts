export enum Page {
    NODES = `
    {
        pages {
            nodes {
                slug
                title
                content
                seo {
                    metaDesc
                    title
                    schema {
                        pageType
                    }
                    opengraphImage {
                        srcSet
                        sourceUrl
                    }
                }
            }
        }
    }`, 
}

export enum Post {
    NODES = `
 	{
		posts {
			nodes {
				slug
				excerpt
				title
                dateGmt
                modifiedGmt
                featuredImage {
                    node {
                            altText
                            uri
                            srcSet
                            sourceUrl
                        }
                }
                tags {
                    edges {
                        node {
                            name
                        }
                    }
                }
                seo {
                    metaDesc
                    title
                    schema {
                        pageType
                    }
                    opengraphImage {
                        srcSet
                        sourceUrl
                    }
                }
			}
 		 }
	}`,
    ALL_SLUG = `
    {
        posts {
            nodes {
                slug
            }
        }
    }
    `,
    BY_SLUG = `query GetPostBySlug($slug: String!) {
        postBy(slug: $slug) {
            slug
            excerpt
            content
            title
            dateGmt
            modifiedGmt
            featuredImage {
                node {
                        altText
                        uri
                        srcSet
                        sourceUrl
                    }
            }
            tags {
                edges {
                    node {
                        name
                    }
                }
            }
            seo {
                metaDesc
                title
                schema {
                    pageType
                }
                opengraphImage {
                    srcSet
                    sourceUrl
                }
            }
        }
    }
    `,
}