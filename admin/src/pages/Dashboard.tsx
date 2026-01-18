import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BookOpen, Users, Calendar, Star, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import MobilePreview from '../components/MobilePreview';

interface Stats {
  weeklyContent: number;
  totalUsers: number;
  premiumUsers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    weeklyContent: 0,
    totalUsers: 0,
    premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch weekly content count
        const weeklyContentSnap = await getDocs(collection(db, 'weeklyContent'));
        const weeklyContent = weeklyContentSnap.size;

        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.size;
        const premiumUsers = usersSnap.docs.filter(
          (doc) => doc.data().isPremium === true
        ).length;

        setStats({
          weeklyContent,
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
      label: 'Weekly Content',
      value: stats.weeklyContent,
      icon: Calendar,
      color: 'bg-blue-500',
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/process"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Process New Document</p>
                    <p className="text-sm text-gray-600">Upload and analyze with AI</p>
                  </div>
                </div>
              </a>
              <a
                href="/content"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">View Published Content</p>
                    <p className="text-sm text-gray-600">Manage weekly content</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-3 text-gray-600">
              <p>1. Upload a Bible study document (PDF or DOCX)</p>
              <p>2. AI analyzes and extracts key content</p>
              <p>3. Review and edit the generated content</p>
              <p>4. Publish to the mobile app</p>
              <p>5. Premium users receive push notifications</p>
            </div>
          </div>

          <MobilePreview />
        </div>
      </div>
    </Layout>
  );
}
