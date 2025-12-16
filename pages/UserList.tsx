import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const mockUsers: User[] = [
  { id: '1', name: 'Ali Yılmaz', username: '@aliyilmaz', avatar: 'https://picsum.photos/seed/ali/200', role: 'User', status: 'Active', badges: ['Premium', 'Reklamcı'], joinDate: '2023-01-01' },
  { id: '2', name: 'Zeynep Kaya', username: '@zeynepkaya', avatar: 'https://picsum.photos/seed/zey/200', role: 'Admin', status: 'Active', badges: ['Premium'], joinDate: '2023-02-15' },
  { id: '3', name: 'Mehmet Öztürk', username: '@mehmetozturk', avatar: 'https://picsum.photos/seed/meh/200', role: 'User', status: 'Active', badges: [], joinDate: '2023-03-10' },
  { id: '4', name: 'Ayşe Demir', username: '@aysedemir', avatar: 'https://picsum.photos/seed/ayse/200', role: 'User', status: 'Passive', badges: [], joinDate: '2023-04-20' },
  { id: '5', name: 'Caner B', username: '@canerb', avatar: 'https://picsum.photos/seed/caner/200', role: 'User', status: 'Active', badges: ['Reklamcı'], joinDate: '2023-05-05' },
];

const UserList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü');

  const filters = ['Tümü', 'Premium', 'Reklamcı', 'Aktif'];

  const filteredUsers = mockUsers.filter(user => {
    if (filter === 'Tümü') return true;
    if (filter === 'Premium') return user.badges.includes('Premium');
    if (filter === 'Reklamcı') return user.badges.includes('Reklamcı');
    if (filter === 'Aktif') return user.status === 'Active';
    return true;
  });

  return (
    <div className="p-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="İsim veya kullanıcı adına göre" 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-slate-300">
            <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
              filter === f 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            onClick={() => navigate(`/users/${user.id}`)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-slate-500 text-sm">{user.username}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                {user.badges.includes('Premium') && (
                    <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-md">Premium</span>
                )}
                {user.badges.includes('Reklamcı') && (
                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-md">Reklamcı</span>
                )}
                {user.status === 'Passive' && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded-md">Pasif</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;