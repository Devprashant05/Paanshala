"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Plus, Power } from "lucide-react";

import api from "@/lib/axios";
import { useShopByVideoStore } from "@/stores/useShopByVideoStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ===========================
   SHOP BY VIDEO PAGE
=========================== */

export default function AdminShopByVideoPage() {
  const { videos, fetchVideos, createVideo, toggleVideo } =
    useShopByVideoStore();

  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    video: null,
    products: [],
  });

  /* ===========================
     INIT
  =========================== */

  useEffect(() => {
    fetchVideos();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products?isActive=true");
      setProducts(res.data.products || []);
    } catch {
      // silent fail
    }
  };

  /* ===========================
     CREATE VIDEO
  =========================== */

  const handleCreateVideo = async (e) => {
    e.preventDefault();

    if (!form.video || !form.products.length) return;

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("video", form.video);
    form.products.forEach((p) => fd.append("products[]", p));

    const ok = await createVideo(fd);
    if (ok) {
      setForm({ title: "", description: "", video: null, products: [] });
      setOpen(false);
      fetchVideos();
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div className="space-y-8 max-w-7xl">
      {/* HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold text-[#12351a] flex items-center gap-2">
          <Video className="w-7 h-7" />
          Shop By Video
        </h1>
        <p className="text-gray-600 mt-2">
          Upload product videos and link them to products
        </p>
      </motion.div>

      {/* CREATE VIDEO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#12351a] hover:bg-[#0f2916]">
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Shop By Video</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateVideo} className="space-y-4">
            <Input
              placeholder="Video Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <Input
              placeholder="Short description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setForm({ ...form, video: e.target.files[0] })}
            />

            <div>
              <Label>Select Products</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                {products.map((p) => (
                  <label
                    key={p._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      value={p._id}
                      checked={form.products.includes(p._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm({
                          ...form,
                          products: checked
                            ? [...form.products, p._id]
                            : form.products.filter((id) => id !== p._id),
                        });
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full">Upload Video</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIDEO LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Videos</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {videos.map((v) => (
            <div
              key={v._id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">{v.title}</p>
                <p className="text-xs text-gray-500">
                  Linked products: {v.products.length}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {v.isActive ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}

                <Button
                  variant="ghost"
                  onClick={() =>
                    toggleVideo(v._id, !v.isActive).then(fetchVideos)
                  }
                >
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
