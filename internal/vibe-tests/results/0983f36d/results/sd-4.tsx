import {useState} from 'react';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {ScrollArea} from '@/components/ui/scroll-area';

const TERMS_TEXT = `Terms of Service

1. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by these terms.

2. Description of Service
We provide a platform for managing digital content including collaboration, storage, and sharing tools.

3. User Responsibilities
You are responsible for maintaining the confidentiality of your account credentials.

4. Privacy
Your use of the service is governed by our Privacy Policy.

5. Intellectual Property
All content and functionality are protected by intellectual property laws.

6. Limitation of Liability
We shall not be liable for indirect or consequential damages.

7. Termination
We reserve the right to terminate access for violations.

8. Governing Law
These terms are governed by the laws of the applicable jurisdiction.`;

export default function TermsAcceptanceForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canContinue = agreedToTerms && agreedToPrivacy;

  return (
    <div className="flex flex-col gap-4 p-6 max-w-xl">
      <h2 className="text-2xl font-bold">Terms and Conditions</h2>
      <p className="text-muted-foreground">Please read and accept the following terms to continue.</p>

      <ScrollArea className="h-72 border rounded-lg p-4">
        <p className="whitespace-pre-line text-sm">{TERMS_TEXT}</p>
      </ScrollArea>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(v === true)} />
          <Label htmlFor="terms">I agree to the Terms of Service</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="privacy" checked={agreedToPrivacy} onCheckedChange={(v) => setAgreedToPrivacy(v === true)} />
          <Label htmlFor="privacy">I agree to the Privacy Policy</Label>
        </div>
      </div>

      <Button disabled={!canContinue}>Continue</Button>
    </div>
  );
}
