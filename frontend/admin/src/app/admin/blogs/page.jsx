"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Edit,
  Image as ImageIcon,
  Calendar,
  User,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  BookOpen,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import { useBlogStore } from "@/stores/useBlogStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AdminBlogsPage() {
  const {
    blogs,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    loading,
  } = useBlogStore();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [blogToEdit, setBlogToEdit] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Paanshala Team",
    coverImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchBlogs();
  }, []);

  /* ===========================
     FILTER BLOGS
  =========================== */
  useEffect(() => {
    let filtered = blogs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter === "published") {
      filtered = filtered.filter((b) => b.isPublished);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((b) => !b.isPublished);
    } else if (statusFilter === "featured") {
      filtered = filtered.filter((b) => b.isFeatured);
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, statusFilter, blogs]);

  /* ===========================
     STATS CALCULATION
  =========================== */
  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.isPublished).length,
    draft: blogs.filter((b) => !b.isPublished).length,
    featured: blogs.filter((b) => b.isFeatured).length,
  };

  /* ===========================
     CREATE BLOG
  =========================== */
  const handleCreateBlog = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    fd.append("author", form.author);
    if (form.coverImage) {
      fd.append("coverImage", form.coverImage);
    }

    setSubmitLoading(true);
    const ok = await createBlog(fd);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchBlogs();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT BLOG
  =========================== */
  const openEditDialog = (blog) => {
    setBlogToEdit(blog);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      author: blog.author,
      coverImage: null,
    });
    setImagePreview(blog.coverImage);
    setShowEditDialog(true);
  };

  const handleEditBlog = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    fd.append("author", form.author);
    if (form.coverImage) {
      fd.append("coverImage", form.coverImage);
    }

    setSubmitLoading(true);
    const ok = await updateBlog(blogToEdit._id, fd);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setBlogToEdit(null);
      await fetchBlogs();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE BLOG
  =========================== */
  const openDeleteDialog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteDialog(true);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    setSubmitLoading(true);
    const ok = await deleteBlog(blogToDelete._id);
    if (ok) {
      setShowDeleteDialog(false);
      setBlogToDelete(null);
      await fetchBlogs();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     TOGGLE STATUS
  =========================== */
  const handleTogglePublish = async (blog) => {
    const ok = await toggleBlogStatus(blog._id, {
      isPublished: !blog.isPublished,
      isFeatured: blog.isFeatured,
    });
    if (ok) await fetchBlogs();
  };

  const handleToggleFeatured = async (blog) => {
    const ok = await toggleBlogStatus(blog._id, {
      isPublished: blog.isPublished,
      isFeatured: !blog.isFeatured,
    });
    if (ok) await fetchBlogs();
  };

  /* ===========================
     IMAGE HANDLING
  =========================== */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, coverImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ===========================
     RESET FORM
  =========================== */
  const resetForm = () => {
    setForm({
      title: "",
      excerpt: "",
      content: "",
      author: "Paanshala Team",
      coverImage: null,
    });
    setImagePreview(null);
  };

  /* ===========================
     CLEAR FILTERS
  =========================== */
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";

  /* ===========================
     FORMAT DATE
  =========================== */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 max-w-450">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
              Blog Management
            </h1>
            <p className="text-base text-gray-600">
              Create and manage blog posts with markdown support
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Blog Post
          </Button>
        </div>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Blogs"
          value={stats.total}
          icon={FileText}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={Eye}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Drafts"
          value={stats.draft}
          icon={EyeOff}
          color="amber"
          delay={0.2}
        />
        <StatCard
          title="Featured"
          value={stats.featured}
          icon={Star}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search blogs by title or excerpt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-50 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blogs</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="draft">Drafts Only</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Search: {searchQuery}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* BLOGS LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#12351a]" />
              All Blog Posts ({filteredBlogs.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Get started by creating your first blog post"}
                </p>
                {!hasActiveFilters && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#12351a] hover:bg-[#0f2916]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Blog
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredBlogs.map((blog, index) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BlogCard
                        blog={blog}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onTogglePublish={handleTogglePublish}
                        onToggleFeatured={handleToggleFeatured}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CREATE BLOG DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">
                Create New Blog Post
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Write your blog content using Markdown formatting
            </p>
          </DialogHeader>

          <BlogForm
            form={form}
            setForm={setForm}
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            onSubmit={handleCreateBlog}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT BLOG DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Blog Post</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Update your blog content with Markdown support
            </p>
          </DialogHeader>

          <BlogForm
            form={form}
            setForm={setForm}
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            onSubmit={handleEditBlog}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowEditDialog(false);
              setBlogToEdit(null);
              resetForm();
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                Delete Blog Post?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{blogToDelete?.title}"
                </span>
                ?
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The
                  blog post and its cover image will be permanently deleted.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setBlogToDelete(null);
              }}
              disabled={submitLoading}
              className="h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
              disabled={submitLoading}
              className="bg-red-600 hover:bg-red-700 h-11"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Blog
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ===========================
   BLOG CARD COMPONENT
=========================== */
function BlogCard({
  blog,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  formatDate,
}) {
  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group">
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {blog.isPublished && (
              <Badge className="bg-emerald-500 text-white border-0">
                <Eye className="w-3 h-3 mr-1" />
                Published
              </Badge>
            )}
            {blog.isFeatured && (
              <Badge className="bg-amber-500 text-white border-0">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardContent className="pt-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {blog.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {blog.author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(blog.createdAt)}
          </div>
        </div>

        {/* Status Badges */}
        {!blog.coverImage && (
          <div className="flex gap-2 mb-4">
            {blog.isPublished ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <Eye className="w-3 h-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="secondary">
                <EyeOff className="w-3 h-3 mr-1" />
                Draft
              </Badge>
            )}
            {blog.isFeatured && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(blog)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTogglePublish(blog)}
            className="flex-1"
          >
            {blog.isPublished ? (
              <>
                <EyeOff className="w-3 h-3 mr-1.5" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1.5" />
                Publish
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFeatured(blog)}
            className={cn(
              "flex-1",
              blog.isFeatured && "bg-amber-50 border-amber-300",
            )}
          >
            <Star
              className={cn(
                "w-3 h-3 mr-1.5",
                blog.isFeatured && "fill-amber-400 text-amber-400",
              )}
            />
            {blog.isFeatured ? "Unfeature" : "Feature"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(blog)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   BLOG FORM COMPONENT
=========================== */
function BlogForm({
  form,
  setForm,
  imagePreview,
  handleImageChange,
  onSubmit,
  submitLoading,
  onCancel,
  isEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Blog Title *
        </Label>
        <Input
          id="title"
          placeholder="Enter an engaging blog title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="h-11"
          required
        />
      </div>

      {/* Author */}
      <div className="space-y-2">
        <Label htmlFor="author" className="text-sm font-medium">
          Author
        </Label>
        <Input
          id="author"
          placeholder="Author name"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="h-11"
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-sm font-medium">
          Short Excerpt
        </Label>
        <Textarea
          id="excerpt"
          placeholder="Write a brief summary (recommended 150-300 characters)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="min-h-20"
          maxLength={300}
        />
        <p className="text-xs text-gray-500">
          {form.excerpt.length}/300 characters
        </p>
      </div>

      {/* Content - Markdown */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          Blog Content (Markdown) *
        </Label>
        <Textarea
          id="content"
          rows={12}
          placeholder="Write your blog content using Markdown...

**Bold text** or __Bold text__
*Italic text* or _Italic text_
[Link](https://example.com)
![Image](image-url.jpg)

# Heading 1
## Heading 2
### Heading 3

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500">
          Use Markdown syntax for formatting. Preview available on frontend.
        </p>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor="coverImage" className="text-sm font-medium">
          Cover Image
        </Label>
        <Input
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="h-11"
        />
        {imagePreview && (
          <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                <Check className="w-3 h-3 mr-1" />
                Image Selected
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitLoading}
          className="h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitLoading}
          className="bg-[#12351a] hover:bg-[#0f2916] h-11"
        >
          {submitLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              {isEdit ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Blog
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Blog
                </>
              )}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ===========================
   STAT CARD COMPONENT
=========================== */
function StatCard({ title, value, icon: Icon, color, delay }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "border shadow-md hover:shadow-lg transition-all",
          colors.border,
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", colors.iconBg)}>
              <Icon className={cn("w-6 h-6", colors.icon)} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-4xl font-bold text-gray-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
