'use client'

import { useRouter } from 'next/navigation'

const templates = [
  {
    title: ' Blog Post',
    content: '## Blog Title\n\nYour awesome blog content here...',
  },
  {
    title: ' Meeting Notes',
    content: '**Meeting Title:** \nDate: \nAttendees:\n\n- Notes:\n  - ',
  },
  {
    title: 'Resume',
    content:
      '# Your Name\n\n**Experience**\n- Company 1\n- Company 2\n\n**Skills**\n- Skill A\n- Skill B',
  },
]

export default function TemplatesPage() {
  const router = useRouter()

  const handleCreateFromTemplate = async (templateContent: string) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      body: JSON.stringify({ content: templateContent }),
    })

    const data = await res.json()
    router.push(`/documents/${data.id}`)
  }

  return (
    <div className="min-h-screen px-8 py-10 bg-white">
      <h1 className="mb-6 text-3xl font-bold">Templates</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {templates.map((template, idx) => (
          <div
            key={idx}
            className="p-4 border border-gray-300 rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => handleCreateFromTemplate(template.content)}
          >
            <h3 className="text-lg font-semibold">{template.title}</h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-3 whitespace-pre-wrap">{template.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
