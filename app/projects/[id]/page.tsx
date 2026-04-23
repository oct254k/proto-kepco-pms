import { mockProjects } from '@/lib/mock-data/projects';
import ProjectDetailClient from '@/components/screens/projects/ProjectDetailClient';

export function generateStaticParams() {
  return mockProjects.map((p) => ({ id: p.id }));
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient id={params.id} />;
}
