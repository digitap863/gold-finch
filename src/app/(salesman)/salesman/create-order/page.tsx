"use client"
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, X, Upload, Plus, Square, Play, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface CatalogDetail {
  _id: string;
  title?: string;
  style?: string;
  size?: string;
  weight?: number;
  description?: string;
  images?: string[];
  files?: string[];
}

export default function CreateOrderPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customizationDetails, setCustomizationDetails] = useState<string>("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New fields
  const [karatage, setKaratage] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [colour, setColour] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [sizeType, setSizeType] = useState<string>("");
  const [sizeValue, setSizeValue] = useState<string>("");
  const [stone, setStone] = useState<boolean>(false);
  const [enamel, setEnamel] = useState<boolean>(false);
  const [matte, setMatte] = useState<boolean>(false);
  const [rodium, setRodium] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchParams = useSearchParams();
  const catalogId = searchParams.get("catalogId");

  useEffect(() => {
    if (!catalogId) return;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`/api/admin/catalogs/${catalogId}`);
        if (!res.ok) return;
        const data: CatalogDetail = await res.json();
        if (data?.title) {
          setProductName(data.title);
        }
      } catch {
        // silently ignore for now
      }
    };
    fetchCatalog();
  }, [catalogId]);

  // Timer effect for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl("");
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim() || !customerName.trim()) {
      toast.error("Product name and customer name are required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("customerName", customerName);
      formData.append("customizationDetails", customizationDetails);
      formData.append("expectedDeliveryDate", expectedDeliveryDate);
      
      // New fields
      formData.append("karatage", karatage);
      formData.append("weight", weight);
      formData.append("colour", colour);
      formData.append("name", name);
      formData.append("sizeType", sizeType);
      formData.append("sizeValue", sizeValue);
      formData.append("stone", stone.toString());
      formData.append("enamel", enamel.toString());
      formData.append("matte", matte.toString());
      formData.append("rodium", rodium.toString());
      
      if (catalogId) {
        formData.append("catalogId", catalogId);
      }

      // Add voice recording if exists
      if (audioBlob) {
        const fileExtension = audioBlob.type.includes('webm') ? '.webm' : 
                             audioBlob.type.includes('mp4') ? '.mp4' : 
                             audioBlob.type.includes('ogg') ? '.ogg' : '.wav';
        formData.append("voiceRecording", audioBlob, `recording${fileExtension}`);
      }

      // Add images
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/salesman/orders", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      await response.json();
      toast.success("Order created successfully!");
      
      // Reset form
      setProductName("");
      setCustomerName("");
      setCustomizationDetails("");
      setExpectedDeliveryDate("");
      setImages([]);
      setPreviews([]);
      setAudioBlob(null);
      setAudioUrl("");
      setRecordingTime(0);
      
      // Reset new fields
      setKaratage("");
      setWeight("");
      setColour("");
      setName("");
      setSizeType("");
      setSizeValue("");
      setStone(false);
      setEnamel(false);
      setMatte(false);
      setRodium(false);
      
      // Redirect to orders page or show success message
      window.location.href = "/salesman/track-orders";
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Order</h1>
        <p className="text-muted-foreground">Submit a new order request</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product Name</Label>
                <Input
                  id="product"
                  placeholder="e.g., Gold Ring"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input 
                  id="customer" 
                  placeholder="Customer name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Customization Details</Label>
              <Textarea 
                id="details" 
                placeholder="Describe any specific requirements, measurements, or customizations needed..."
                className="min-h-[100px]"
                value={customizationDetails}
                onChange={(e) => setCustomizationDetails(e.target.value)}
              />
            </div>
            
            {/* Voice Recording Section */}
            <div className="space-y-4">
              <Label>Voice Recording</Label>
              
              {!audioBlob ? (
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant={isRecording ? "destructive" : "outline"}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <Square size={18} />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic size={18} /> 
                        <span>Start Recording</span>
                      </>
                    )}
                  </Button>
                  
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm font-mono text-red-600">{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={playAudio}
                    className="flex items-center gap-2"
                  >
                    <Play size={16} />
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">Voice Message</div>
                    <div className="text-xs text-gray-500">{formatTime(recordingTime)}</div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deleteAudio}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
              
              {audioBlob && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden">
                      <Image src={src} alt="preview" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white transition-colors"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Expected Delivery Date</Label>
              <Input 
                type="date" 
                id="deadline" 
                className="w-full"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="karatage">Karatage</Label>
                <Input 
                  id="karatage" 
                  placeholder="e.g., 18K" 
                  value={karatage}
                  onChange={(e) => setKaratage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input 
                  id="weight" 
                  placeholder="e.g., 5.00g" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colour">Colour</Label>
                <Input 
                  id="colour" 
                  placeholder="e.g., Yellow" 
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Ring Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
                             <div className="space-y-2">
                 <Label>Size</Label>
                 <div className="flex gap-4">
                   <label className="flex items-center space-x-2">
                     <input
                       type="radio"
                       name="sizeType"
                       value="plastic"
                       checked={sizeType === "plastic"}
                       onChange={(e) => setSizeType(e.target.value)}
                     />
                     <span>Plastic</span>
                   </label>
                   <label className="flex items-center space-x-2">
                     <input
                       type="radio"
                       name="sizeType"
                       value="metal"
                       checked={sizeType === "metal"}
                       onChange={(e) => setSizeType(e.target.value)}
                     />
                     <span>Metal</span>
                   </label>
                 </div>
                 {sizeType && (
                   <Input 
                     placeholder="Enter size value" 
                     value={sizeValue}
                     onChange={(e) => setSizeValue(e.target.value)}
                   />
                 )}
               </div>
                             <div className="col-span-2 space-y-3">
                 <Label>Additional Features</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <label className="flex items-center space-x-2 cursor-pointer">
                     <input 
                       type="checkbox" 
                       id="stone" 
                       checked={stone}
                       onChange={(e) => setStone(e.target.checked)}
                       className="rounded"
                     />
                     <span className="text-sm">Stone</span>
                   </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                     <input 
                       type="checkbox" 
                       id="enamel" 
                       checked={enamel}
                       onChange={(e) => setEnamel(e.target.checked)}
                       className="rounded"
                     />
                     <span className="text-sm">Enamel</span>
                   </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                     <input 
                       type="checkbox" 
                       id="matte" 
                       checked={matte}
                       onChange={(e) => setMatte(e.target.checked)}
                       className="rounded"
                     />
                     <span className="text-sm">Matte</span>
                   </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                     <input 
                       type="checkbox" 
                       id="rodium" 
                       checked={rodium}
                       onChange={(e) => setRodium(e.target.checked)}
                       className="rounded"
                     />
                     <span className="text-sm">Rodium</span>
                   </label>
                 </div>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creating Order..." : "Submit Order"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 sm:flex-none">
                Save Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 