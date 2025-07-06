export enum Page {
    NODES = `
    {
        pages {
            nodes {
                slug
                title
                content
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
                            link
                        }
                }
                tags {
                    edges {
                        node {
                            name
                        }
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
                        link
                    }
            }
            tags {
                edges {
                    node {
                        name
                    }
                }
            }
        }
    }
    `,
}