"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  AlertTriangle, 
  LogOut, 
  Search, 
  RefreshCw,
  Eye,
  Clock,
  UserX
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveSession {
  id: string;
  student: {
    id: string;
    matricNumber: string;
    name: string;
  };
  exam: {
    id: string;
    title: string;
    subject: string;
  };
  startTime: string;
  warnings: number;
  isLoggedOut: boolean;
  logoutReason?: string;
  timeRemaining: number;
}

export default function ProctorDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [infractionReason, setInfractionReason] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    fetchActiveSessions();
    // Refresh every 10 seconds
    const interval = setInterval(fetchActiveSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch("/api/proctor/active-sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutStudent = async () => {
    if (!selectedSession || !infractionReason.trim()) {
      alert("Please provide a reason for logging out the student");
      return;
    }

    setLogoutLoading(true);
    try {
      const response = await fetch("/api/proctor/logout-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          studentId: selectedSession.student.id,
          reason: infractionReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Student ${selectedSession.student.matricNumber} has been logged out successfully.`);
        setShowLogoutDialog(false);
        setInfractionReason("");
        setSelectedSession(null);
        fetchActiveSessions();
      } else {
        alert(data.message || "Failed to logout student");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred while logging out the student");
    } finally {
      setLogoutLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const search = searchTerm.toLowerCase();
    return (
      session.student.matricNumber.toLowerCase().includes(search) ||
      session.student.name.toLowerCase().includes(search) ||
      session.exam.title.toLowerCase().includes(search)
    );
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Proctor Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor active exam sessions and manage student infractions
        </p>
      </div>

      {/* Search and Refresh */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by matric number, name, or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={fetchActiveSessions} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Sessions</CardDescription>
            <CardTitle className="text-2xl">{sessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions with Warnings</CardDescription>
            <CardTitle className="text-2xl">
              {sessions.filter((s) => s.warnings > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Logged Out</CardDescription>
            <CardTitle className="text-2xl">
              {sessions.filter((s) => s.isLoggedOut).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-2xl">
              {new Set(sessions.map((s) => s.student.id)).size}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Exam Sessions
          </CardTitle>
          <CardDescription>
            Monitor students and take action on infractions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading active sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No active exam sessions found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {session.student.name}
                          </h3>
                          <Badge variant="outline">
                            {session.student.matricNumber}
                          </Badge>
                          {session.warnings > 0 && (
                            <Badge variant="destructive">
                              {session.warnings} Warning{session.warnings > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {session.isLoggedOut && (
                            <Badge variant="secondary">
                              <UserX className="mr-1 h-3 w-3" />
                              Logged Out
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Exam:</strong> {session.exam.title}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Started: {new Date(session.startTime).toLocaleTimeString()}
                          </span>
                          <span>
                            Time Remaining: {formatTime(session.timeRemaining)}
                          </span>
                        </div>
                        {session.logoutReason && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Logout Reason:</strong> {session.logoutReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!session.isLoggedOut && (
                          <Dialog
                            open={showLogoutDialog && selectedSession?.id === session.id}
                            onOpenChange={(open) => {
                              setShowLogoutDialog(open);
                              if (!open) {
                                setSelectedSession(null);
                                setInfractionReason("");
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setShowLogoutDialog(true);
                                }}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout Student
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Logout Student for Infraction</DialogTitle>
                                <DialogDescription>
                                  Logging out student: <strong>{session.student.name}</strong> (
                                  {session.student.matricNumber})
                                  <br />
                                  Exam: <strong>{session.exam.title}</strong>
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reason">
                                    Infraction Reason <span className="text-destructive">*</span>
                                  </Label>
                                  <Textarea
                                    id="reason"
                                    value={infractionReason}
                                    onChange={(e) => setInfractionReason(e.target.value)}
                                    placeholder="Describe the examination infraction (e.g., 'Using unauthorized materials', 'Talking during exam', 'Suspicious behavior', etc.)"
                                    rows={5}
                                    required
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    This reason will be recorded and sent to the student.
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowLogoutDialog(false);
                                    setInfractionReason("");
                                    setSelectedSession(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleLogoutStudent}
                                  disabled={!infractionReason.trim() || logoutLoading}
                                >
                                  {logoutLoading ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Logging Out...
                                    </>
                                  ) : (
                                    <>
                                      <LogOut className="mr-2 h-4 w-4" />
                                      Confirm Logout
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View session details
                            router.push(`/proctor/session/${session.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
