"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, RefreshCw, Save, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ username: string; email: string; role: string }>({
    username: "",
    email: "",
    role: "",
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching users...")
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()
      console.log("Users API response:", data)

      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users)
      } else {
        setError("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError(error instanceof Error ? error.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    })
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({ username: "", email: "", role: "" })
  }

  const saveEdit = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      // Refresh the users list
      await fetchUsers()
      setEditingUser(null)
      setEditForm({ username: "", email: "", role: "" })
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user")
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Refresh the users list
      await fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "storekeeper":
        return "bg-blue-100 text-blue-800"
      case "technician":
        return "bg-green-100 text-green-800"
      case "filler":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-600 text-lg mb-4">Error loading users</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={fetchUsers} className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={`user-${user.id}-${index}`}>
               
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    user.username || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full"
                      type="email"
                    />
                  ) : (
                    user.email || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="storekeeper">Storekeeper</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="filler">Filler</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role || "N/A"}</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {editingUser === user.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveEdit(user.id)}
                          className="text-green-600"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit} className="text-gray-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
