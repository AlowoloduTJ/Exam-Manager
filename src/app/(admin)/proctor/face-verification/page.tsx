"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UserCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Camera,
} from "lucide-react";
import Image from "next/image";

interface FaceVerificationIssue {
  id: string;
  matricNumber: string;
  studentName: string;
  attemptedAt: string;
  failureReason: string;
  passportPhoto: string;
  capturedPhoto?: string;
  attempts: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export default function FaceVerificationPage() {
  const [issues, setIssues] = useState<FaceVerificationIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<FaceVerificationIssue | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchFaceVerificationIssues();
    // Refresh every 15 seconds
    const interval = setInterval(fetchFaceVerificationIssues, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchFaceVerificationIssues = async () => {
    try {
      const response = await fetch("/api/proctor/face-verification-issues");
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error("Failed to fetch face verification issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedIssue) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/proctor/approve-face-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          notes: approvalNotes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Student ${selectedIssue.matricNumber} has been approved and logged in successfully.`);
        setShowApproveDialog(false);
        setApprovalNotes("");
        setSelectedIssue(null);
        fetchFaceVerificationIssues();
      } else {
        alert(data.message || "Failed to approve student");
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("An error occurred while approving the student");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedIssue || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/proctor/reject-face-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          reason: rejectionReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Face verification request for ${selectedIssue.matricNumber} has been rejected.`);
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedIssue(null);
        fetchFaceVerificationIssues();
      } else {
        alert(data.message || "Failed to reject verification");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("An error occurred while rejecting the verification");
    } finally {
      setProcessing(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const search = searchTerm.toLowerCase();
    return (
      issue.matricNumber.toLowerCase().includes(search) ||
      issue.studentName.toLowerCase().includes(search) ||
      issue.failureReason.toLowerCase().includes(search)
    );
  });

  const pendingIssues = filteredIssues.filter((issue) => issue.status === "PENDING");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Face Verification Issues</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve students who failed face recognition verification
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-2xl">{pendingIssues.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Issues</CardDescription>
            <CardTitle className="text-2xl">{issues.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">
              {issues.filter((i) => i.status === "APPROVED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-2xl">
              {issues.filter((i) => i.status === "REJECTED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by matric number, name, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={fetchFaceVerificationIssues} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Pending Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Pending Face Verification Issues
          </CardTitle>
          <CardDescription>
            Students who failed face recognition and need proctor approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading face verification issues...
            </div>
          ) : pendingIssues.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No pending face verification issues
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIssues.map((issue) => (
                <Card key={issue.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex gap-6">
                      {/* Photos Comparison */}
                      <div className="flex gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Passport Photo
                          </Label>
                          <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
                            <Image
                              src={issue.passportPhoto}
                              alt="Passport"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        {issue.capturedPhoto && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Captured Photo
                            </Label>
                            <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
                              <Image
                                src={issue.capturedPhoto}
                                alt="Captured"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{issue.studentName}</h3>
                          <Badge variant="outline">{issue.matricNumber}</Badge>
                          <Badge variant="secondary">
                            {issue.attempts} Attempt{issue.attempts > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Failed At:</strong>{" "}
                          {new Date(issue.attemptedAt).toLocaleString()}
                        </p>
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Reason:</strong> {issue.failureReason}
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowApproveDialog(true);
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Login
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowRejectDialog(true);
                          }}
                          className="w-full"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Face Verification</DialogTitle>
            <DialogDescription>
              Approving student: <strong>{selectedIssue?.studentName}</strong> (
              {selectedIssue?.matricNumber})
              <br />
              This will log the student in and allow them to proceed with their examination.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about why you're approving this student..."
                rows={3}
              />
            </div>
            <Alert>
              <UserCheck className="h-4 w-4" />
              <AlertDescription>
                By approving, you confirm that you have manually verified the student&apos;s
                identity and authorize their login.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setApprovalNotes("");
                setSelectedIssue(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Login Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Face Verification</DialogTitle>
            <DialogDescription>
              Rejecting face verification for: <strong>{selectedIssue?.studentName}</strong> (
              {selectedIssue?.matricNumber})
              <br />
              The student will need to try again or contact support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the face verification is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedIssue(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Verification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
