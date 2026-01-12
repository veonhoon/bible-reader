import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BookOpen, Users, FileText, Star } from 'lucide-react';
import Layout from '../components/Layout';

interface Stats {
  totalScriptures: number;
  totalDevotionals: number;
  totalUsers: number;
  premiumUsers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalScriptures: 0,
    totalDevotionals: 0,
    totalUsers: 0,
    premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch scriptures count
        const scripturesSnap = await getDocs(collection(db, 'scriptures'));
        const totalScriptures = scripturesSnap.size;

        // Fetch devotionals count
        const devotionalsSnap = await getDocs(collection(db, 'devotionals'));
        const totalDevotionals = devotionalsSnap.size;

        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.size;
        const premiumUsers = usersSnap.docs.filter(
          (doc) => doc.data().isPremium === true
        ).length;

        setStats({
          totalScriptures,
          totalDevotionals,
          totalUsers,
          premiumUsers,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Scriptures',
      value: stats.totalScriptures,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      label: 'Devotionals',
      value: stats.totalDevotionals,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Premium Users',
      value: stats.premiumUsers,
      icon: Star,
      color: 'bg-gold',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Bible Teacher admin panel</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/scriptures"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Add New Scripture</p>
                    <p className="text-sm text-gray-600">Create a new scripture entry</p>
                  </div>
                </div>
              </a>
              <a
                href="/users"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-600">View and manage user accounts</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-3 text-gray-600">
              <p>1. Add scriptures in the Scriptures section</p>
              <p>2. Set a featured scripture for the home page</p>
              <p>3. Create devotional messages linked to scriptures</p>
              <p>4. Manage user premium status in Users section</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
