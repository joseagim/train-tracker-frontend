import { useEffect } from 'react'

const SITE_NAME = 'TrainTracker'

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    return () => {
      document.title = previous
    }
  }, [title])
}
