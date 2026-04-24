import { useParams } from 'react-router-dom';

export default function ViewerPage() {
  const { id } = useParams();
  return <div style={{ padding: 24 }}>ViewerPage: {id}</div>;
}
