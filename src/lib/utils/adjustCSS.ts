// Use this utility JS component to dynamically adjust any unreachable CSS styling for MAF components 

import { useEffect } from "react"

interface AdjustCSSParams {
    isBody?: boolean // is element rendered inside the main <body>
    rootClass?: string // if element is rendered outside the body, specify the root container 
    tag: string // HTML tag (ex. 'div', 'span', 'a', etc.)
    attribute: string // HTML attribute (ex. 'data-selector', 'class', 'aria-label', etc.)
    searchValue: string // HTML attribute's value (ex. class='menu-list' // value = 'menu-list')
    targetSelector?: string // CSS selector to find the final target element relative to the base element (e.g., '> :first-child')
    style: Record<string, string> // an Object of HTML styles (ex. {height: "350px", backgroundColor: "white"})
}

const AdjustCSS = ({ 
    isBody = true, // default to true 
    rootClass, 
    tag, 
    attribute, 
    searchValue, 
    targetSelector,
    style 
}: AdjustCSSParams) => {
    useEffect(() => {
        const rootNode = isBody ? document.body : (rootClass ? document.querySelector(`.${rootClass}`) : null)

        if (!rootNode) {
            console.warn(`AdjustCSS: The root element "${rootClass || 'body'}" was not found.`)
            return
        }

        // Dynamically construct the HTML selector
        const observer = new MutationObserver(() => {
            const selector = `${tag}[${attribute}="${searchValue}"]`
            const elements = rootNode.querySelectorAll<HTMLElement>(selector)

            if (elements.length === 0) return

            elements.forEach(element => {
                const finalTarget = targetSelector
                    ? element.querySelector<HTMLElement>(targetSelector) // Find descendant if selector is provided
                    : element // Otherwise, the base element is the target

                if (finalTarget) Object.assign(finalTarget.style, style)
            })
        })

        // Observe the document body
        observer.observe(rootNode, {childList: true, subtree: true})
        return () => observer.disconnect() // Cleanup when component unmounts
    }, [tag, attribute, searchValue, style])
    
    return null
}

export default AdjustCSS