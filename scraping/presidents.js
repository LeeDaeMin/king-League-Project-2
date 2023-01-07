import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const STATICS_PATH = path.join(process.cwd(), './assets/static/presidents')
const DB_PATH = path.join(process.cwd(), './db/')
const RAW_PRESIDENTS = await readFile(`${DB_PATH}/raw-presidents.json`, 'utf-8').then(JSON.parse)



const presidents = await Promise.all(
    RAW_PRESIDENTS.map(async presidentInfo => {

        const { slug: id, title, _links: links} = presidentInfo
        const { rendered: name } = title

        const { 'wp:attachment': attachment } = links
        const { href: imageEndPoint } = attachment[0]

        console.log(`> Fetching attachment for president': ${name}`)

    

    
        const responseEndPoint = await fetch(imageEndPoint)
        const data = await responseEndPoint.json()
        const [imageInfo] = data
        const { guid: { rendered: imageUrl } } = imageInfo
    
        const filedExtension = imageUrl.split('.').at(-1)
        
        console.log(`> Fetching image for president: ${name}`)
    
        const responseImage = await fetch(imageUrl)
        const arrayBuffer = await responseImage.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        console.log(`> write image for president: ${name}`)
    
        const imageFileName = `${id}.${filedExtension}`
        await writeFile(`${STATICS_PATH}/${id}.${imageFileName}`, buffer)

        
        console.log(`> everything is done!: ${name}`)
    
        return { id, name, image: imageFileName }
    })
)

console.log('> all presidents are ready')
await writeFile(`${DB_PATH}/presidents.json`, JSON.stringify(presidents, null, 2))