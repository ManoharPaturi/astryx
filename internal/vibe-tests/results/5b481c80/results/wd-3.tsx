import {useState} from 'react';
import {Stepper} from '@astryxdesign/core/Stepper';
import {Step} from '@astryxdesign/core/Stepper';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

export default function OnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <VStack gap={6} padding={4} maxWidth={600}>
      <Stepper activeStep={activeStep}>
        <Step step={0} label="Welcome" />
        <Step step={1} label="Profile" />
        <Step step={2} label="Preferences" />
        <Step step={3} label="Done" />
      </Stepper>

      {activeStep === 0 && (
        <VStack gap={4}>
          <Heading level={2}>Welcome!</Heading>
          <Text>Let us get you set up. This will only take a minute.</Text>
        </VStack>
      )}

      {activeStep === 1 && (
        <VStack gap={4}>
          <Heading level={2}>Profile Setup</Heading>
          <TextInput label="Name" value={name} onChange={setName} isRequired />
          <TextInput label="Email" value={email} onChange={setEmail} type="email" isRequired />
        </VStack>
      )}

      {activeStep === 2 && (
        <VStack gap={4}>
          <Heading level={2}>Preferences</Heading>
          <CheckboxInput
            label="Enable dark mode"
            value={darkMode}
            onChange={(checked) => setDarkMode(checked)}
          />
          <CheckboxInput
            label="Email notifications"
            value={notifications}
            onChange={(checked) => setNotifications(checked)}
          />
        </VStack>
      )}

      {activeStep === 3 && (
        <VStack gap={4}>
          <Heading level={2}>All Set!</Heading>
          <Text>Your account is ready. Welcome aboard, {name || 'friend'}!</Text>
        </VStack>
      )}

      <HStack gap={2} hAlign="end">
        {activeStep > 0 && activeStep < 3 && (
          <Button label="Back" variant="ghost" onClick={handleBack} />
        )}
        {activeStep < 3 && (
          <Button label={activeStep === 0 ? 'Get Started' : 'Next'} variant="primary" onClick={handleNext} />
        )}
      </HStack>
    </VStack>
  );
}
