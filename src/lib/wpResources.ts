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
			}
 		 }
	}`,
}