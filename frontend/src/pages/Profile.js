import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { UserCircle, Camera, Lock, MapPin, Phone, EnvelopeSimple, Pencil } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const { data } = await api.put('/profile/update', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile updated successfully');
      setAvatarFile(null);
      setAvatarPreview(null);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Are you sure you want to delete your avatar?')) return;

    try {
      await api.delete('/profile/avatar');
      toast.success('Avatar deleted successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete avatar');
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `${process.env.REACT_APP_BACKEND_URL}${user.avatar}`;
    }
    return 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=200';
  };

  return (
    <div className="p-8" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Profile Settings</h1>
        <p className="text-zinc-400 text-base">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30"
                  data-testid="avatar-image"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={32} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    data-testid="avatar-upload"
                  />
                </label>
              </div>
              
              <div className="mt-4 space-y-2 w-full">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.querySelector('input[type="file"]').click()}
                  >
                    <Camera size={18} className="mr-2" />
                    Change Photo
                  </Button>
                </label>
                
                {user?.avatar && !user.avatar.startsWith('http') && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteAvatar}
                  >
                    Delete Photo
                  </Button>
                )}
              </div>

              <p className="text-xs text-zinc-500 mt-4 text-center">
                JPG, PNG, GIF up to 5MB
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Role:</span>
                  <span className="text-white uppercase tracking-wider font-medium">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Member Since:</span>
                  <span className="text-white">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <UserCircle size={24} />
              Personal Information
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                    data-testid="name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeSimple size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                      placeholder="+1 (555) 000-0000"
                      data-testid="phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                      placeholder="City, Country"
                      data-testid="location-input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white resize-none"
                  placeholder="Tell us about yourself..."
                  data-testid="bio-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-br from-indigo-500 to-purple-600"
                data-testid="update-profile-button"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Lock size={24} />
              Change Password
            </h3>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="current-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                  data-testid="confirm-password"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                data-testid="update-password-button"
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
