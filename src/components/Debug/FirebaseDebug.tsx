import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc } from "firebase/firestore";

export function FirebaseDebug() {
  const [config, setConfig] = useState<any>(null);
  const [authState, setAuthState] = useState<any>(null);
  const [firestoreTest, setFirestoreTest] = useState<string>("Testing...");

  useEffect(() => {
    // Check Firebase config
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setConfig(firebaseConfig);

    // Check auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user);
    });

    // Test Firestore connection by checking if db is initialized
    const testFirestore = async () => {
      try {
        // Simple test - just check if we can access the db object
        if (db) {
          setFirestoreTest("✅ Firestore initialized");
        } else {
          setFirestoreTest("❌ Firestore not initialized");
        }
      } catch (error) {
        setFirestoreTest(`❌ Firestore error: ${error}`);
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Firebase Debug Info</h3>
      
      <div className="space-y-2">
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
          <strong>Auth State:</strong> {authState ? `✅ User: ${authState.email}` : "❌ No user"}
        </div>
        <div>
          <strong>Firestore:</strong> {firestoreTest}
        </div>
      </div>
    </div>
  );
}
