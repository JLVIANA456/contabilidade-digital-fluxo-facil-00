
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Verificar se já existe preferência salva
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode === 'true';
    setDarkMode(isDarkMode);
    
    // Aplicar o tema
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm dark:bg-black/95">
        <DialogHeader>
          <DialogTitle className="flex items-center font-sans text-gray-900 dark:text-red-500">
            <Settings className="h-5 w-5 mr-2 text-red-600" />
            Configurações
          </DialogTitle>
          <DialogDescription className="font-sans text-gray-600 dark:text-red-400">
            Personalize sua experiência no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md dark:from-black dark:to-gray-900 dark:border dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center font-sans text-gray-900 dark:text-red-500">
                {darkMode ? (
                  <Moon className="h-4 w-4 mr-2 text-red-600" />
                ) : (
                  <Sun className="h-4 w-4 mr-2 text-yellow-600" />
                )}
                Aparência
              </CardTitle>
              <CardDescription className="font-sans text-gray-600 dark:text-red-400">
                Escolha entre o tema claro ou escuro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="font-sans text-gray-900 dark:text-red-500">
                  Modo Escuro
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
