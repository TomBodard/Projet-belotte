
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ValuesDialogProps {
  open: boolean;
  onClose: () => void;
  type: "normal" | "tasa";
}

const ValuesDialog: React.FC<ValuesDialogProps> = ({ open, onClose, type }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {type === "normal" ? "Valeurs normales" : "TA SA"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="w-full">
            {type === "normal" ? (
              <img 
                src="/lovable-uploads/696111e4-f1ea-4f59-8591-71380db9274a.png" 
                alt="Valeurs des cartes" 
                className="w-full h-auto rounded-md"
              />
              <AspectRatio ratio={4/3}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <p className="text-center">Valeurs TA SA</p>  
                </div>
              </AspectRatio>
              <></>
            ): null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValuesDialog;
