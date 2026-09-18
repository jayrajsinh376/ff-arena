'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'matches'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMatches(data);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Match History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>Abhi tak koi match nahi khela</p>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.id} className="border p-4 rounded-lg">
              <p>Result: <strong>{match.result}</strong></p>
              <p>Prize: {match.prize} coins</p>
              <p>Date: {match.createdAt?.toDate().toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
