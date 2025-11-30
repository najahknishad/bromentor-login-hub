import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, FileText, Image, Video, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BrandHeader } from '@/components/BrandHeader';
import { toast } from 'sonner';

const SubmitDoubt = () => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [triedSolution, setTriedSolution] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Doubt title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Doubt description is required';
    }
    
    if (!triedSolution.trim()) {
      newErrors.triedSolution = 'Please describe what you have tried to resolve this';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 20MB`);
          continue;
        }
        validFiles.push(file);
      }
      setAttachments(prev => [...prev, ...validFiles]);
    }
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!user?.id) {
      toast.error('You must be logged in to submit a doubt');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the doubt with description including what they tried
      const fullDescription = `${description}\n\n**What I have tried:**\n${triedSolution}`;
      
      const { data: doubt, error: doubtError } = await supabase
        .from('doubts')
        .insert({
          title: title.trim(),
          description: fullDescription,
          student_id: user.id,
          topic_id: topicId || null,
          status: 'submitted',
          sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        })
        .select()
        .single();

      if (doubtError) throw doubtError;

      // Upload attachments if any
      if (attachments.length > 0 && doubt) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${doubt.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('doubt-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('doubt-attachments')
            .getPublicUrl(fileName);

          // Save attachment record
          await supabase.from('attachments').insert({
            doubt_id: doubt.id,
            file_name: file.name,
            file_type: file.type,
            file_url: publicUrl,
            uploaded_by: user.id
          });
        }
      }

      toast.success('Doubt submitted successfully!');
      navigate('/my-doubts');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit doubt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-6">
          <BrandHeader />
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Doubt</CardTitle>
            <CardDescription>Fill in the details below to submit your doubt for resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doubt Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Doubt Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a brief title for your doubt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className={errors.title ? 'border-destructive' : ''}
                />
                <div className="flex justify-between text-xs">
                  <span className={errors.title ? 'text-destructive' : 'text-muted-foreground'}>
                    {errors.title || 'Maximum 100 characters'}
                  </span>
                  <span className="text-muted-foreground">{title.length}/100</span>
                </div>
              </div>

              {/* Doubt Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Doubt Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your doubt in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <span className="text-xs text-destructive">{errors.description}</span>
                )}
              </div>

              {/* Course/Module/Topic Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="placeholder" disabled>
                        Will be available once linked with learn.brototype.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select value={moduleId} onValueChange={setModuleId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="placeholder" disabled>
                        Will be available once linked with learn.brototype.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={topicId} onValueChange={setTopicId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="placeholder" disabled>
                        Will be available once linked with learn.brototype.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Course, Module, and Topic selection will be available once linked with learn.brototype.com
              </p>

              {/* What have you tried */}
              <div className="space-y-2">
                <Label htmlFor="triedSolution">
                  What have you tried to resolve this? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="triedSolution"
                  placeholder="Describe the steps you've already taken to solve this problem..."
                  value={triedSolution}
                  onChange={(e) => setTriedSolution(e.target.value)}
                  rows={4}
                  className={errors.triedSolution ? 'border-destructive' : ''}
                />
                {errors.triedSolution && (
                  <span className="text-xs text-destructive">{errors.triedSolution}</span>
                )}
              </div>

              {/* Attachment Upload */}
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="attachments" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Images, Videos, PDFs, Documents (Max 20MB each)
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
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
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Doubt'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitDoubt;
