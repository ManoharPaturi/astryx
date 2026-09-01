import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';

const steps = ['Welcome', 'Profile', 'Preferences', 'Done'];

export default function OnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= activeStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            <span className="text-xs text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>

      {activeStep === 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Welcome!</h2>
          <p className="text-muted-foreground">Let us get you set up. This will only take a minute.</p>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Profile Setup</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Preferences</h2>
          <div className="flex items-center space-x-2">
            <Checkbox id="dark" checked={darkMode} onCheckedChange={(v) => setDarkMode(v === true)} />
            <Label htmlFor="dark">Enable dark mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="notif" checked={notifications} onCheckedChange={(v) => setNotifications(v === true)} />
            <Label htmlFor="notif">Email notifications</Label>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Set!</h2>
          <p className="text-muted-foreground">Your account is ready. Welcome aboard, {name || 'friend'}!</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {activeStep > 0 && activeStep < 3 && (
          <Button variant="ghost" onClick={handleBack}>Back</Button>
        )}
        {activeStep < 3 && (
          <Button onClick={handleNext}>{activeStep === 0 ? 'Get Started' : 'Next'}</Button>
        )}
      </div>
    </div>
  );
}
