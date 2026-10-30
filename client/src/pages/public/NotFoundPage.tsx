import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-page section text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <p className="text-neutral-mid mb-6">Page not found.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
