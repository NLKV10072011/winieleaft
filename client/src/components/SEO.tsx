import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Winie Leaf`
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
  }, [title, description])

  return null
}
