
import BeloteApp from "@/components/BeloteApp";
import { Card } from "@/components/ui/card";

export default function Index() {
  return (
    <>
      <div className="flex justify-center mb-6">
        <img 
          src="/lovable-uploads/88d78836-a013-4b12-bd37-dea6ec9e1b44.png" 
          alt="ALIRABCC" 
          className="h-28 w-auto" 
        />
      </div>
      <BeloteApp />
    </>
  );
}
