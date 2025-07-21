import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

export const dynamicParams = true

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

type Props = {
  params: { id: string }
}

export default function DocumentPage({ params }: Props) {
  if (!params.id) return notFound()

  return (
    <div className="h-screen">
      <Editor documentId={params.id} />
    </div>
  )
}
