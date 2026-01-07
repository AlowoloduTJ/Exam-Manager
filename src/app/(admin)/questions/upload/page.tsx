"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Trash2,
} from "lucide-react";
// Simple file upload without react-dropzone

type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "BEST_ANSWER"
  | "FILL_BLANK"
  | "MATCHING"
  | "HOTSPOT"
  | "ORDERING"
  | "SIMULATION"
  | "ESSAY"
  | "CODING";

interface QuestionPreview {
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswers?: (string | number)[];
  imageUrl?: string;
  marks: number;
  subjectId?: string;
}

export default function QuestionUploadPage() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<"file" | "manual">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewQuestions, setPreviewQuestions] = useState<QuestionPreview[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  // Manual question form state
  const [questionType, setQuestionType] = useState<QuestionType>("SINGLE_CHOICE");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<(string | number)[]>([]);
  const [marks, setMarks] = useState(1);
  const [questionImage, setQuestionImage] = useState<File | null>(null);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["xls", "xlsx", "doc", "docx", "pdf", "png", "jpeg", "jpg", "txt"].includes(
        ext || ""
      );
    });

    if (validFiles.length !== files.length) {
      setError("Some files were rejected. Only .xls, .xlsx, .doc, .docx, .pdf, .png, .jpeg, .jpg, .txt files are allowed.");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError("");
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    if (!selectedSubject) {
      setError("Please select a subject");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("subjectId", selectedSubject);

      const response = await fetch("/api/questions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `Successfully uploaded ${data.questionsCreated || 0} questions from ${selectedFiles.length} file(s)`
        );
        setSelectedFiles([]);
        setPreviewQuestions(data.preview || []);
        setUploadProgress(100);
      } else {
        setError(data.message || "Failed to upload questions");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while uploading questions");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    setCorrectAnswers((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleManualSubmit = async () => {
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (!selectedSubject) {
      setError("Please select a subject");
      return;
    }

    if (questionType !== "ESSAY" && questionType !== "CODING" && options.filter((o) => o.trim()).length < 2) {
      setError("At least 2 options are required");
      return;
    }

    if (correctAnswers.length === 0 && questionType !== "ESSAY" && questionType !== "CODING") {
      setError("Please select at least one correct answer");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("questionText", questionText);
      formData.append("type", questionType);
      formData.append("options", JSON.stringify(options.filter((o) => o.trim())));
      formData.append("correctAnswers", JSON.stringify(correctAnswers));
      formData.append("marks", marks.toString());
      formData.append("subjectId", selectedSubject);
      if (questionImage) {
        formData.append("image", questionImage);
      }

      const response = await fetch("/api/questions/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Question created successfully");
        // Reset form
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswers([]);
        setMarks(1);
        setQuestionImage(null);
      } else {
        setError(data.message || "Failed to create question");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while creating question");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["xls", "xlsx"].includes(ext || "")) {
      return <FileSpreadsheet className="h-5 w-5" />;
    }
    if (["png", "jpeg", "jpg"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Questions</h1>
        <p className="text-muted-foreground mt-2">
          Upload questions from files or create them manually
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "file" | "manual")}>
        <TabsList className="mb-6">
          <TabsTrigger value="file">Upload from File</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Questions from Files</CardTitle>
              <CardDescription>
                Supported formats: .xls, .xlsx, .doc, .docx, .pdf, .png, .jpeg, .jpg, .txt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Files</Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".xls,.xlsx,.doc,.docx,.pdf,.png,.jpeg,.jpg,.txt"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: .xls, .xlsx, .doc, .docx, .pdf, .png, .jpeg, .jpg, .txt
                </p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.name)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleFileUpload}
                disabled={selectedFiles.length === 0 || !selectedSubject || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Create Question Manually</CardTitle>
              <CardDescription>Enter question details manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject-manual">Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type *</Label>
                <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE_CHOICE">Single-Answer MCQ</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple-Answer MCQ</SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="BEST_ANSWER">Best-Answer</SelectItem>
                    <SelectItem value="FILL_BLANK">Fill-in-the-Blank / Short Answer</SelectItem>
                    <SelectItem value="MATCHING">Matching Questions</SelectItem>
                    <SelectItem value="HOTSPOT">Hotspot / Image-Based</SelectItem>
                    <SelectItem value="ORDERING">Ordering / Sequencing</SelectItem>
                    <SelectItem value="SIMULATION">Simulation / Scenario-Based</SelectItem>
                    <SelectItem value="ESSAY">Essay / Long-Form</SelectItem>
                    <SelectItem value="CODING">Coding Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question..."
                  rows={4}
                />
              </div>

              {/* Question Image */}
              <div className="space-y-2">
                <Label htmlFor="questionImage">Question Image (Optional)</Label>
                <Input
                  id="questionImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
                />
                {questionImage && (
                  <p className="text-sm text-muted-foreground">{questionImage.name}</p>
                )}
              </div>

              {/* Options (for MCQ types) */}
              {questionType !== "ESSAY" && questionType !== "CODING" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Options *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      Add Option
                    </Button>
                  </div>
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant={correctAnswers.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCorrectAnswer(index)}
                      >
                        {correctAnswers.includes(index) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    Click the checkmark to mark an option as correct
                  </p>
                </div>
              )}

              {/* Marks */}
              <div className="space-y-2">
                <Label htmlFor="marks">Marks *</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleManualSubmit}
                disabled={uploading || !questionText.trim() || !selectedSubject}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Question
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Questions */}
      {previewQuestions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview Questions</CardTitle>
            <CardDescription>
              {previewQuestions.length} questions parsed from uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewQuestions.map((q, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{q.type}</Badge>
                    <span className="text-sm text-muted-foreground">{q.marks} marks</span>
                  </div>
                  <p className="font-medium mb-2">{q.questionText}</p>
                  {q.options && q.options.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {q.options.map((opt, optIndex) => (
                        <li key={optIndex} className={q.correctAnswers?.includes(optIndex) ? "text-green-600 font-medium" : ""}>
                          {opt}
                          {q.correctAnswers?.includes(optIndex) && " ✓"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
