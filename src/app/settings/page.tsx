
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle, Check, QrCode, Copy, Link as LinkIcon, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';
import { Expandable, ExpandableContent } from '@/components/ui/expandable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverForm,
  PopoverInput,
  PopoverFooter,
  PopoverCloseButton,
  PopoverSubmitButton,
  PopoverHeader,
  PopoverBody,
} from "@/components/ui/popover-animated";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode.react';


const getInitials = (name: string | null): string => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

type SyncData = {
  name: string;
  tasks: Task[];
};

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [name, setName] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [openConfirmation, setOpenConfirmation] = useState<string | null>(null);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [dataToImport, setDataToImport] = useState<SyncData | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      if (storedName) {
        setName(storedName);
        setInitials(getInitials(storedName));
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncDataRaw = searchParams.get('syncData');
    if (syncDataRaw) {
      try {
        const decodedString = atob(syncDataRaw);
        const parsedData: SyncData = JSON.parse(decodedString);
        if (parsedData.name && Array.isArray(parsedData.tasks)) {
          setDataToImport(parsedData);
        } else {
          throw new Error("Invalid sync data structure.");
        }
      } catch (error) {
        console.error("Failed to parse sync data:", error);
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: "The sync link is invalid or corrupted.",
        });
      } finally {
        router.replace('/settings', { scroll: false });
      }
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (isImportDialogOpen) {
      const qrScanner = new Html5Qrcode('qr-code-reader');
      qrScannerRef.current = qrScanner;

      const startScanner = async () => {
        try {
          await qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              stopScanner();
              try {
                const url = new URL(decodedText);
                const syncDataRaw = url.searchParams.get('syncData');
                if (!syncDataRaw) throw new Error("No sync data in QR code.");
                const decodedString = atob(syncDataRaw);
                const parsedData: SyncData = JSON.parse(decodedString);
                 if (parsedData.name && Array.isArray(parsedData.tasks)) {
                   setDataToImport(parsedData);
                   setIsImportDialogOpen(false);
                 } else {
                   throw new Error("Invalid sync data structure in QR code.");
                 }
              } catch (err) {
                 toast({
                    variant: "destructive",
                    title: "Invalid QR Code",
                    description: "The scanned QR code does not contain valid sync data.",
                 });
              }
            },
            () => {}
          );
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Scanner Error",
            description: "Could not start scanner. Please check camera permissions.",
          });
          setIsImportDialogOpen(false);
        }
      };

      const stopScanner = () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop().catch(console.error);
        }
      };

      startScanner();
      return () => stopScanner();
    }
  }, [isImportDialogOpen, toast]);

  const handleNameSave = (newName: string) => {
    if (newName.trim()) {
      try {
        const trimmedName = newName.trim();
        localStorage.setItem('weedo-name', trimmedName);
        setName(trimmedName);
        setInitials(getInitials(trimmedName));
        toast({
          title: "Name Updated",
          description: "Your name has been successfully changed.",
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your name.",
        })
      }
    }
  };

  const handleUncompleteAll = () => {
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (storedTasks) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const uncompletedTasks = tasks.map(task => ({ ...task, completed: false }));
        localStorage.setItem('weedo-tasks', JSON.stringify(uncompletedTasks));
        toast({
            title: "Tasks Updated",
            description: "All tasks have been marked as incomplete.",
        });
      }
    } catch (error) {
      console.error("Could not update tasks", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update tasks.",
      })
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      localStorage.removeItem('weedo-tasks-initialized');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log out.",
      })
    }
  };
  
  const generateSyncUrl = (): string | null => {
     try {
      const storedName = localStorage.getItem('weedo-name');
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (!storedName || !storedTasks) {
        toast({
          variant: "destructive",
          title: "Cannot Sync",
          description: "No data found to sync.",
        });
        return null;
      }
      const data: SyncData = {
        name: storedName,
        tasks: JSON.parse(storedTasks),
      };
      const encodedData = btoa(JSON.stringify(data));
      return `${window.location.origin}/settings?syncData=${encodedData}`;
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate sync data.",
      });
      return null;
    }
  }

  const handleGenerateLinkClick = () => {
    const url = generateSyncUrl();
    if (url) {
        setSyncUrl(url);
        setIsLinkDialogOpen(true);
    }
  };

  const handleGenerateQRCodeClick = () => {
    const url = generateSyncUrl();
    if (url) {
        const QR_CODE_MAX_LENGTH = 2000;
        if (url.length > QR_CODE_MAX_LENGTH) {
            toast({
                variant: "destructive",
                title: "Data Too Large",
                description: "Your task list is too large for a QR code. Please use the link option instead.",
            });
        } else {
            setSyncUrl(url);
            setIsQRCodeDialogOpen(true);
        }
    }
  };

  const handleCopyLink = () => {
    if (!syncUrl) return;
    navigator.clipboard.writeText(syncUrl).then(() => {
      toast({ title: "Copied!", description: "Sync link copied to clipboard." });
    });
  };

  const handleConfirmImport = () => {
    if (!dataToImport) return;
    try {
      localStorage.setItem('weedo-name', dataToImport.name);
      localStorage.setItem('weedo-tasks', JSON.stringify(dataToImport.tasks));
      localStorage.setItem('weedo-tasks-initialized', 'true');
      toast({
        title: "Sync Complete!",
        description: "Your data has been imported successfully.",
      });
      setDataToImport(null);
      router.push('/');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not save the imported data.',
      });
       setDataToImport(null);
    }
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
                <motion.div
                  className="flex items-center cursor-pointer"
                  initial="rest"
                  whileHover="hover"
                  whileTap={{scale: 0.98}}
                >
                  <motion.div
                    variants={{ hover: { x: -4 }, rest: { x: 0 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="mr-2"
                  >
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
                                <PopoverBody>
                                    <PopoverInput placeholder="Enter your new name" />
                                </PopoverBody>
                                <PopoverFooter className="bg-transparent border-0 justify-end gap-2 p-3">
                                  <PopoverCloseButton asChild>
                                    <Button variant="ghost" type="button">Cancel</Button>
                                  </PopoverCloseButton>
                                  <PopoverSubmitButton>
                                    <Check className="h-4 w-4 mr-2" /> Save
                                  </PopoverSubmitButton>
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
                            <div>
                                <p>Mark All Incomplete</p>
                                <p className="text-xs text-muted-foreground font-normal">Reset the completion status of all tasks.</p>
                            </div>
                        </Button>
                        <Expandable expanded={openConfirmation === 'uncomplete'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                                      <div>
                                          <p className="font-semibold">Are you sure?</p>
                                          <p className="text-sm text-muted-foreground mt-1">This will mark all of your tasks as incomplete. This action cannot be undone.</p>
                                      </div>
                                  </div>
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
                            <div>
                               <p>Logout</p>
                               <p className="text-xs text-muted-foreground font-normal">This will clear your name and task data.</p>
                           </div>
                       </Button>
                        <Expandable expanded={openConfirmation === 'logout'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                                      <div>
                                          <p className="font-semibold">Are you sure you want to log out?</p>
                                          <p className="text-sm text-muted-foreground mt-1">This will permanently delete all your data. This action cannot be undone.</p>
                                      </div>
                                  </div>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Data Sync</h3>
                <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateLinkClick}>
                        <LinkIcon className="mr-3 h-5 w-5" />
                        <div>
                            <p>Generate Sync Link</p>
                            <p className="text-xs text-muted-foreground font-normal">Export your data via a shareable link.</p>
                        </div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateQRCodeClick}>
                        <QrCode className="mr-3 h-5 w-5" />
                        <div>
                            <p>Generate Sync QR Code</p>
                            <p className="text-xs text-muted-foreground font-normal">Export via a scannable QR code.</p>
                        </div>
                    </Button>
                     <Separator className="my-2"/>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => setIsImportDialogOpen(true)}>
                        <Camera className="mr-3 h-5 w-5" />
                        <div>
                            <p>Import From Another Device</p>
                            <p className="text-xs text-muted-foreground font-normal">Scan a QR code to import data.</p>
                        </div>
                    </Button>
                </div>
            </div>

        </div>
      </div>
      
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Sync via Link</DialogTitle>
                  <DialogDescription>
                      Copy and open this link on your other device to transfer your data.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 pt-4">
                  <Input value={syncUrl} readOnly />
                  <Button type="button" size="icon" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                       <span className="sr-only">Copy Link</span>
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Sync via QR Code</DialogTitle>
                  <DialogDescription>
                      Scan this QR code on your new device to transfer your data.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                  {syncUrl && <QRCode value={syncUrl} size={256} bgColor="var(--background)" fgColor="var(--foreground)" />}
              </div>
              <div className="flex items-center space-x-2">
                  <Input value={syncUrl} readOnly />
                  <Button type="button" size="icon" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                       <span className="sr-only">Copy Link</span>
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Sync To This Device</DialogTitle>
                  <DialogDescription>
                      Point your camera at the QR code from your other device.
                  </DialogDescription>
              </DialogHeader>
              <div id="qr-code-reader" className="w-full aspect-square rounded-md bg-muted mt-4 border" />
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!dataToImport} onOpenChange={(open) => !open && setDataToImport(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
                  <AlertDialogDescription>
                      You are about to import tasks for "{dataToImport?.name}". This will overwrite all current data on this device. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDataToImport(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmImport}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
}
