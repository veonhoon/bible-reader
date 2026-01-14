import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';
import { Search, Crown, Mail, Calendar, User } from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  displayName: string;
  provider: 'google' | 'apple' | 'email';
  isPremium: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.displayName.toLowerCase().includes(query)
      );
    }

    // Apply premium filter
    if (filterPremium === 'premium') {
      filtered = filtered.filter((user) => user.isPremium);
    } else if (filterPremium === 'free') {
      filtered = filtered.filter((user) => !user.isPremium);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filterPremium]);

  const fetchUsers = async () => {
    try {
      console.log('[Users] Fetching users from Firestore...');
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      console.log('[Users] Found', snapshot.size, 'users');
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate() || new Date(),
      })) as AppUser[];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      console.error('[Users] Error fetching users:', error?.message || error);
      console.error('[Users] Error code:', error?.code);
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (user: AppUser) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isPremium: !user.isPremium,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  const getProviderBadge = (provider: string) => {
    const styles: Record<string, string> = {
      google: 'bg-red-100 text-red-700',
      apple: 'bg-gray-100 text-gray-700',
      email: 'bg-blue-100 text-blue-700',
    };
    return styles[provider] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage app users and premium access</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterPremium}
            onChange={(e) => setFilterPremium(e.target.value as 'all' | 'premium' | 'free')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Premium Users</p>
            <p className="text-2xl font-bold text-yellow-600">
              {users.filter((u) => u.isPremium).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Free Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => !u.isPremium).length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || filterPremium !== 'all'
                ? 'No users match your filters'
                : 'No users registered yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">User</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Provider</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Joined</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Last Login</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.displayName || 'No name'}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getProviderBadge(user.provider)}`}>
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        {user.createdAt.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {user.lastLogin.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isPremium ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <Crown size={12} />
                          Premium
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => togglePremium(user)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            user.isPremium ? 'bg-yellow-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              user.isPremium ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
