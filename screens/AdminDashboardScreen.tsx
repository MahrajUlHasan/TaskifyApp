import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { User } from '../types';

interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
}

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAdminStats(),
      ]);
      setUsers(usersResponse.content);
      setStats(statsResponse);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(userId);
              setUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleToggleUserRole = (userId: string, currentRole: string, username: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    Alert.alert(
      'Change User Role',
      `Change "${username}" role from ${currentRole} to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            try {
              const updatedUser = await adminService.updateUserRole(userId, newRole as 'USER' | 'ADMIN');
              setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
              Alert.alert('Success', 'User role updated successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update user role');
            }
          },
        },
      ]
    );
  };

  const renderStatCard = (title: string, value: number, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.roleTag, { backgroundColor: item.role === 'ADMIN' ? '#FF6B6B' : '#4ECDC4' }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          <Text style={styles.userDate}>
            Joined: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleToggleUserRole(item.id, item.role, item.username)}
        >
          <Text style={styles.roleButtonText}>
            {item.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item.id, item.username)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (user?.role !== 'ADMIN') {
    return (
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtext}>Admin privileges required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
        }
      >
        {/* Statistics */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>System Statistics</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Users', stats.totalUsers, '#007AFF')}
              {renderStatCard('Active Users', stats.activeUsers, '#4ECDC4')}
              {renderStatCard('Total Tasks', stats.totalTasks, '#FDCB6E')}
              {renderStatCard('Completed Tasks', stats.completedTasks, '#00B894')}
            </View>
          </View>
        )}

        {/* Users Section */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No users found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  usersSection: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  userItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userUsername: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDate: {
    fontSize: 10,
    color: '#999',
  },
  userActions: {
    alignItems: 'flex-end',
  },
  roleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  roleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default AdminDashboardScreen;
