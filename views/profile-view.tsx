"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { User, Mail, AtSign, Calendar, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export function ProfileView() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" })
  }

  function getInitials(name?: string | null, email?: string | null) {
    if (name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(session.user.name, session.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{session.user.name || "User"}</CardTitle>
                  <CardDescription>{session.user.email}</CardDescription>
                </div>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Label className="text-muted-foreground">Full Name</Label>
                <div className="col-span-2 font-medium">{session.user.name || "Not set"}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="col-span-2 font-medium">{session.user.email || "Not set"}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <AtSign className="h-4 w-4" />
                  Username
                </Label>
                <div className="col-span-2 font-medium">{session.user.username || "Not set"}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  User ID
                </Label>
                <div className="col-span-2 font-mono text-sm">{session.user.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
