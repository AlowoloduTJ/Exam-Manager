"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Upload, Building2, Eye, Target, Mail } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Institution Information
  const [institutionName, setInstitutionName] = useState("");
  const [institutionLogo, setInstitutionLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");

  // Admin Account
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email Configuration
  const [emails, setEmails] = useState({
    viceChancellorEmail: "",
    registrarEmail: "",
    bursarEmail: "",
    librarianEmail: "",
    facultyDeanEmail: "",
    headOfDeptEmail: "",
    facultyExamOfficerEmail: "",
    deptExamOfficerEmail: "",
    courseLecturerEmails: "",
    deputyVCEmail: "",
  });

  // Handle logo upload
  const onLogoDrop = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setInstitutionLogo(acceptedFiles[0]);
        const reader = new FileReader();
        reader.onload = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(acceptedFiles[0]);
      }
    },
  });

  const handleSubmit = async () => {
    if (adminPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Upload logo if provided
      let logoUrl = "";
      if (institutionLogo) {
        const formData = new FormData();
        formData.append("logo", institutionLogo);
        const uploadResponse = await fetch("/api/setup/upload-logo", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      // Submit setup data
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution: {
            name: institutionName,
            logo: logoUrl,
            mission,
            vision,
          },
          admin: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          },
          emails,
        }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        const error = await response.json();
        alert(`Setup failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Setup error:", error);
      alert("An error occurred during setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">System Setup</h1>
          <p className="mt-2 text-muted-foreground">
            Configure your examination management system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step >= s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-16 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Institution Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Institution Information
              </CardTitle>
              <CardDescription>
                Configure your institution&apos;s branding and core values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Institution Name */}
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institution Name</Label>
                <Input
                  id="institutionName"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Enter institution name"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Institution Logo</Label>
                <div
                  {...onLogoDrop.getRootProps()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary"
                >
                  <input {...onLogoDrop.getInputProps()} />
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="relative h-32 w-32">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to change logo
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop logo here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, SVG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mission */}
              <div className="space-y-2">
                <Label htmlFor="mission" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Mission
                </Label>
                <Textarea
                  id="mission"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Enter your institution's mission statement..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Vision */}
              <div className="space-y-2">
                <Label htmlFor="vision" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Vision
                </Label>
                <Textarea
                  id="vision"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Enter your institution's vision statement..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Next: Admin Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Admin Account */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Administrator Account</CardTitle>
              <CardDescription>
                Create the main administrator account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Enter administrator name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter secure password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Previous
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next: Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Email Configuration */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email addresses for result distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(emails).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <Input
                    id={key}
                    type="email"
                    value={value}
                    onChange={(e) =>
                      setEmails({ ...emails, [key]: e.target.value })
                    }
                    placeholder={`${key.replace(/([A-Z])/g, " $1")} email`}
                  />
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="courseLecturerEmails">
                  Course Lecturer Emails (comma-separated)
                </Label>
                <Textarea
                  id="courseLecturerEmails"
                  value={emails.courseLecturerEmails}
                  onChange={(e) =>
                    setEmails({ ...emails, courseLecturerEmails: e.target.value })
                  }
                  placeholder="lecturer1@university.edu, lecturer2@university.edu"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Previous
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
