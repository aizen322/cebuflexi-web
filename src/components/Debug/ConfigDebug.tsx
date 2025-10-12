import { useEffect, useState } from "react";

export function ConfigDebug() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setConfig(firebaseConfig);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div className="space-y-1">
        <div>
          <strong>API Key:</strong> {config?.apiKey ? "✅ Set" : "❌ Missing"}
        </div>
        <div>
          <strong>Project ID:</strong> {config?.projectId || "❌ Missing"}
        </div>
        <div>
          <strong>Auth Domain:</strong> {config?.authDomain || "❌ Missing"}
        </div>
        <div>
          <strong>Storage Bucket:</strong> {config?.storageBucket || "❌ Missing"}
        </div>
        <div>
          <strong>Messaging Sender ID:</strong> {config?.messagingSenderId || "❌ Missing"}
        </div>
        <div>
          <strong>App ID:</strong> {config?.appId || "❌ Missing"}
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <strong>Full Config:</strong>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
