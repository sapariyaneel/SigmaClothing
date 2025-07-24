import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  TablePagination,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useSelectFix, useFocusManagement } from '../../hooks/useFocusManagement';
import { useResponsive, useResponsiveTable, useResponsiveForm } from '../../hooks/useResponsive';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Edit role dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Responsive hooks
  const {
    isMobile,
    isTablet,
    isDesktop,
    getContainerPadding,
    getResponsiveSpacing,
    getDialogMaxWidth,
    getButtonSize
  } = useResponsive();
  const { shouldUseCards, getTableCellPadding } = useResponsiveTable();
  const { getFormSpacing, getFieldSize } = useResponsiveForm();

  // Apply select focus fix for dropdown components
  useSelectFix();

  // Apply focus management for the edit dialog
  const dialogRef = useFocusManagement(editDialog);

  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(forceRefresh && { _t: Date.now() }) // Cache busting parameter
      });

      const response = await axios.get(`/admin/users?${params}`, {
        // Disable caching for this request if force refresh
        ...(forceRefresh && { noCache: true })
      });

      setUsers(response.data.data.users);
      setTotalUsers(response.data.data.pagination.totalUsers);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleRoleFilter = (event) => {
    setRoleFilter(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditDialog(true);
  };

  const handleUpdateRole = async () => {
    try {
      const response = await axios.put(`/admin/users/${selectedUser._id}/role`, {
        role: newRole
      });

      if (response.data.success) {
        // Optimistically update the local state immediately
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === selectedUser._id
              ? { ...user, role: newRole }
              : user
          )
        );

        // Close dialog
        setEditDialog(false);
        setSelectedUser(null);
        setNewRole('');

        // Clear any existing errors
        setError('');

        // Also refresh the list in the background to ensure consistency
        fetchUsers(true);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.response?.data?.message || 'Error updating user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        // Force refresh the users list
        await fetchUsers(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render user card for mobile view
  const renderUserCard = (user) => (
    <Card
      key={user._id}
      sx={{
        mb: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.1rem' }}>
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: 'break-word' }}>
              {user.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <IconButton
              onClick={() => handleEditRole(user)}
              color="primary"
              size="small"
              sx={{ p: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteUser(user._id, user.fullName)}
              color="error"
              size="small"
              sx={{ p: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Role:</Typography>
            <Chip
              label={user.role.toUpperCase()}
              color={getRoleColor(user.role)}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip
              label={user.isVerified ? 'Verified' : 'Unverified'}
              color={user.isVerified ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Joined: {formatDate(user.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: getResponsiveSpacing(),
        px: getContainerPadding()
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: getResponsiveSpacing(),
          border: 1,
          borderColor: 'divider',
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        {/* Header Section */}
        <Box sx={{
          mb: getResponsiveSpacing(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-start' }
          }}>
            <IconButton
              onClick={() => navigate('/admin')}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                p: { xs: 1, sm: 1.5 }
              }}
            >
              <BackIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                fontSize: {
                  xs: '1.25rem',
                  sm: '1.5rem',
                  md: '2rem'
                }
              }}
            >
              Manage Users
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: getResponsiveSpacing(),
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Search and Filter Controls */}
        <Box sx={{
          mb: getResponsiveSpacing(),
          display: 'flex',
          gap: { xs: 2, sm: 2, md: 3 },
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <TextField
            placeholder={isMobile ? "Search users..." : "Search users by name or email..."}
            value={searchTerm}
            onChange={handleSearch}
            size={getFieldSize()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize={isMobile ? 'small' : 'medium'} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: { xs: '100%', sm: '200px', md: '300px' }
            }}
          />
          <FormControl
            sx={{
              minWidth: { xs: '100%', sm: '120px', md: '150px' },
              maxWidth: { xs: '100%', sm: '200px' }
            }}
            size={getFieldSize()}
          >
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter-select"
              value={roleFilter}
              label="Role"
              onChange={handleRoleFilter}
              MenuProps={{
                disableRestoreFocus: false,
                disableEnforceFocus: false,
                disableAutoFocus: true,
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Users Display - Responsive Table/Cards */}
        {shouldUseCards ? (
          // Mobile Card View
          <Box sx={{ mb: getResponsiveSpacing() }}>
            {users.length > 0 ? (
              users.map(renderUserCard)
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" color="text.secondary">
                  No users found
                </Typography>
              </Card>
            )}
          </Box>
        ) : (
          // Desktop/Tablet Table View
          <TableContainer
            sx={{
              mb: getResponsiveSpacing(),
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              overflowX: 'auto'
            }}
          >
            <Table sx={{ minWidth: isTablet ? 800 : 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Verified</TableCell>
                  {isDesktop && (
                    <>
                      <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: getTableCellPadding() }}>Last Login</TableCell>
                    </>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 600, py: getTableCellPadding() }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user._id}
                    sx={{
                      '&:hover': { backgroundColor: 'grey.50' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ py: getTableCellPadding() }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: getTableCellPadding() }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: getTableCellPadding() }}>
                      <Chip
                        label={user.role.toUpperCase()}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: getTableCellPadding() }}>
                      <Chip
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        color={user.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    {isDesktop && (
                      <>
                        <TableCell sx={{ py: getTableCellPadding() }}>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: getTableCellPadding() }}>
                          <Typography variant="body2">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </Typography>
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center" sx={{ py: getTableCellPadding() }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleEditRole(user)}
                          color="primary"
                          size="small"
                          sx={{ p: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteUser(user._id, user.fullName)}
                          color="error"
                          size="small"
                          sx={{ p: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: getResponsiveSpacing(),
          borderTop: 1,
          borderColor: 'divider',
          pt: getResponsiveSpacing()
        }}>
          <TablePagination
            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
            labelDisplayedRows={({ from, to, count }) =>
              isMobile
                ? `${from}-${to} of ${count}`
                : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            sx={{
              '& .MuiTablePagination-toolbar': {
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
                minHeight: { xs: 'auto', sm: 52 },
                px: { xs: 1, sm: 2 }
              },
              '& .MuiTablePagination-selectLabel': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: { xs: 0, sm: 0 }
              },
              '& .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: { xs: 0, sm: 0 }
              },
              '& .MuiTablePagination-select': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiTablePagination-actions': {
                ml: { xs: 0, sm: 2 }
              },
              '& .MuiIconButton-root': {
                p: { xs: 1, sm: 1.5 }
              }
            }}
          />
        </Box>

        {/* Edit Role Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          ref={dialogRef}
          maxWidth={getDialogMaxWidth()}
          fullWidth
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: { xs: 0, sm: 2 },
              m: { xs: 0, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              maxHeight: { xs: '100%', sm: '90vh' }
            }
          }}
        >
          <DialogTitle sx={{
            pb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600
          }}>
            Edit User Role
          </DialogTitle>
          <DialogContent sx={{
            pt: `${getFormSpacing().xs * 8}px !important`,
            pb: getFormSpacing().xs,
            px: { xs: 2, sm: 3 }
          }}>
            <Typography
              variant="body2"
              sx={{
                mb: getFormSpacing(),
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: 'text.secondary'
              }}
            >
              Change role for: <strong>{selectedUser?.fullName}</strong>
            </Typography>
            <FormControl
              fullWidth
              size={getFieldSize()}
              sx={{ mt: 1 }}
            >
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                id="edit-role-select"
                value={newRole}
                label="Role"
                onChange={(e) => setNewRole(e.target.value)}
                MenuProps={{
                  disableRestoreFocus: false,
                  disableEnforceFocus: false,
                  disableAutoFocus: true,
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{
            p: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column-reverse', sm: 'row' }
          }}>
            <Button
              onClick={() => setEditDialog(false)}
              size={getButtonSize()}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 1 }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              variant="contained"
              size={getButtonSize()}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 }
              }}
            >
              Update Role
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ManageUsers;
