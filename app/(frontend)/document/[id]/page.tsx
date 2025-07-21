import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import 
type Props = {
  params: {
    id: string;
  };
};

// Dynamically import the Editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
});

export default async function DocumentPage({ params }: Props) {
  const document = await getDocumentById(params.id); // Fetch the doc from DB
  if (!document) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
      <Editor documentId={params.id} />
    </div>
  );
}
