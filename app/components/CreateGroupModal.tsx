"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Check, Search, Camera, Plus, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    _id: Id<"users">;
    name: string;
    avatarUrl?: string;
  };
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  currentUser,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const allUsers = useQuery(api.users.list);
  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl); 
  const startGroup = useMutation(api.conversations.createGroup);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredMembers = allUsers?.filter(
    (u) => 
      u._id !== currentUser._id && 
      u.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleToggleUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName || selectedUsers.length < 1) return;
    setIsUploading(true);

    try {
      let storageId = undefined;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const { storageId: sId } = await result.json();
        storageId = sId;
      }

      await startGroup({
        name: groupName,
        participantIds: [...selectedUsers, currentUser._id],
        adminId: currentUser._id,
        groupImage: storageId, 
      });
      setGroupName("");
      setSelectedUsers([]);
      setMemberSearch("");
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white border-4 border-black w-full max-w-md rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b-4 border-black bg-[#ffcf00] flex justify-between items-center">
          <h2 className="font-black text-xl uppercase italic tracking-tight">Create New Group</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-200">
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center justify-center py-2">
            <div 
              onClick={() => imageInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border-4 border-black bg-zinc-100 cursor-pointer group overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                  <Camera className="w-8 h-8" />
                  <span className="text-[8px] font-black uppercase">Add Icon</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Plus className="text-white w-6 h-6" />
              </div>
            </div>
            <input 
              type="file" 
              ref={imageInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-black uppercase px-1">Group Identity</p>
            <input
              placeholder="ENTER GROUP NAME..."
              className="w-full p-3 border-4 border-black rounded-xl font-black outline-none focus:bg-zinc-50 transition-colors placeholder:text-zinc-400"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-black uppercase px-1">Add Members</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 border-2 border-black rounded-lg font-bold text-sm outline-none focus:bg-zinc-50"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-40 overflow-y-auto border-4 border-black rounded-xl p-1 space-y-1 bg-zinc-50">
             {filteredMembers?.map((user) => {
                const isSelected = selectedUsers.includes(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => handleToggleUser(user._id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? "border-black bg-[#ffcf00] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                        : "border-transparent hover:bg-white hover:border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl || "/default-avatar.png"} className="w-8 h-8 rounded-full border-2 border-black object-cover" alt="" />
                      <span className="font-black text-sm">{user.name}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 stroke-[3px]" />}
                  </button>
                );
             })}
          </div>

          <button
            disabled={!groupName || selectedUsers.length < 1 || isUploading}
            onClick={handleCreate}
            className="w-full bg-black text-[#ffcf00] p-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              `Launch Group (${selectedUsers.length + 1} People)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}