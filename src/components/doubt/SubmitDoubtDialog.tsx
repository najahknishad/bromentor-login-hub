import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Upload, Mic, X } from "lucide-react";
import { z } from "zod";

const doubtSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(30, "Description must be at least 30 characters"),
  topicId: z.string().uuid("Please select a topic"),
});

interface Course {
  id: string;
  name: string;
}

interface Module {
  id: string;
  name: string;
  course_id: string;
}

interface Topic {
  id: string;
  name: string;
  module_id: string;
}

const SubmitDoubtDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules(selectedCourse);
      setSelectedModule("");
      setSelectedTopic("");
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadTopics(selectedModule);
      setSelectedTopic("");
    }
  }, [selectedModule]);

  const loadCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (!error && data) setCourses(data);
  };

  const loadModules = async (courseId: string) => {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index");
    if (!error && data) setModules(data);
  };

  const loadTopics = async (moduleId: string) => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index");
    if (!error && data) setTopics(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validation = doubtSchema.safeParse({
      title,
      description,
      topicId: selectedTopic,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a doubt",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Calculate SLA deadline (48 hours from now)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 48);

    const { data: doubt, error } = await supabase
      .from("doubts")
      .insert({
        student_id: user.id,
        topic_id: selectedTopic,
        title,
        description,
        status: "submitted",
        sla_deadline: slaDeadline.toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit doubt",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create notification for support staff
    const { data: supportUsers } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "support");

    if (supportUsers) {
      for (const support of supportUsers) {
        await supabase.from("notifications").insert({
          user_id: support.user_id,
          title: "New Doubt Submitted",
          message: `${title}`,
          type: "doubt_assignment",
          doubt_id: doubt.id,
        });
      }
    }

    toast({
      title: "Doubt Submitted",
      description: "Your doubt has been submitted successfully",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedCourse("");
    setSelectedModule("");
    setSelectedTopic("");
    setFiles([]);
    setOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <MessageSquare className="mr-2 h-5 w-5" />
          Submit New Doubt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Your Doubt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select 
              value={selectedModule} 
              onValueChange={setSelectedModule}
              disabled={!selectedCourse}
            >
              <SelectTrigger id="module">
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select 
              value={selectedTopic} 
              onValueChange={setSelectedTopic}
              disabled={!selectedModule}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Doubt Title</Label>
            <Input
              id="title"
              placeholder="Brief description of your doubt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Explain your doubt in detail. Include what you've tried and where you're stuck..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Images, Videos, Documents)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload files
                </p>
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm text-foreground">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title || !description || !selectedTopic}
            className="w-full h-12 text-lg"
          >
            {isLoading ? "Submitting..." : "Submit Doubt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitDoubtDialog;
