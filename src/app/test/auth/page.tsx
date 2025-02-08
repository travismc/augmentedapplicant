import { auth } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/utils/auth';

export default async function AuthTestPage() {
  const { userId } = auth();
  let userProfile = null;
  let error = null;

  try {
    if (userId) {
      userProfile = await getCurrentUser();
    }
  } catch (e) {
    error = e;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="space-y-4">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">User ID:</span>{' '}
              <span className="font-mono">{userId || 'Not authenticated'}</span>
            </p>
          </div>
        </section>

        {error ? (
          <section className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Error</h2>
            <pre className="bg-red-100 p-4 rounded text-red-900 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </section>
        ) : null}

        {userProfile ? (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </section>
        ) : null}

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Sign in/out using the Clerk component in the top navigation to test the auth flow.
            </p>
            <p className="text-sm text-gray-600">
              After signing in, this page will display your user profile from the database.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
