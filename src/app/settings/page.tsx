
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle, Check, QrCode, Copy, Link as LinkIcon, Download, Camera, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';
import { Expandable, ExpandableContent } from '@/components/ui/expandable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverForm, PopoverInput, PopoverFooter, PopoverCloseButton, PopoverSubmitButton, PopoverHeader, PopoverBody } from "@/components/ui/popover-animated";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import QRCode from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';


const getInitials = (name: string | null): string => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [openConfirmation, setOpenConfirmation] = useState<string | null>(null);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  useEffect(() => {
    const id = localStorage.getItem('weedo-user-id');
    if (id) {
      setUserId(id);
      const userDocRef = doc(db, 'users', id);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setInitials(getInitials(data.name));
        }
        setIsLoading(false);
      }).catch(error => {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      // If no user ID, they should be on the name prompt page
      router.push('/');
    }
  }, [router]);
  
  useEffect(() => {
    if (!isScannerOpen) {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        scannerRef.current = null;
      }
      return;
    }

    const onScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        handleImportFromUrl(decodedText);
    };

    const html5Qrcode = new Html5Qrcode(scannerContainerId);
    scannerRef.current = html5Qrcode;

    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            html5Qrcode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                onScanSuccess,
                () => { /* ignore */ }
            ).catch(() => {
                toast({ variant: "destructive", title: "Camera Error" });
                setIsScannerOpen(false);
            });
        }
    }).catch(() => {
        toast({ variant: "destructive", title: "Camera Not Found" });
        setIsScannerOpen(false);
    });

    return () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
        }
    };
  }, [isScannerOpen, toast]);

  const handleNameSave = async (newName: string) => {
    if (newName.trim() && userId) {
      const trimmedName = newName.trim();
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { name: trimmedName });
        setName(trimmedName);
        setInitials(getInitials(trimmedName));
        toast({ title: "Name Updated" });
      } catch (error) {
         toast({ variant: "destructive", title: "Error Saving Name" });
      }
    }
  };

  const handleUncompleteAll = async () => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const tasks: Task[] = userDoc.data().tasks || [];
        const uncompletedTasks = tasks.map(task => ({ ...task, completed: false }));
        await updateDoc(userDocRef, { tasks: uncompletedTasks });
        toast({ title: "Tasks Updated" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error Updating Tasks" });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-user-id');
      toast({ title: "Logged Out" });
      router.push('/');
    } catch (error) {
      toast({ variant: "destructive", title: "Could not log out." });
    }
  };
  
  const generateSyncUrl = () => {
    if (!userId) return null;
    const url = `${window.location.origin}/sync/${userId}`;
    setSyncUrl(url);
    return url;
  };

  const handleGenerateLinkClick = () => {
    const url = generateSyncUrl();
    if (url) setIsLinkDialogOpen(true);
  };

  const handleGenerateQRCodeClick = () => {
    const url = generateSyncUrl();
    if (url) setIsQRCodeDialogOpen(true);
  };

  const handleImportFromUrl = (urlToImport: string) => {
    if (!urlToImport.trim()) return;
    try {
      const url = new URL(urlToImport);
      const pathParts = url.pathname.split('/');
      const syncIndex = pathParts.indexOf('sync');
      
      if (syncIndex !== -1 && pathParts[syncIndex + 1]) {
        const id = pathParts[syncIndex + 1];
        setIsImportDialogOpen(false);
        setImportUrl('');
        setIsScannerOpen(false);
        router.push(`/sync/${id}`);
        return;
      }
      throw new Error("Invalid URL format.");
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid Link" });
    }
  };

  const handleManualImport = () => {
    handleImportFromUrl(importUrl);
  };

  const handleCopyLink = () => {
    if (!syncUrl) return;
    navigator.clipboard.writeText(syncUrl).then(() => {
      toast({ title: "Copied!", description: "Sync link copied." });
    });
  };
  
  const confirmationVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 self-start">
            <Link href="/" passHref>
              <Button variant="ghost" className="hover:bg-transparent" asChild>
                <motion.div className="flex items-center cursor-pointer" initial="rest" whileHover="hover" whileTap={{scale: 0.98}}>
                  <motion.div variants={{ hover: { x: -4 }, rest: { x: 0 } }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </motion.div>
                  <span>Back to Tasks</span>
                </motion.div>
              </Button>
            </Link>
        </div>

        <div className="w-full">
            <div className="flex flex-col items-center text-center p-6 pt-0">
               {isLoading ? (
                <>
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </>
              ) : (
                <>
                  <Avatar className="h-24 w-24 mb-4 text-3xl">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center w-full">
                     <PopoverRoot initialValue={name ?? ""}>
                        <PopoverTrigger asChild>
                           <h2 className="text-2xl font-semibold leading-none tracking-tight cursor-pointer hover:text-primary transition-colors">{name}</h2>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 h-auto">
                          <PopoverForm onSubmit={handleNameSave}>
                            <div className="flex flex-col h-full bg-card text-card-foreground">
                                <PopoverHeader>Edit your name</PopoverHeader>
                                <PopoverBody><PopoverInput placeholder="Enter your new name" /></PopoverBody>
                                <PopoverFooter className="bg-transparent border-0 justify-end gap-2 p-3">
                                  <PopoverCloseButton asChild><Button variant="ghost" type="button">Cancel</Button></PopoverCloseButton>
                                  <PopoverSubmitButton><Check className="h-4 w-4 mr-2" /> Save</PopoverSubmitButton>
                                </PopoverFooter>
                              </div>
                          </PopoverForm>
                        </PopoverContent>
                      </PopoverRoot>
                    <p className="text-sm text-muted-foreground mt-1.5">Manage your app settings.</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 pt-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Account</h3>
                <div className="flex flex-col gap-1">
                    <div>
                        <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => setOpenConfirmation(p => p === 'uncomplete' ? null : 'uncomplete')}>
                            <RefreshCw className="mr-3 h-5 w-5" />
                            <div><p>Mark All Incomplete</p><p className="text-xs text-muted-foreground font-normal">Reset all tasks to incomplete.</p></div>
                        </Button>
                        <Expandable expanded={openConfirmation === 'uncomplete'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/><div><p className="font-semibold">Are you sure?</p><p className="text-sm text-muted-foreground mt-1">This will mark all tasks as incomplete.</p></div></div>
                                  <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="ghost" onClick={() => setOpenConfirmation(null)}>Cancel</Button>
                                      <Button onClick={() => { handleUncompleteAll(); setOpenConfirmation(null); }}>Continue</Button>
                                  </div>
                              </motion.div>
                           </ExpandableContent>
                        </Expandable>
                    </div>
                 
                    <div>
                        <Button variant="ghost" className="w-full justify-start text-left text-base text-destructive p-3 h-auto hover:bg-transparent" onClick={() => setOpenConfirmation(p => p === 'logout' ? null : 'logout')}>
                            <LogOut className="mr-3 h-5 w-5" />
                            <div><p>Logout</p><p className="text-xs text-muted-foreground font-normal">This will clear your local data.</p></div>
                       </Button>
                        <Expandable expanded={openConfirmation === 'logout'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/><div><p className="font-semibold">Are you sure?</p><p className="text-sm text-muted-foreground mt-1">This will log you out on this device.</p></div></div>
                                  <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="ghost" onClick={() => setOpenConfirmation(null)}>Cancel</Button>
                                      <Button variant="destructive" onClick={() => { handleLogout(); setOpenConfirmation(null); }}>Logout</Button>
                                  </div>
                              </motion.div>
                           </ExpandableContent>
                        </Expandable>
                    </div>
                </div>
            </div>

            <Separator className="my-2"/>

            <div className="p-6 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Task Management</h3>
                <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => router.push('/initialize')}>
                        <ListTodo className="mr-3 h-5 w-5" />
                        <div><p>Daily Tasks</p><p className="text-xs text-muted-foreground font-normal">Set up tasks that repeat every day.</p></div>
                    </Button>
                </div>
            </div>

            <Separator className="my-2"/>

            <div className="p-6 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Data Sync</h3>
                <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateLinkClick}>
                        <LinkIcon className="mr-3 h-5 w-5" />
                        <div><p>Sync via Link</p><p className="text-xs text-muted-foreground font-normal">Generate a link to sync another device.</p></div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateQRCodeClick}>
                        <QrCode className="mr-3 h-5 w-5" />
                        <div><p>Sync via QR Code</p><p className="text-xs text-muted-foreground font-normal">Generate a QR code to sync another device.</p></div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => setIsImportDialogOpen(true)}>
                        <Download className="mr-3 h-5 w-5" />
                        <div><p>Import from Link</p><p className="text-xs text-muted-foreground font-normal">Sync this device from a link.</p></div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => setIsScannerOpen(true)}>
                        <Camera className="mr-3 h-5 w-5" />
                        <div><p>Import via QR Scan</p><p className="text-xs text-muted-foreground font-normal">Sync this device by scanning a QR code.</p></div>
                    </Button>
                </div>
            </div>

        </div>
      </div>
      
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Sync via Link</DialogTitle><DialogDescription>Copy and open this link on another device to sync it.</DialogDescription></DialogHeader>
              <div className="flex items-center space-x-2 pt-4">
                  <Input value={syncUrl} readOnly />
                  <Button type="button" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4" /><span className="sr-only">Copy Link</span></Button>
              </div>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Sync via QR Code</DialogTitle><DialogDescription>Scan this QR code on another device to sync it.</DialogDescription></DialogHeader>
              <div className="flex justify-center py-4 bg-white p-4 rounded-md">
                {syncUrl && <QRCode value={syncUrl} size={256} bgColor="#FFFFFF" fgColor="#000000" />}
              </div>
          </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Import from Link</DialogTitle><DialogDescription>Paste a sync link below to connect to another list.</DialogDescription></DialogHeader>
              <div className="flex items-center space-x-2 pt-4">
                  <Input placeholder="https://..." value={importUrl} onChange={(e) => setImportUrl(e.target.value)} />
                  <Button type="button" onClick={handleManualImport}>Import</Button>
              </div>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Scan QR Code</DialogTitle><DialogDescription>Point your camera at a Weedo QR code to sync.</DialogDescription></DialogHeader>
            <div className="mt-4 p-4 border rounded-lg bg-muted aspect-square flex items-center justify-center"><div id={scannerContainerId} className="w-full h-full"></div></div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
