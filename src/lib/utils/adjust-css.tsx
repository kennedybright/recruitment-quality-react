// Use this utility JS component to dynamically adjust any unreachable CSS styling for MAF components 

import { useEffect } from "react"

interface AdjustCSSParams {
    isBody: boolean // is element rendered inside the main <body>
    rootClass?: string // if element is rendered outside the body, specify the root container 
    tag: string // HTML tag (ex. 'div', 'span', 'a', etc.)
    attribute: string // HTML attribute (ex. 'data-selector', 'class', 'aria-label', etc.)
    searchValue: string // HTML attribute's value (ex. class='menu-list' // value = 'menu-list')
    style: Record<string, string> // an Object of HTML styles (ex. {height: "350px", backgroundColor: "white"}) 
    // MAKE SURE ALL OBJECT KEYS IN {style} ARE IN CAMELCASE! (ex. overflow-x => overflowX)
}

const AdjustCSS = ({isBody, rootClass, tag, attribute, searchValue, style}:AdjustCSSParams) => {
    useEffect(() => {
        // Dynamically construct the HTML selector
        if (isBody) {
            const observer = new MutationObserver(() => {
                const selector = `${tag}[${attribute}="${searchValue}"]`
                const elements = document.querySelectorAll<HTMLElement>(selector)
    
                if (elements.length === 0) return
                elements.forEach((element) => { Object.assign(element.style, style) })
            })

            // Observe the document body
            observer.observe(document.body, {childList: true, subtree: true})
            return () => observer.disconnect() // Cleanup when component unmounts
            
        } else {
            if (!rootClass) return 
            if (rootClass.includes('portal')) {
                const portalRoot = document.getElementsByClassName(rootClass)[0] as HTMLElement | undefined
                console.log("Portal root element: ", portalRoot)
                if (!portalRoot) return

                const observer = new MutationObserver(() => {
                    const selector = `${tag}[${attribute}="${searchValue}"]`
                    const element = portalRoot.querySelector(selector) as HTMLElement | null

                    if (element) { Object.assign(element.style, style) }
                })

                // Observe the portal container
                observer.observe(portalRoot, {childList: true, subtree: true})
                return () => observer.disconnect() // Cleanup when component unmounts
            }
        }
    }, [tag, attribute, searchValue, style])
    
    return null
}

export default AdjustCSS