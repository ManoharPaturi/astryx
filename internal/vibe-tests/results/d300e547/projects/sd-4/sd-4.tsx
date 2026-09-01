import {useState} from 'react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

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
We shall not be liable for indirect or consequential damages arising from service use.

7. Termination
We reserve the right to terminate access for violations of these terms.

8. Governing Law
These terms are governed by the laws of the applicable jurisdiction.`;

export default function TermsAcceptanceForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canContinue = agreedToTerms && agreedToPrivacy;

  return (
    <div className="flex flex-col gap-4 p-6 max-w-xl">
      <Heading level={2}>Terms and Conditions</Heading>
      <Text>Please read and accept the following terms to continue.</Text>

      <div className="max-h-72 overflow-y-auto border border-gray-300 rounded-lg p-4">
        <Text as="p">{TERMS_TEXT}</Text>
      </div>

      <div className="flex flex-col gap-2">
        <CheckboxInput
          label="I agree to the Terms of Service"
          value={agreedToTerms}
          onChange={(checked) => setAgreedToTerms(checked)}
        />
        <CheckboxInput
          label="I agree to the Privacy Policy"
          value={agreedToPrivacy}
          onChange={(checked) => setAgreedToPrivacy(checked)}
        />
      </div>

      <Button label="Continue" variant="primary" isDisabled={!canContinue} />
    </div>
  );
}
