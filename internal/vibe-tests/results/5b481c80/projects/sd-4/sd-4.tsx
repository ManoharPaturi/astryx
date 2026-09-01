import {useState} from 'react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  termsBox: {
    maxHeight: 300,
    overflowY: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
  },
});

const TERMS_TEXT = `Terms of Service

1. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by the terms and conditions outlined in this agreement.

2. Description of Service
We provide a platform for users to manage and organize their digital content. The service includes tools for collaboration, storage, and sharing.

3. User Responsibilities
You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your password with third parties.

4. Privacy
Your use of the service is also governed by our Privacy Policy. We collect and process personal data as described therein.

5. Intellectual Property
All content, features, and functionality of the service are owned by us and are protected by copyright, trademark, and other intellectual property laws.

6. Limitation of Liability
In no event shall we be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.

7. Termination
We reserve the right to terminate your access to the service at any time for violation of these terms.

8. Governing Law
These terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction.`;

export default function TermsAcceptanceForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canContinue = agreedToTerms && agreedToPrivacy;

  return (
    <VStack gap={4} padding={4} maxWidth={600}>
      <Heading level={2}>Terms and Conditions</Heading>
      <Text>Please read and accept the following terms to continue.</Text>

      <div {...stylex.props(styles.termsBox)}>
        <Text as="p">{TERMS_TEXT}</Text>
      </div>

      <VStack gap={2}>
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
      </VStack>

      <Button
        label="Continue"
        variant="primary"
        isDisabled={!canContinue}
      />
    </VStack>
  );
}
